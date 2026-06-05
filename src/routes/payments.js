import express from 'express';
const router = express.Router();
import PaymentController from '../controllers/PaymentController.js';
import { validatePaymentIntent, validateRefund  } from '../middleware/validation.js';

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

export default router;
