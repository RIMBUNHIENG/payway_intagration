// Validation middleware for request data
const validatePaymentIntent = (req, res, next) => {
    const { amount, currency } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({
            error: 'Invalid amount. Amount must be greater than 0.'
        });
    }

    if (currency && !/^[a-z]{3}$/.test(currency)) {
        return res.status(400).json({
            error: 'Invalid currency. Must be a 3-letter ISO code (e.g., usd, eur).'
        });
    }

    next();
};

const validateCheckoutSession = (req, res, next) => {
    const { priceId } = req.body;

    if (!priceId) {
        return res.status(400).json({
            error: 'Price ID is required.'
        });
    }

    next();
};

const validateCustomer = (req, res, next) => {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            error: 'Valid email address is required.'
        });
    }

    next();
};

const validateRefund = (req, res, next) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
        return res.status(400).json({
            error: 'Payment Intent ID is required.'
        });
    }

    next();
};

module.exports = {
    validatePaymentIntent,
    validateCheckoutSession,
    validateCustomer,
    validateRefund
};
