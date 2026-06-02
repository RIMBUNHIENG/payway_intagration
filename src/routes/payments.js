const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { validatePaymentIntent, validateRefund } = require('../middleware/validation');

// Create Payment Intent
router.post('/create-payment-intent', validatePaymentIntent, PaymentController.createPaymentIntent.bind(PaymentController));

// Retrieve Payment Intent
router.get('/payment-intent/:id', PaymentController.getPaymentIntent.bind(PaymentController));

// Confirm Payment Intent (server-side)
router.post('/confirm-payment-intent', PaymentController.confirmPaymentIntent.bind(PaymentController));

// Cancel Payment Intent
router.post('/cancel-payment-intent', PaymentController.cancelPaymentIntent.bind(PaymentController));

// Create Refund
router.post('/refund', validateRefund, PaymentController.createRefund.bind(PaymentController));

// List all Payment Intents (with pagination)
router.get('/', PaymentController.listPayments.bind(PaymentController));

module.exports = router;
