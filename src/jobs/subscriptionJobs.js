import cron from 'node-cron';
import { Op } from 'sequelize';
import { UserSubscription, SubscriptionHistory, User, SubscriptionPlan } from '../models/index.js';
import stripe from '../config/stripe.js';

/**
 * Check for expiring subscriptions and send reminders
 * Runs daily at 9:00 AM
 */
const checkExpiringSubscriptions = cron.schedule('0 9 * * *', async () => {
    try {
        console.log('🔍 Checking for expiring subscriptions...');

        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        // Find subscriptions expiring in 3 days
        const expiringSubscriptions = await UserSubscription.findAll({
            where: {
                status: 'active',
                cancel_at_period_end: true,
                current_period_end: {
                    [Op.between]: [new Date(), threeDaysFromNow]
                }
            },
            include: [
                { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
                { model: SubscriptionPlan, as: 'plan', attributes: ['id', 'name', 'price'] }
            ]
        });

        console.log(`📧 Found ${expiringSubscriptions.length} subscriptions expiring soon`);

        for (const subscription of expiringSubscriptions) {
            // Log reminder in history
            await SubscriptionHistory.create({
                subscription_id: subscription.id,
                user_id: subscription.user_id,
                plan_id: subscription.plan_id,
                action: 'expiration_reminder_sent',
                status_from: subscription.status,
                status_to: subscription.status,
                details: {
                    expiration_date: subscription.current_period_end,
                    days_remaining: Math.ceil((subscription.current_period_end - new Date()) / (1000 * 60 * 60 * 24))
                }
            });

            // Here you would send an email to subscription.user.email
            console.log(`📬 Reminder sent to ${subscription.user.email} - Subscription expires ${subscription.current_period_end}`);
        }

    } catch (error) {
        console.error('❌ Error checking expiring subscriptions:', error);
    }
}, {
    scheduled: false // Don't start automatically
});

/**
 * Check and update expired subscriptions
 * Runs daily at 1:00 AM
 */
const checkExpiredSubscriptions = cron.schedule('0 1 * * *', async () => {
    try {
        console.log('🔍 Checking for expired subscriptions...');

        // Find subscriptions that have passed their end date
        const expiredSubscriptions = await UserSubscription.findAll({
            where: {
                status: {
                    [Op.in]: ['active', 'past_due']
                },
                current_period_end: {
                    [Op.lt]: new Date()
                },
                cancel_at_period_end: true
            },
            include: [
                { model: User, as: 'user', attributes: ['id', 'email', 'first_name'] },
                { model: SubscriptionPlan, as: 'plan', attributes: ['id', 'name'] }
            ]
        });

        console.log(`⏰ Found ${expiredSubscriptions.length} expired subscriptions`);

        for (const subscription of expiredSubscriptions) {
            const oldStatus = subscription.status;

            // Verify status with Stripe
            let stripeStatus = 'canceled';
            try {
                const stripeSubscription = await stripe.subscriptions.retrieve(
                    subscription.stripe_subscription_id
                );
                stripeStatus = stripeSubscription.status;
            } catch (err) {
                console.error(`Error fetching Stripe subscription ${subscription.stripe_subscription_id}:`, err.message);
            }

            // Update local subscription
            await subscription.update({
                status: stripeStatus,
                canceled_at: new Date()
            });

            // Log in history
            await SubscriptionHistory.create({
                subscription_id: subscription.id,
                user_id: subscription.user_id,
                plan_id: subscription.plan_id,
                action: 'expired',
                status_from: oldStatus,
                status_to: stripeStatus,
                details: {
                    expired_at: new Date(),
                    period_end: subscription.current_period_end
                }
            });

            console.log(`✅ Subscription ${subscription.id} marked as ${stripeStatus}`);
        }

    } catch (error) {
        console.error('❌ Error checking expired subscriptions:', error);
    }
}, {
    scheduled: false
});

/**
 * Sync subscription statuses with Stripe
 * Runs every 6 hours
 */
const syncSubscriptionStatuses = cron.schedule('0 */6 * * *', async () => {
    try {
        console.log('🔄 Syncing subscription statuses with Stripe...');

        const activeSubscriptions = await UserSubscription.findAll({
            where: {
                status: {
                    [Op.in]: ['active', 'past_due', 'trialing']
                },
                stripe_subscription_id: {
                    [Op.ne]: null
                }
            }
        });

        console.log(`🔄 Syncing ${activeSubscriptions.length} subscriptions with Stripe`);

        let syncedCount = 0;
        let updatedCount = 0;

        for (const subscription of activeSubscriptions) {
            try {
                const stripeSubscription = await stripe.subscriptions.retrieve(
                    subscription.stripe_subscription_id
                );

                const needsUpdate =
                    subscription.status !== stripeSubscription.status ||
                    subscription.cancel_at_period_end !== stripeSubscription.cancel_at_period_end;

                if (needsUpdate) {
                    const oldStatus = subscription.status;

                    await subscription.update({
                        status: stripeSubscription.status,
                        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
                        current_period_start: new Date(stripeSubscription.current_period_start * 1000),
                        current_period_end: new Date(stripeSubscription.current_period_end * 1000),
                    });

                    // Log status change
                    await SubscriptionHistory.create({
                        subscription_id: subscription.id,
                        user_id: subscription.user_id,
                        plan_id: subscription.plan_id,
                        action: 'status_synced',
                        status_from: oldStatus,
                        status_to: stripeSubscription.status,
                        details: {
                            synced_at: new Date(),
                            stripe_status: stripeSubscription.status
                        }
                    });

                    updatedCount++;
                }

                syncedCount++;

            } catch (err) {
                console.error(`Error syncing subscription ${subscription.id}:`, err.message);
            }
        }

        console.log(`✅ Synced ${syncedCount} subscriptions, ${updatedCount} updated`);

    } catch (error) {
        console.error('❌ Error syncing subscription statuses:', error);
    }
}, {
    scheduled: false
});

/**
 * Handle failed payment retries
 * Runs daily at 2:00 AM
 */
const handleFailedPayments = cron.schedule('0 2 * * *', async () => {
    try {
        console.log('🔍 Checking for failed payment retries...');

        const pastDueSubscriptions = await UserSubscription.findAll({
            where: {
                status: 'past_due'
            },
            include: [
                { model: User, as: 'user', attributes: ['id', 'email', 'first_name'] },
                { model: SubscriptionPlan, as: 'plan', attributes: ['id', 'name'] }
            ]
        });

        console.log(`💳 Found ${pastDueSubscriptions.length} past due subscriptions`);

        for (const subscription of pastDueSubscriptions) {
            // Stripe automatically handles retry logic
            // We just need to sync the status
            try {
                const stripeSubscription = await stripe.subscriptions.retrieve(
                    subscription.stripe_subscription_id
                );

                if (stripeSubscription.status !== subscription.status) {
                    const oldStatus = subscription.status;

                    await subscription.update({
                        status: stripeSubscription.status
                    });

                    await SubscriptionHistory.create({
                        subscription_id: subscription.id,
                        user_id: subscription.user_id,
                        plan_id: subscription.plan_id,
                        action: 'payment_retry_checked',
                        status_from: oldStatus,
                        status_to: stripeSubscription.status,
                        details: {
                            checked_at: new Date(),
                            stripe_status: stripeSubscription.status
                        }
                    });

                    console.log(`✅ Subscription ${subscription.id} status updated: ${oldStatus} → ${stripeSubscription.status}`);
                }

            } catch (err) {
                console.error(`Error checking subscription ${subscription.id}:`, err.message);
            }
        }

    } catch (error) {
        console.error('❌ Error handling failed payments:', error);
    }
}, {
    scheduled: false
});

/**
 * Start all cron jobs
 */
const startAllJobs = () => {
    console.log('🚀 Starting subscription cron jobs...');
    checkExpiringSubscriptions.start();
    checkExpiredSubscriptions.start();
    syncSubscriptionStatuses.start();
    handleFailedPayments.start();
    console.log('✅ All subscription cron jobs started');
};

/**
 * Stop all cron jobs
 */
const stopAllJobs = () => {
    console.log('🛑 Stopping subscription cron jobs...');
    checkExpiringSubscriptions.stop();
    checkExpiredSubscriptions.stop();
    syncSubscriptionStatuses.stop();
    handleFailedPayments.stop();
    console.log('✅ All subscription cron jobs stopped');
};

export {
    startAllJobs,
    stopAllJobs,
    checkExpiringSubscriptions,
    checkExpiredSubscriptions,
    syncSubscriptionStatuses,
    handleFailedPayments
};
