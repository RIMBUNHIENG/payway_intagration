const express = require('express');
const router = express.Router();
const SubscriptionPlanController = require('../controllers/SubscriptionPlanController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', SubscriptionPlanController.listPlans.bind(SubscriptionPlanController));
router.get('/compare', SubscriptionPlanController.comparePlans.bind(SubscriptionPlanController));
router.get('/:id', SubscriptionPlanController.getPlan.bind(SubscriptionPlanController));

// Admin only routes
router.post('/', authenticate, authorize('admin'), SubscriptionPlanController.createPlan.bind(SubscriptionPlanController));
router.put('/:id', authenticate, authorize('admin'), SubscriptionPlanController.updatePlan.bind(SubscriptionPlanController));
router.delete('/:id', authenticate, authorize('admin'), SubscriptionPlanController.deactivatePlan.bind(SubscriptionPlanController));

module.exports = router;
