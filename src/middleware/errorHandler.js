// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Stripe specific errors
    if (err.type === 'StripeCardError') {
        return res.status(400).json({
            error: 'Card error',
            message: err.message
        });
    }

    if (err.type === 'StripeInvalidRequestError') {
        return res.status(400).json({
            error: 'Invalid request',
            message: err.message
        });
    }

    if (err.type === 'StripeAPIError') {
        return res.status(500).json({
            error: 'Stripe API error',
            message: 'An error occurred with the payment provider'
        });
    }

    if (err.type === 'StripeConnectionError') {
        return res.status(503).json({
            error: 'Connection error',
            message: 'Unable to connect to payment provider'
        });
    }

    // Generic error
    res.status(err.status || 500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

module.exports = errorHandler;
