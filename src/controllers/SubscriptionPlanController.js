import { SubscriptionPlan, User } from '../models/index.js';
import { Op } from 'sequelize';

class SubscriptionPlanController {
    // Create subscription plan
    async createPlan(req, res, next) {
        try {
            const {
                name,
                description,
                price, // Now using DECIMAL price directly
                duration_day
            } = req.body;

            // Validation
            if (!name || !price || !duration_day) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Name, price, and duration_day are required'
                });
            }

            // Validate price is a positive number
            if (price <= 0) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Price must be a positive number'
                });
            }

            // Get admin user ID from JWT token
            const admin_id = req.userId;

            // Create plan in database with DECIMAL price
            const plan = await SubscriptionPlan.create({
                admin_id,
                name,
                description,
                price: parseFloat(price), // Store as decimal (e.g., 242.000)
                duration_day: parseInt(duration_day)
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

    // List all plans
    async listPlans(req, res, next) {
        try {
            const plans = await SubscriptionPlan.findAll({
                include: [{
                    model: User,
                    as: 'admin',
                    attributes: ['user_id', 'email']
                }],
                order: [['price', 'ASC']]
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
            const plan = await SubscriptionPlan.findByPk(req.params.id, {
                include: [{
                    model: User,
                    as: 'admin',
                    attributes: ['user_id', 'email']
                }]
            });

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
                price,
                duration_day
            } = req.body;

            const plan = await SubscriptionPlan.findByPk(req.params.id);

            if (!plan) {
                return res.status(404).json({
                    error: 'Plan not found'
                });
            }

            // Check if user is admin who created this plan or super admin
            if (plan.admin_id !== req.userId) {
                // You could add super admin check here if needed
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'You can only update your own plans'
                });
            }

            const updateData = {};
            if (name) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (price) {
                if (price <= 0) {
                    return res.status(400).json({
                        error: 'Validation error',
                        message: 'Price must be a positive number'
                    });
                }
                updateData.price = parseFloat(price);
            }
            if (duration_day) updateData.duration_day = parseInt(duration_day);

            await plan.update(updateData);

            res.json({
                success: true,
                message: 'Plan updated successfully',
                plan
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete plan
    async deletePlan(req, res, next) {
        try {
            const plan = await SubscriptionPlan.findByPk(req.params.id);

            if (!plan) {
                return res.status(404).json({
                    error: 'Plan not found'
                });
            }

            // Check if user is admin who created this plan
            if (plan.admin_id !== req.userId) {
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'You can only delete your own plans'
                });
            }

            await plan.destroy();

            res.json({
                success: true,
                message: 'Plan deleted successfully'
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
                    subscription_Plan_id: {
                        [Op.in]: ids
                    }
                },
                include: [{
                    model: User,
                    as: 'admin',
                    attributes: ['user_id', 'email']
                }],
                order: [['price', 'ASC']]
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

export default new SubscriptionPlanController();
