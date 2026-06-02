const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const { validateCheckoutSession } = require('../middleware/validation');

// Create Checkout Session
router.post('/create-checkout-session', validateCheckoutSession, async (req, res, next) => {
    try {
        const {
            priceId,
            successUrl,
            cancelUrl,
            mode = 'payment',
            quantity = 1,
            customerId,
            metadata = {}
        } = req.body;

        const sessionData = {
            mode: mode, // 'payment', 'subscription', or 'setup'
            line_items: [
                {
                    price: priceId,
                    quantity: quantity,
                },
            ],
            success_url: successUrl || `${req.headers.origin || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:3000'}/cancel`,
            metadata: metadata
        };

        // Attach customer if provided
        if (customerId) {
            sessionData.customer = customerId;
        }

        const session = await stripe.checkout.sessions.create(sessionData);

        res.json({
            success: true,
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        next(error);
    }
});

// Retrieve Checkout Session
router.get('/checkout-session/:id', async (req, res, next) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.id);

        res.json({
            success: true,
            session: {
                id: session.id,
                status: session.status,
                payment_status: session.payment_status,
                amount_total: session.amount_total,
                currency: session.currency,
                customer: session.customer,
                payment_intent: session.payment_intent
            }
        });
    } catch (error) {
        next(error);
    }
});

// List Checkout Sessions
router.get('/checkout-sessions', async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const sessions = await stripe.checkout.sessions.list({
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            sessions: sessions.data
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
