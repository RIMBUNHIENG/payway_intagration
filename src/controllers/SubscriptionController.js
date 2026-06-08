import { Subscription, SubscriptionPlan, User, UsersType } from '../models/index.js';
import { Op } from 'sequelize';
import stripe from '../config/stripe.js';

class SubscriptionController {
    // Create subscription (user subscribes to a plan)
    async subscribe(req, res, next) {
        try {
            const { subscription_Plan_id, payment_method_id } = req.body;
            const user_id = req.userId;

            // Validation
            if (!subscription_Plan_id) {
                return res.status(400).json({
                    error: 'subscription_Plan_id is required'
                });
            }

            if (!payment_method_id) {
                return res.status(400).json({
                    error: 'payment_method_id is required'
                });
            }

            // Get subscription plan
            const plan = await SubscriptionPlan.findByPk(subscription_Plan_id);
            if (!plan) {
                return res.status(404).json({
                    error: 'Subscription plan not found'
                });
            }

            // Get user with user type
            const user = await User.findByPk(user_id, {
                include: [{
                    model: UsersType,
                    as: 'userType'
                }]
            });

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            // Check if user already has an active subscription to this plan
            const existingSubscription = await Subscription.findOne({
                where: {
                    user_id,
                    subscription_Plan_id,
                    end_date: {
                        [Op.gt]: new Date() // end_date is in the future
                    }
                }
            });

            if (existingSubscription) {
                return res.status(400).json({
                    error: 'User already has an active subscription to this plan'
                });
            }

            // Calculate dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + plan.duration_day);

            // Create payment intent in Stripe
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(parseFloat(plan.price) * 100), // Convert to cents
                currency: 'usd',
                payment_method: payment_method_id,
                confirm: true,
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never'
                },
                metadata: {
                    subscription_Plan_id: plan.subscription_Plan_id,
                    user_id: user_id,
                    plan_name: plan.name
                }
            });

            // Check payment status
            if (paymentIntent.status !== 'succeeded') {
                return res.status(400).json({
                    error: 'Payment failed',
                    paymentIntent: {
                        status: paymentIntent.status,
                        client_secret: paymentIntent.client_secret
                    }
                });
            }

            // Create subscription record after successful payment
            const subscription = await Subscription.create({
                subscription_Plan_id,
                user_id,
                start_date: startDate,
                end_date: endDate,
                user_type_id: user.user_type_id
            });

            // Fetch complete subscription with associations
            const completeSubscription = await Subscription.findByPk(subscription.subscription_id, {
                include: [
                    {
                        model: SubscriptionPlan,
                        as: 'subscriptionPlan'
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['user_id', 'email']
                    },
                    {
                        model: UsersType,
                        as: 'userType',
                        attributes: ['user_type_name']
                    }
                ]
            });

            res.status(201).json({
                success: true,
                message: 'Subscription created successfully',
                subscription: completeSubscription,
                payment: {
                    id: paymentIntent.id,
                    amount: paymentIntent.amount,
                    status: paymentIntent.status
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // Get user's subscriptions
    async getUserSubscriptions(req, res, next) {
        try {
            const user_id = req.userId;

            const subscriptions = await Subscription.findAll({
                where: { user_id },
                include: [
                    {
                        model: SubscriptionPlan,
                        as: 'subscriptionPlan'
                    },
                    {
                        model: UsersType,
                        as: 'userType',
                        attributes: ['user_type_name']
                    }
                ],
                order: [['start_date', 'DESC']]
            });

            res.json({
                success: true,
                subscriptions
            });
        } catch (error) {
            next(error);
        }
    }

    // Get single subscription
    async getSubscription(req, res, next) {
        try {
            const { id } = req.params;
            const user_id = req.userId;

            const subscription = await Subscription.findOne({
                where: {
                    subscription_id: id,
                    user_id // Ensure user can only see their own subscriptions
                },
                include: [
                    {
                        model: SubscriptionPlan,
                        as: 'subscriptionPlan'
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['user_id', 'email']
                    },
                    {
                        model: UsersType,
                        as: 'userType',
                        attributes: ['user_type_name']
                    }
                ]
            });

            if (!subscription) {
                return res.status(404).json({
                    error: 'Subscription not found'
                });
            }

            res.json({
                success: true,
                subscription
            });
        } catch (error) {
            next(error);
        }
    }

    // Cancel subscription (admin or user can cancel)
    async cancelSubscription(req, res, next) {
        try {
            const { id } = req.params;
            const user_id = req.userId;

            const subscription = await Subscription.findOne({
                where: {
                    subscription_id: id,
                    user_id
                }
            });

            if (!subscription) {
                return res.status(404).json({
                    error: 'Subscription not found'
                });
            }

            // Check if subscription is still active
            if (subscription.end_date < new Date()) {
                return res.status(400).json({
                    error: 'Subscription has already expired'
                });
            }

            // Cancel immediately by setting end_date to now
            await subscription.update({
                end_date: new Date()
            });

            res.json({
                success: true,
                message: 'Subscription cancelled successfully',
                subscription
            });
        } catch (error) {
            next(error);
        }
    }

    // Extend subscription
    async extendSubscription(req, res, next) {
        try {
            const { id } = req.params;
            const { additional_days } = req.body;
            const user_id = req.userId;

            if (!additional_days || additional_days <= 0) {
                return res.status(400).json({
                    error: 'additional_days must be a positive number'
                });
            }

            const subscription = await Subscription.findOne({
                where: {
                    subscription_id: id,
                    user_id
                }
            });

            if (!subscription) {
                return res.status(404).json({
                    error: 'Subscription not found'
                });
            }

            // Extend the subscription
            const newEndDate = new Date(subscription.end_date);
            newEndDate.setDate(newEndDate.getDate() + parseInt(additional_days));

            await subscription.update({
                end_date: newEndDate
            });

            res.json({
                success: true,
                message: 'Subscription extended successfully',
                subscription
            });
        } catch (error) {
            next(error);
        }
    }

    // Admin: Get all subscriptions
    async getAllSubscriptions(req, res, next) {
        try {
            const subscriptions = await Subscription.findAll({
                include: [
                    {
                        model: SubscriptionPlan,
                        as: 'subscriptionPlan'
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['user_id', 'email']
                    },
                    {
                        model: UsersType,
                        as: 'userType',
                        attributes: ['user_type_name']
                    }
                ],
                order: [['start_date', 'DESC']]
            });

            res.json({
                success: true,
                subscriptions
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new SubscriptionController();