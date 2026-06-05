import stripe from '../config/stripe.js';
import { Product, Price  } from '../models/index.js';

class ProductController {
    // Create Product with Price
    async createProduct(req, res, next) {
        try {
            const {
                name,
                description,
                amount,
                currency = 'usd',
                recurring,
                metadata = {}
            } = req.body;

            if (!name || !amount) {
                return res.status(400).json({
                    error: 'Product name and amount are required'
                });
            }

            // Create product in Stripe
            const stripeProduct = await stripe.products.create({
                name: name,
                description: description,
                metadata: metadata
            });

            // Save product to database
            const product = await Product.create({
                stripeProductId: stripeProduct.id,
                name: name,
                description: description,
                metadata: metadata
            });

            // Create price in Stripe
            const priceData = {
                product: stripeProduct.id,
                unit_amount: Math.round(amount),
                currency: currency.toLowerCase(),
            };

            if (recurring) {
                priceData.recurring = {
                    interval: recurring.interval || 'month',
                    interval_count: recurring.interval_count || 1
                };
            }

            const stripePrice = await stripe.prices.create(priceData);

            // Save price to database
            const price = await Price.create({
                stripePriceId: stripePrice.id,
                productId: product.id,
                amount: stripePrice.unit_amount,
                currency: stripePrice.currency,
                type: recurring ? 'recurring' : 'one_time',
                recurring: recurring || null
            });

            res.json({
                success: true,
                product: {
                    id: product.id,
                    stripeProductId: product.stripeProductId,
                    name: product.name,
                    description: product.description
                },
                price: {
                    id: price.id,
                    stripePriceId: price.stripePriceId,
                    amount: price.amount,
                    currency: price.currency,
                    type: price.type,
                    recurring: price.recurring
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get Product
    async getProduct(req, res, next) {
        try {
            const product = await Product.findByPk(req.params.id, {
                include: [
                    {
                        model: Price,
                        as: 'prices'
                    }
                ]
            });

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.json({
                success: true,
                product: product
            });
        } catch (error) {
            next(error);
        }
    }

    // List Products
    async listProducts(req, res, next) {
        try {
            const { limit = 10, page = 1, isActive = true } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows } = await Product.findAndCountAll({
                where: { isActive: isActive === 'true' },
                include: [
                    {
                        model: Price,
                        as: 'prices',
                        where: { isActive: true },
                        required: false
                    }
                ],
                limit: parseInt(limit),
                offset: offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                products: rows,
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

    // Update Product
    async updateProduct(req, res, next) {
        try {
            const { name, description, isActive, metadata } = req.body;

            const product = await Product.findByPk(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Update in Stripe
            const updateData = {};
            if (name) updateData.name = name;
            if (description) updateData.description = description;
            if (metadata) updateData.metadata = metadata;

            await stripe.products.update(product.stripeProductId, updateData);

            // Update in database
            if (isActive !== undefined) updateData.isActive = isActive;
            await product.update(updateData);

            res.json({
                success: true,
                product: {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    isActive: product.isActive
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete Product
    async deleteProduct(req, res, next) {
        try {
            const product = await Product.findByPk(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Archive in Stripe (can't delete products with prices)
            await stripe.products.update(product.stripeProductId, { active: false });

            // Soft delete in database
            await product.update({ isActive: false });

            res.json({
                success: true,
                message: 'Product deleted successfully',
                productId: product.id
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ProductController();
