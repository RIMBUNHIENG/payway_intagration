import stripe from '../config/stripe.js';

class PaymentController {
    // Create Payment Intent for subscription
    async createPaymentIntent(req, res, next) {
        try {
            const { amount, currency = 'usd', subscription_Plan_id } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).json({
                    error: 'Invalid amount'
                });
            }

            // Create payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    subscription_Plan_id: subscription_Plan_id || '',
                    user_id: req.userId || ''
                }
            });

            res.json({
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            });
        } catch (error) {
            console.error('Create payment intent error:', error);
            next(error);
        }
    }

    // Get Payment Intent
    async getPaymentIntent(req, res, next) {
        try {
            const { id } = req.params;

            const paymentIntent = await stripe.paymentIntents.retrieve(id);

            res.json({
                success: true,
                paymentIntent: {
                    id: paymentIntent.id,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    status: paymentIntent.status,
                    client_secret: paymentIntent.client_secret
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Confirm Payment Intent (server-side)
    async confirmPaymentIntent(req, res, next) {
        try {
            const { paymentIntentId, paymentMethodId } = req.body;

            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId
            });

            res.json({
                success: true,
                paymentIntent: {
                    id: paymentIntent.id,
                    status: paymentIntent.status
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Cancel Payment Intent
    async cancelPaymentIntent(req, res, next) {
        try {
            const { paymentIntentId } = req.body;

            const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

            res.json({
                success: true,
                paymentIntent: {
                    id: paymentIntent.id,
                    status: paymentIntent.status
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Create Refund
    async createRefund(req, res, next) {
        try {
            const { paymentIntentId, amount } = req.body;

            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined
            });

            res.json({
                success: true,
                refund: {
                    id: refund.id,
                    amount: refund.amount,
                    status: refund.status
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // List payments
    async listPayments(req, res, next) {
        try {
            const { limit = 10 } = req.query;

            const paymentIntents = await stripe.paymentIntents.list({
                limit: parseInt(limit)
            });

            res.json({
                success: true,
                paymentIntents: paymentIntents.data
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new PaymentController();
