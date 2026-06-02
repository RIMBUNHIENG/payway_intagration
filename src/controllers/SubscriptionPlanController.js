const { SubscriptionPlan } = require('../models');
const stripe = require('../config/stripe');
const { Op } = require('sequelize');

class SubscriptionPlanController {
    // Create subscription plan
    async createPlan(req, res, next) {
        try {
            const {
                name,
                description,
                amount,
                currency = 'usd',
                interval,
                intervalCount = 1,
                trialPeriodDays = 0,
                features = [],
                limits = {},
                isPopular = false,
                sortOrder = 0
            } = req.body;

            // Validation
            if (!name || !amount || !interval) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Name, amount, and interval are required'
                });
            }

            // Create product in Stripe
            const stripeProduct = await stripe.products.create({
                name,
                description,
                metadata: { type: 'subscription' }
            });

            // Create price in Stripe
            const stripePrice = await stripe.prices.create({
                product: stripeProduct.id,
                unit_amount: Math.round(amount),
                currency: currency.toLowerCase(),
                recurring: {
                    interval,
                    interval_count: intervalCount
                }
            });

            // Create plan in database
            const plan = await SubscriptionPlan.create({
                name,
                description,
                stripePriceId: stripePrice.id,
                stripeProductId: stripeProduct.id,
                amount,
                currency,
                interval,
                intervalCount,
                trialPeriodDays,
                features,
                limits,
                isPopular,
                sortOrder
            });

            res.status(201).json({
                success: true,
                message: 'Subscription plan created successfully',
                plan
            });
        } catch (error) {
            next(error);
        }
    }

    // List all active plans
    async listPlans(req, res, next) {
        try {
            const { interval, includeInactive = false } = req.query;

            const where = {};

            if (!includeInactive || includeInactive === 'false') {
                where.isActive = true;
            }

            if (interval) {
                where.interval = interval;
            }

            const plans = await SubscriptionPlan.findAll({
                where,
                order: [['sortOrder', 'ASC'], ['amount', 'ASC']]
            });

            res.json({
                success: true,
                plans
            });
        } catch (error) {
            next(error);
        }
    }

    // Get single plan
    async getPlan(req, res, next) {
        try {
            const plan = await SubscriptionPlan.findByPk(req.params.id);

            if (!plan) {
                return res.status(404).json({
                    error: 'Plan not found'
                });
            }

            res.json({
                success: true,
                plan
            });
        } catch (error) {
            next(error);
        }
    }

    // Update plan
    async updatePlan(req, res, next) {
        try {
            const {
                name,
                description,
                features,
                limits,
                isActive,
                isPopular,
                sortOrder
            } = req.body;

            const plan = await SubscriptionPlan.findByPk(req.params.id);

            if (!plan) {
                return res.status(404).json({
                    error: 'Plan not found'
                });
            }

            const updateData = {};
            if (name) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (features) updateData.features = features;
            if (limits) updateData.limits = limits;
            if (isActive !== undefined) updateData.isActive = isActive;
            if (isPopular !== undefined) updateData.isPopular = isPopular;
            if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

            await plan.update(updateData);

            // Update Stripe product if name/description changed
            if (name || description) {
                await stripe.products.update(plan.stripeProductId, {
                    name: plan.name,
                    description: plan.description
                });
            }

            res.json({
                success: true,
                message: 'Plan updated successfully',
                plan
            });
        } catch (error) {
            next(error);
        }
    }

    // Deactivate plan
    async deactivatePlan(req, res, next) {
        try {
            const plan = await SubscriptionPlan.findByPk(req.params.id);

            if (!plan) {
                return res.status(404).json({
                    error: 'Plan not found'
                });
            }

            await plan.update({ isActive: false });

            res.json({
                success: true,
                message: 'Plan deactivated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Compare plans
    async comparePlans(req, res, next) {
        try {
            const { planIds } = req.query; // Comma-separated IDs

            if (!planIds) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Plan IDs are required'
                });
            }

            const ids = planIds.split(',').map(id => parseInt(id));

            const plans = await SubscriptionPlan.findAll({
                where: {
                    id: {
                        [Op.in]: ids
                    },
                    isActive: true
                },
                order: [['amount', 'ASC']]
            });

            res.json({
                success: true,
                plans
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SubscriptionPlanController();
