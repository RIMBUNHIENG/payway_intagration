import stripe from '../config/stripe.js';
import { Payment, Customer, Refund  } from '../models/index.js';

class PaymentController {
    // Create Payment Intent
    async createPaymentIntent(req, res, next) {
        try {
            const {
                amount,
                currency = 'usd',
                description,
                email,
                metadata = {}
            } = req.body;

            // Validate amount
            if (!amount || amount <= 0) {
                return res.status(400).json({
                    error: 'Invalid amount. Amount must be greater than 0.'
                });
            }

            let customer = null;
            let stripeCustomerId = null;

            // Find or create customer if email provided
            if (email) {
                customer = await Customer.findOne({ where: { email } });

                if (!customer) {
                    const stripeCustomer = await stripe.customers.create({ email });
                    customer = await Customer.create({
                        stripeCustomerId: stripeCustomer.id,
                        email: email
                    });
                }
                stripeCustomerId = customer.stripeCustomerId;
            }

            // Create Payment Intent in Stripe
            const paymentIntentData = {
                amount: Math.round(amount),
                currency: currency.toLowerCase(),
                description: description || 'Payment',
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString()
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            };

            if (stripeCustomerId) {
                paymentIntentData.customer = stripeCustomerId;
            }

            const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

            // Save to database
            const payment = await Payment.create({
                stripePaymentIntentId: paymentIntent.id,
                customerId: customer ? customer.id : null,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                description: description,
                receiptEmail: email,
                metadata: metadata
            });

            res.json({
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                paymentId: payment.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency
            });
        } catch (error) {
            next(error);
        }
    }

    // Get Payment Intent
    async getPaymentIntent(req, res, next) {
        try {
            const payment = await Payment.findOne({
                where: { stripePaymentIntentId: req.params.id },
                include: [
                    {
                        model: Customer,
                        as: 'customer',
                        attributes: ['id', 'email', 'name']
                    },
                    {
                        model: Refund,
                        as: 'refunds'
                    }
                ]
            });

            if (!payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }

            res.json({
                success: true,
                payment: payment
            });
        } catch (error) {
            next(error);
        }
    }

    // Confirm Payment Intent
    async confirmPaymentIntent(req, res, next) {
        try {
            const { paymentIntentId, paymentMethodId } = req.body;

            if (!paymentIntentId || !paymentMethodId) {
                return res.status(400).json({
                    error: 'Payment Intent ID and Payment Method ID are required'
                });
            }

            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId,
            });

            // Update database
            await Payment.update(
                {
                    status: paymentIntent.status,
                    paymentMethod: paymentIntent.payment_method,
                    paidAt: paymentIntent.status === 'succeeded' ? new Date() : null
                },
                { where: { stripePaymentIntentId: paymentIntentId } }
            );

            res.json({
                success: true,
                paymentIntent: {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency
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

            if (!paymentIntentId) {
                return res.status(400).json({ error: 'Payment Intent ID is required' });
            }

            const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

            // Update database
            await Payment.update(
                { status: 'canceled' },
                { where: { stripePaymentIntentId: paymentIntentId } }
            );

            res.json({
                success: true,
                message: 'Payment intent cancelled',
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status
            });
        } catch (error) {
            next(error);
        }
    }

    // Create Refund
    async createRefund(req, res, next) {
        try {
            const { paymentIntentId, amount, reason } = req.body;

            if (!paymentIntentId) {
                return res.status(400).json({ error: 'Payment Intent ID is required' });
            }

            // Find payment in database
            const payment = await Payment.findOne({
                where: { stripePaymentIntentId: paymentIntentId }
            });

            if (!payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }

            const refundData = {
                payment_intent: paymentIntentId,
            };

            if (amount) {
                refundData.amount = Math.round(amount);
            }

            if (reason) {
                refundData.reason = reason;
            }

            const refund = await stripe.refunds.create(refundData);

            // Save to database
            const refundRecord = await Refund.create({
                stripeRefundId: refund.id,
                paymentId: payment.id,
                amount: refund.amount,
                currency: refund.currency,
                reason: refund.reason,
                status: refund.status,
                refundedAt: refund.status === 'succeeded' ? new Date() : null
            });

            res.json({
                success: true,
                refund: {
                    id: refund.id,
                    refundId: refundRecord.id,
                    amount: refund.amount,
                    currency: refund.currency,
                    status: refund.status,
                    reason: refund.reason
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // List Payments
    async listPayments(req, res, next) {
        try {
            const { limit = 10, page = 1, status, customerId } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if (status) where.status = status;
            if (customerId) where.customerId = customerId;

            const { count, rows } = await Payment.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: offset,
                include: [
                    {
                        model: Customer,
                        as: 'customer',
                        attributes: ['id', 'email', 'name']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                payments: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new PaymentController();
