import express from 'express';
const router = express.Router();
import WebhookController from '../controllers/WebhookController.js';

// Webhook endpoint - must use raw body
router.post('/', express.raw({ type: 'application/json' }), WebhookController.handleWebhook.bind(WebhookController));

export default router;
