import express from 'express';
const router = express.Router();
import SubscriptionController from '../controllers/SubscriptionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

/**
 * @route   POST /api/subscriptions/subscribe
 * @desc    Subscribe to a plan
 * @access  Private (user, admin)
 */
router.post('/subscribe',
    authenticate,
    authorize('user', 'admin'),
    SubscriptionController.subscribe.bind(SubscriptionController)
);

/**
 * @route   GET /api/subscriptions/my-subscriptions
 * @desc    Get current user's subscriptions
 * @access  Private (user, admin)
 */
router.get('/my-subscriptions',
    authenticate,
    authorize('user', 'admin'),
    SubscriptionController.getUserSubscriptions.bind(SubscriptionController)
);

/**
 * @route   GET /api/subscriptions/:id
 * @desc    Get single subscription details
 * @access  Private (user, admin)
 */
router.get('/:id',
    authenticate,
    authorize('user', 'admin'),
    SubscriptionController.getSubscription.bind(SubscriptionController)
);

/**
 * @route   POST /api/subscriptions/:id/cancel
 * @desc    Cancel a subscription
 * @access  Private (user, admin)
 */
router.post('/:id/cancel',
    authenticate,
    authorize('user', 'admin'),
    SubscriptionController.cancelSubscription.bind(SubscriptionController)
);

/**
 * @route   POST /api/subscriptions/:id/extend
 * @desc    Extend a subscription
 * @access  Private (user, admin)
 */
router.post('/:id/extend',
    authenticate,
    authorize('user', 'admin'),
    SubscriptionController.extendSubscription.bind(SubscriptionController)
);

/**
 * @route   GET /api/subscriptions (admin only)
 * @desc    Get all subscriptions
 * @access  Private (admin)
 */
router.get('/',
    authenticate,
    authorize('admin'),
    SubscriptionController.getAllSubscriptions.bind(SubscriptionController)
);

export default router;
