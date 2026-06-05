import stripe from '../config/stripe.js';
import {
    Payment,
    Customer,
    Subscription,
    Refund,
    WebhookEvent,
    UserSubscription,
    SubscriptionHistory,
    User
} from '../models/index.js';

class WebhookController {
    async handleWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('⚠️  Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Log webhook event to database
        const webhookRecord = await WebhookEvent.create({
            stripeEventId: event.id,
            type: event.type,
            data: event.data.object
        });

        try {
            // Handle the event
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentIntentSucceeded(event.data.object);
                    break;

                case 'payment_intent.payment_failed':
                    await this.handlePaymentIntentFailed(event.data.object);
                    break;

                case 'payment_intent.canceled':
                    await this.handlePaymentIntentCanceled(event.data.object);
                    break;

                case 'charge.refunded':
                    await this.handleChargeRefunded(event.data.object);
                    break;

                case 'customer.created':
                    await this.handleCustomerCreated(event.data.object);
                    break;

                case 'customer.updated':
                    await this.handleCustomerUpdated(event.data.object);
                    break;

                case 'customer.subscription.created':
                    await this.handleSubscriptionUpdated(event.data.object);
                    await this.handleUserSubscriptionCreated(event.data.object);
                    break;

                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdated(event.data.object);
                    await this.handleUserSubscriptionUpdated(event.data.object);
                    break;

                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object);
                    await this.handleUserSubscriptionDeleted(event.data.object);
                    break;

                case 'invoice.payment_succeeded':
                    await this.handleInvoicePaymentSucceeded(event.data.object);
                    break;

                case 'invoice.payment_failed':
                    await this.handleInvoicePaymentFailed(event.data.object);
                    break;

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            // Mark webhook as processed
            await webhookRecord.update({
                processed: true,
                processedAt: new Date()
            });

            res.json({ received: true, eventType: event.type });
        } catch (error) {
            console.error('Error processing webhook:', error);

            // Log error in webhook record
            await webhookRecord.update({
                errorMessage: error.message
            });

            res.status(500).json({ error: 'Webhook processing failed' });
        }
    }

    // Payment Intent Succeeded
    async handlePaymentIntentSucceeded(paymentIntent) {
        console.log('✅ PaymentIntent succeeded:', paymentIntent.id);

        await Payment.update(
            {
                status: 'succeeded',
                chargeId: paymentIntent.charges.data[0]?.id,
                paidAt: new Date()
            },
            {
                where: { stripePaymentIntentId: paymentIntent.id }
            }
        );
    }

    // Payment Intent Failed
    async handlePaymentIntentFailed(paymentIntent) {
        console.log('❌ Payment failed:', paymentIntent.id);

        await Payment.update(
            {
                status: paymentIntent.status,
                errorMessage: paymentIntent.last_payment_error?.message
            },
            {
                where: { stripePaymentIntentId: paymentIntent.id }
            }
        );
    }

    // Payment Intent Canceled
    async handlePaymentIntentCanceled(paymentIntent) {
        console.log('🚫 Payment canceled:', paymentIntent.id);

        await Payment.update(
            { status: 'canceled' },
            { where: { stripePaymentIntentId: paymentIntent.id } }
        );
    }

    // Charge Refunded
    async handleChargeRefunded(charge) {
        console.log('💰 Charge refunded:', charge.id);

        const payment = await Payment.findOne({
            where: { chargeId: charge.id }
        });

        if (payment && charge.refunds.data.length > 0) {
            for (const refundData of charge.refunds.data) {
                await Refund.findOrCreate({
                    where: { stripeRefundId: refundData.id },
                    defaults: {
                        paymentId: payment.id,
                        amount: refundData.amount,
                        currency: refundData.currency,
                        reason: refundData.reason,
                        status: refundData.status,
                        refundedAt: new Date(refundData.created * 1000)
                    }
                });
            }
        }
    }

    // Customer Created
    async handleCustomerCreated(customer) {
        console.log('👤 Customer created:', customer.id);

        await Customer.findOrCreate({
            where: { stripeCustomerId: customer.id },
            defaults: {
                email: customer.email,
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
                metadata: customer.metadata
            }
        });
    }

    // Customer Updated
    async handleCustomerUpdated(customer) {
        console.log('👤 Customer updated:', customer.id);

        await Customer.update(
            {
                email: customer.email,
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
                metadata: customer.metadata
            },
            {
                where: { stripeCustomerId: customer.id }
            }
        );
    }

    // Subscription Updated
    async handleSubscriptionUpdated(subscription) {
        console.log('🔄 Subscription updated:', subscription.id);

        const customer = await Customer.findOne({
            where: { stripeCustomerId: subscription.customer }
        });

        if (!customer) return;

        await Subscription.upsert({
            stripeSubscriptionId: subscription.id,
            customerId: customer.id,
            priceId: subscription.items.data[0]?.price.id,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
            trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            metadata: subscription.metadata
        });
    }

    // Subscription Deleted
    async handleSubscriptionDeleted(subscription) {
        console.log('🔄 Subscription deleted:', subscription.id);

        await Subscription.update(
            {
                status: 'canceled',
                canceledAt: new Date()
            },
            {
                where: { stripeSubscriptionId: subscription.id }
            }
        );
    }

    // User Subscription Created (from webhook)
    async handleUserSubscriptionCreated(subscription) {
        console.log('✅ User subscription created:', subscription.id);

        const userSubscription = await UserSubscription.findOne({
            where: { stripe_subscription_id: subscription.id }
        });

        if (userSubscription) {
            await SubscriptionHistory.create({
                subscription_id: userSubscription.id,
                user_id: userSubscription.user_id,
                plan_id: userSubscription.plan_id,
                action: 'webhook_subscription_created',
                status_from: null,
                status_to: subscription.status,
                details: {
                    stripe_subscription_id: subscription.id,
                    webhook_timestamp: new Date()
                }
            });
        }
    }

    // User Subscription Updated (from webhook)
    async handleUserSubscriptionUpdated(subscription) {
        console.log('🔄 User subscription updated:', subscription.id);

        const userSubscription = await UserSubscription.findOne({
            where: { stripe_subscription_id: subscription.id }
        });

        if (userSubscription) {
            const oldStatus = userSubscription.status;
            const newStatus = subscription.status;

            // Update local subscription
            await userSubscription.update({
                status: newStatus,
                current_period_start: new Date(subscription.current_period_start * 1000),
                current_period_end: new Date(subscription.current_period_end * 1000),
                cancel_at_period_end: subscription.cancel_at_period_end,
                canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null
            });

            // Log history if status changed
            if (oldStatus !== newStatus) {
                await SubscriptionHistory.create({
                    subscription_id: userSubscription.id,
                    user_id: userSubscription.user_id,
                    plan_id: userSubscription.plan_id,
                    action: 'webhook_status_updated',
                    status_from: oldStatus,
                    status_to: newStatus,
                    details: {
                        stripe_subscription_id: subscription.id,
                        cancel_at_period_end: subscription.cancel_at_period_end,
                        webhook_timestamp: new Date()
                    }
                });
            }
        }
    }

    // User Subscription Deleted (from webhook)
    async handleUserSubscriptionDeleted(subscription) {
        console.log('🗑️ User subscription deleted:', subscription.id);

        const userSubscription = await UserSubscription.findOne({
            where: { stripe_subscription_id: subscription.id }
        });

        if (userSubscription) {
            const oldStatus = userSubscription.status;

            await userSubscription.update({
                status: 'canceled',
                canceled_at: new Date()
            });

            await SubscriptionHistory.create({
                subscription_id: userSubscription.id,
                user_id: userSubscription.user_id,
                plan_id: userSubscription.plan_id,
                action: 'webhook_subscription_deleted',
                status_from: oldStatus,
                status_to: 'canceled',
                details: {
                    stripe_subscription_id: subscription.id,
                    canceled_at: new Date(),
                    webhook_timestamp: new Date()
                }
            });
        }
    }

    // Invoice Payment Succeeded
    async handleInvoicePaymentSucceeded(invoice) {
        console.log('✅ Invoice payment succeeded:', invoice.id);

        if (invoice.subscription) {
            const userSubscription = await UserSubscription.findOne({
                where: { stripe_subscription_id: invoice.subscription }
            });

            if (userSubscription) {
                await SubscriptionHistory.create({
                    subscription_id: userSubscription.id,
                    user_id: userSubscription.user_id,
                    plan_id: userSubscription.plan_id,
                    action: 'payment_succeeded',
                    status_from: userSubscription.status,
                    status_to: userSubscription.status,
                    details: {
                        invoice_id: invoice.id,
                        amount_paid: invoice.amount_paid,
                        currency: invoice.currency,
                        period_start: new Date(invoice.period_start * 1000),
                        period_end: new Date(invoice.period_end * 1000),
                        webhook_timestamp: new Date()
                    }
                });
            }
        }
    }

    // Invoice Payment Failed
    async handleInvoicePaymentFailed(invoice) {
        console.log('❌ Invoice payment failed:', invoice.id);

        if (invoice.subscription) {
            const userSubscription = await UserSubscription.findOne({
                where: { stripe_subscription_id: invoice.subscription }
            });

            if (userSubscription) {
                const oldStatus = userSubscription.status;

                // Update status to past_due
                await userSubscription.update({
                    status: 'past_due'
                });

                await SubscriptionHistory.create({
                    subscription_id: userSubscription.id,
                    user_id: userSubscription.user_id,
                    plan_id: userSubscription.plan_id,
                    action: 'payment_failed',
                    status_from: oldStatus,
                    status_to: 'past_due',
                    details: {
                        invoice_id: invoice.id,
                        amount_due: invoice.amount_due,
                        currency: invoice.currency,
                        attempt_count: invoice.attempt_count,
                        next_payment_attempt: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null,
                        webhook_timestamp: new Date()
                    }
                });
            }
        }
    }
}

export default new WebhookController();
