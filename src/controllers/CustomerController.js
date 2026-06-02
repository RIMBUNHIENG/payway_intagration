const stripe = require('../config/stripe');
const { Customer, Payment, Subscription } = require('../models');

class CustomerController {
    // Create Customer
    async createCustomer(req, res, next) {
        try {
            const { email, name, phone, address, metadata = {} } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            // Check if customer already exists
            const existingCustomer = await Customer.findOne({ where: { email } });
            if (existingCustomer) {
                return res.status(400).json({
                    error: 'Customer with this email already exists',
                    customerId: existingCustomer.id
                });
            }

            // Create in Stripe
            const customerData = {
                email: email,
                metadata: metadata
            };

            if (name) customerData.name = name;
            if (phone) customerData.phone = phone;
            if (address) customerData.address = address;

            const stripeCustomer = await stripe.customers.create(customerData);

            // Save to database
            const customer = await Customer.create({
                stripeCustomerId: stripeCustomer.id,
                email: email,
                name: name,
                phone: phone,
                address: address,
                metadata: metadata
            });

            res.json({
                success: true,
                customer: {
                    id: customer.id,
                    stripeCustomerId: customer.stripeCustomerId,
                    email: customer.email,
                    name: customer.name,
                    createdAt: customer.createdAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get Customer
    async getCustomer(req, res, next) {
        try {
            const customer = await Customer.findByPk(req.params.id, {
                include: [
                    {
                        model: Payment,
                        as: 'payments',
                        limit: 10,
                        order: [['createdAt', 'DESC']]
                    },
                    {
                        model: Subscription,
                        as: 'subscriptions'
                    }
                ]
            });

            if (!customer) {
                return res.status(404).json({ error: 'Customer not found' });
            }

            res.json({
                success: true,
                customer: customer
            });
        } catch (error) {
            next(error);
        }
    }

    // Update Customer
    async updateCustomer(req, res, next) {
        try {
            const { email, name, phone, address, metadata } = req.body;

            const customer = await Customer.findByPk(req.params.id);
            if (!customer) {
                return res.status(404).json({ error: 'Customer not found' });
            }

            // Update in Stripe
            const updateData = {};
            if (email) updateData.email = email;
            if (name) updateData.name = name;
            if (phone) updateData.phone = phone;
            if (address) updateData.address = address;
            if (metadata) updateData.metadata = metadata;

            await stripe.customers.update(customer.stripeCustomerId, updateData);

            // Update in database
            await customer.update(updateData);

            res.json({
                success: true,
                customer: {
                    id: customer.id,
                    email: customer.email,
                    name: customer.name,
                    phone: customer.phone
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete Customer
    async deleteCustomer(req, res, next) {
        try {
            const customer = await Customer.findByPk(req.params.id);
            if (!customer) {
                return res.status(404).json({ error: 'Customer not found' });
            }

            // Delete from Stripe
            await stripe.customers.del(customer.stripeCustomerId);

            // Soft delete in database
            await customer.update({ isActive: false });

            res.json({
                success: true,
                message: 'Customer deleted successfully',
                customerId: customer.id
            });
        } catch (error) {
            next(error);
        }
    }

    // List Customers
    async listCustomers(req, res, next) {
        try {
            const { limit = 10, page = 1, email, isActive = true } = req.query;
            const offset = (page - 1) * limit;

            const where = { isActive: isActive === 'true' };
            if (email) where.email = { [require('sequelize').Op.like]: `%${email}%` };

            const { count, rows } = await Customer.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                customers: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get Customer Stats
    async getCustomerStats(req, res, next) {
        try {
            const customer = await Customer.findByPk(req.params.id, {
                include: [
                    {
                        model: Payment,
                        as: 'payments',
                        where: { status: 'succeeded' },
                        required: false
                    },
                    {
                        model: Subscription,
                        as: 'subscriptions',
                        required: false
                    }
                ]
            });

            if (!customer) {
                return res.status(404).json({ error: 'Customer not found' });
            }

            const totalSpent = customer.payments.reduce((sum, payment) => sum + payment.amount, 0);
            const totalPayments = customer.payments.length;
            const activeSubscriptions = customer.subscriptions.filter(sub => sub.status === 'active').length;

            res.json({
                success: true,
                stats: {
                    customerId: customer.id,
                    email: customer.email,
                    totalSpent: totalSpent,
                    totalPayments: totalPayments,
                    activeSubscriptions: activeSubscriptions,
                    memberSince: customer.createdAt
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CustomerController();
