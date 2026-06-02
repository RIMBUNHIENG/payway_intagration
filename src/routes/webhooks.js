const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/WebhookController');

// Webhook endpoint - must use raw body
router.post('/', express.raw({ type: 'application/json' }), WebhookController.handleWebhook.bind(WebhookController));

module.exports = router;
