import cron from 'node-cron';
import { Op } from 'sequelize';
import { Subscription, SubscriptionPlan, User } from '../models/index.js';

/**
 * Check for expiring subscriptions and send reminders
 * Runs daily at 9:00 AM
 */
const checkExpiringSubscriptions = cron.schedule('0 9 * * *', async () => {
    try {
        console.log('🔍 Checking for expiring subscriptions...');

        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const now = new Date();

        // Find subscriptions expiring in 3 days
        const expiringSubscriptions = await Subscription.findAll({
            where: {
                end_date: {
                    [Op.between]: [now, threeDaysFromNow]
                }
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'email']
                },
                {
                    model: SubscriptionPlan,
                    as: 'subscriptionPlan',
                    attributes: ['subscription_Plan_id', 'name', 'price']
                }
            ]
        });

        console.log(`📧 Found ${expiringSubscriptions.length} subscriptions expiring soon`);

        for (const subscription of expiringSubscriptions) {
            const daysRemaining = Math.ceil((subscription.end_date - now) / (1000 * 60 * 60 * 24));
            console.log(`📬 Subscription ${subscription.subscription_id} for ${subscription.user.email} expires in ${daysRemaining} days (${subscription.subscriptionPlan.name})`);
            // Here you would send an email to subscription.user.email
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

        const now = new Date();

        // Find subscriptions that have passed their end date
        const expiredSubscriptions = await Subscription.findAll({
            where: {
                end_date: {
                    [Op.lt]: now
                }
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'email']
                },
                {
                    model: SubscriptionPlan,
                    as: 'subscriptionPlan',
                    attributes: ['subscription_Plan_id', 'name']
                }
            ]
        });

        console.log(`⏰ Found ${expiredSubscriptions.length} expired subscriptions`);

        for (const subscription of expiredSubscriptions) {
            console.log(`✅ Subscription ${subscription.subscription_id} for user ${subscription.user.email} has expired`);
            // You could send a notification email here if needed
        }

    } catch (error) {
        console.error('❌ Error checking expired subscriptions:', error);
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
    console.log('✅ All subscription cron jobs started');
};

/**
 * Stop all cron jobs
 */
const stopAllJobs = () => {
    console.log('🛑 Stopping subscription cron jobs...');
    checkExpiringSubscriptions.stop();
    checkExpiredSubscriptions.stop();
    console.log('✅ All subscription cron jobs stopped');
};

export {
    startAllJobs,
    stopAllJobs,
    checkExpiringSubscriptions,
    checkExpiredSubscriptions
};
