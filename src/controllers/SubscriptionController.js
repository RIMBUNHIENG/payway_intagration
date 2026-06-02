const stripe = require('../config/stripe');
const {
    UserSubscription,
    SubscriptionHistory,
    SubscriptionPlan,
    User
} = require('../models');

/**
 * Subscribe to a Subscription Plan
 */
exports.subscribe = async (req, res, next) => {
    try {
        const { plan_id, payment_method_id } = req.body;
        const user_id = req.user.id;

        // Validate required fields
        if (!plan_id || !payment_method_id) {
            return res.status(400).json({
                error: 'plan_id and payment_method_id are required'
            });
        }

        // Get subscription plan
        const plan = await SubscriptionPlan.findByPk(plan_id);
        if (!plan) {
            return res.status(404).json({ error: 'Subscription plan not found' });
        }

        if (plan.status !== 'active') {
            return res.status(400).json({ error: 'Subscription plan is not active' });
        }

        // Get user
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user already has an active subscription to this plan
        const existingSubscription = await UserSubscription.findOne({
            where: {
                user_id,
                plan_id,
                status: 'active'
            }
        });

        if (existingSubscription) {
            return res.status(400).json({
                error: 'User already has an active subscription to this plan'
            });
        }

        // Create or get Stripe customer
        let stripeCustomerId = user.stripe_customer_id;

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
                payment_method: payment_method_id,
                invoice_settings: {
                    default_payment_method: payment_method_id,
                },
            });
            stripeCustomerId = customer.id;

            // Update user with Stripe customer ID
            await user.update({ stripe_customer_id: stripeCustomerId });
        } else {
            // Attach payment method to existing customer
            await stripe.paymentMethods.attach(payment_method_id, {
                customer: stripeCustomerId,
            });

            // Set as default payment method
            await stripe.customers.update(stripeCustomerId, {
                invoice_settings: {
                    default_payment_method: payment_method_id,
                },
            });
        }

        // Create Stripe subscription
        const stripeSubscription = await stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{ price: plan.stripe_price_id }],
            expand: ['latest_invoice.payment_intent'],
        });

        // Calculate dates
        const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
        const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

        // Create subscription record
        const subscription = await UserSubscription.create({
            user_id,
            plan_id,
            stripe_subscription_id: stripeSubscription.id,
            status: stripeSubscription.status,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            auto_renew: !stripeSubscription.cancel_at_period_end,
            trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
            trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
        });

        // Create history entry
        await SubscriptionHistory.create({
            subscription_id: subscription.id,
            user_id,
            plan_id,
            action: 'subscribed',
            status_from: null,
            status_to: stripeSubscription.status,
            details: {
                stripe_subscription_id: stripeSubscription.id,
                price: plan.price,
                interval: plan.interval,
            }
        });

        // Fetch complete subscription with associations
        const completeSubscription = await UserSubscription.findByPk(subscription.id, {
            include: [
                { model: SubscriptionPlan, as: 'plan' },
                { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] }
            ]
        });

        res.status(201).json({
            message: 'Subscription created successfully',
            subscription: completeSubscription,
            stripe_subscription: stripeSubscription
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Cancel a Subscription
 */
exports.cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cancel_immediately } = req.body; // true = cancel now, false/undefined = cancel at period end
        const user_id = req.user.id;

        // Get subscription
        const subscription = await UserSubscription.findOne({
            where: { id, user_id },
            include: [{ model: SubscriptionPlan, as: 'plan' }]
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        if (subscription.status === 'canceled') {
            return res.status(400).json({ error: 'Subscription is already canceled' });
        }

        const oldStatus = subscription.status;

        // Cancel in Stripe
        const cancelOptions = cancel_immediately
            ? {}
            : { cancel_at_period_end: true };

        const stripeSubscription = await stripe.subscriptions.update(
            subscription.stripe_subscription_id,
            cancel_immediately
                ? { cancel_at_period_end: false }
                : { cancel_at_period_end: true }
        );

        if (cancel_immediately) {
            await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
        }

        // Update subscription record
        await subscription.update({
            status: cancel_immediately ? 'canceled' : subscription.status,
            cancel_at_period_end: !cancel_immediately,
            auto_renew: false,
            canceled_at: cancel_immediately ? new Date() : null
        });

        // Create history entry
        await SubscriptionHistory.create({
            subscription_id: subscription.id,
            user_id,
            plan_id: subscription.plan_id,
            action: cancel_immediately ? 'canceled_immediately' : 'scheduled_cancellation',
            status_from: oldStatus,
            status_to: cancel_immediately ? 'canceled' : oldStatus,
            details: {
                cancel_at_period_end: !cancel_immediately,
                current_period_end: subscription.current_period_end
            }
        });

        res.json({
            message: cancel_immediately
                ? 'Subscription canceled immediately'
                : 'Subscription will be canceled at the end of the current period',
            subscription,
            cancel_at: cancel_immediately ? new Date() : subscription.current_period_end
        });

    } catch (error) {
        next(error);
    }
};

/**
 * List User's Subscriptions
 */
exports.listUserSubscriptions = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const { status } = req.query; // Optional filter by status

        const whereClause = { user_id };
        if (status) {
            whereClause.status = status;
        }

        const subscriptions = await UserSubscription.findAll({
            where: whereClause,
            include: [
                {
                    model: SubscriptionPlan,
                    as: 'plan',
                    attributes: ['id', 'name', 'description', 'price', 'interval', 'features']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            count: subscriptions.length,
            subscriptions
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get Single Subscription
 */
exports.getSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const subscription = await UserSubscription.findOne({
            where: { id, user_id },
            include: [
                { model: SubscriptionPlan, as: 'plan' },
                { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] }
            ]
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        // Get Stripe subscription details
        let stripeSubscription = null;
        if (subscription.stripe_subscription_id) {
            try {
                stripeSubscription = await stripe.subscriptions.retrieve(
                    subscription.stripe_subscription_id
                );
            } catch (err) {
                console.error('Error fetching Stripe subscription:', err);
            }
        }

        res.json({
            subscription,
            stripe_subscription: stripeSubscription
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get Subscription History
 */
exports.getSubscriptionHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Verify subscription belongs to user
        const subscription = await UserSubscription.findOne({
            where: { id, user_id }
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        const history = await SubscriptionHistory.findAll({
            where: { subscription_id: id },
            include: [
                { model: SubscriptionPlan, as: 'plan', attributes: ['id', 'name'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            subscription_id: id,
            count: history.length,
            history
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Resume Canceled Subscription
 */
exports.resumeSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const subscription = await UserSubscription.findOne({
            where: { id, user_id },
            include: [{ model: SubscriptionPlan, as: 'plan' }]
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        if (subscription.status === 'canceled') {
            return res.status(400).json({
                error: 'Cannot resume a fully canceled subscription. Please create a new subscription.'
            });
        }

        if (!subscription.cancel_at_period_end) {
            return res.status(400).json({
                error: 'Subscription is not scheduled for cancellation'
            });
        }

        const oldStatus = subscription.status;

        // Resume in Stripe
        const stripeSubscription = await stripe.subscriptions.update(
            subscription.stripe_subscription_id,
            { cancel_at_period_end: false }
        );

        // Update subscription record
        await subscription.update({
            cancel_at_period_end: false,
            auto_renew: true,
            canceled_at: null
        });

        // Create history entry
        await SubscriptionHistory.create({
            subscription_id: subscription.id,
            user_id,
            plan_id: subscription.plan_id,
            action: 'resumed',
            status_from: oldStatus,
            status_to: subscription.status,
            details: {
                resumed_at: new Date()
            }
        });

        res.json({
            message: 'Subscription resumed successfully',
            subscription
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Upgrade/Downgrade Subscription
 */
exports.upgradeSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { new_plan_id } = req.body;
        const user_id = req.user.id;

        if (!new_plan_id) {
            return res.status(400).json({ error: 'new_plan_id is required' });
        }

        // Get current subscription
        const subscription = await UserSubscription.findOne({
            where: { id, user_id },
            include: [{ model: SubscriptionPlan, as: 'plan' }]
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        if (subscription.status !== 'active') {
            return res.status(400).json({ error: 'Can only upgrade active subscriptions' });
        }

        // Get new plan
        const newPlan = await SubscriptionPlan.findByPk(new_plan_id);
        if (!newPlan) {
            return res.status(404).json({ error: 'New subscription plan not found' });
        }

        if (newPlan.status !== 'active') {
            return res.status(400).json({ error: 'New subscription plan is not active' });
        }

        if (subscription.plan_id === new_plan_id) {
            return res.status(400).json({ error: 'Already subscribed to this plan' });
        }

        const oldPlanId = subscription.plan_id;
        const oldPlanName = subscription.plan.name;

        // Update Stripe subscription
        const stripeSubscription = await stripe.subscriptions.retrieve(
            subscription.stripe_subscription_id
        );

        const updatedStripeSubscription = await stripe.subscriptions.update(
            subscription.stripe_subscription_id,
            {
                items: [{
                    id: stripeSubscription.items.data[0].id,
                    price: newPlan.stripe_price_id,
                }],
                proration_behavior: 'create_prorations', // Prorate the charge
            }
        );

        // Update subscription record
        await subscription.update({
            plan_id: new_plan_id
        });

        // Create history entry
        await SubscriptionHistory.create({
            subscription_id: subscription.id,
            user_id,
            plan_id: new_plan_id,
            action: 'plan_changed',
            status_from: subscription.status,
            status_to: subscription.status,
            details: {
                old_plan_id: oldPlanId,
                old_plan_name: oldPlanName,
                new_plan_id: new_plan_id,
                new_plan_name: newPlan.name,
                proration_date: new Date()
            }
        });

        // Reload with new plan
        await subscription.reload({
            include: [{ model: SubscriptionPlan, as: 'plan' }]
        });

        res.json({
            message: `Subscription upgraded to ${newPlan.name}`,
            subscription,
            stripe_subscription: updatedStripeSubscription
        });

    } catch (error) {
        next(error);
    }
};
