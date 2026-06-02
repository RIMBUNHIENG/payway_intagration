const express = require('express');
const router = express.Router();
const SubscriptionController = require('../controllers/SubscriptionController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/subscriptions/subscribe
 * @desc    Subscribe to a plan
 * @access  Private (user, admin)
 */
router.post('/subscribe',
    authenticate,
    authorize(['user', 'admin']),
    SubscriptionController.subscribe
);

/**
 * @route   POST /api/subscriptions/:id/cancel
 * @desc    Cancel a subscription
 * @access  Private (user, admin)
 */
router.post('/:id/cancel',
    authenticate,
    authorize(['user', 'admin']),
    SubscriptionController.cancelSubscription
);

/**
 * @route   POST /api/subscriptions/:id/resume
 * @desc    Resume a canceled subscription
 * @access  Private (user, admin)
 */
router.post('/:id/resume',
    authenticate,
    authorize(['user', 'admin']),
    SubscriptionController.resumeSubscription
);

/**
 * @route   POST /api/subscriptions/:id/upgrade
 * @desc    Upgrade or downgrade subscription plan
 * @access  Private (user, admin)
 */
router.post('/:id/upgrade',
    authenticate,
    authorize(['user', 'admin']),
    SubscriptionController.upgradeSubscription
);

/**
 * @route   GET /api/subscriptions/my-subscriptions
 * @desc    Get current user's subscriptions
 * @access  Private (user, admin)
 */
router.get('/my-subscriptions',
    authenticate,
    authorize(['user', 'admin']),
    SubscriptionController.listUserSubscriptions
);

/**
 * @route   GET /api/subscriptions/:id
 * @desc    Get single subscription details
 * @access  Private (user, admin)
 */
router.get('/:id',
    authenticate,
    authorize(['user', 'admin']),
    SubscriptionController.getSubscription
);

/**
 * @route   GET /api/subscriptions/:id/history
 * @desc    Get subscription history/audit trail
 * @access  Private (user, admin)
 */
router.get('/:id/history',
    authenticate,
    authorize(['user', 'admin']),
    SubscriptionController.getSubscriptionHistory
);

module.exports = router;
