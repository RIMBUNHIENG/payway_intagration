import 'dotenv/config';
import { sequelize, testConnection  } from './config.js';
import stripe from '../config/stripe.js';
import { Customer,
    Product,
    Price,
    Payment,
    Refund,
    Subscription,
    WebhookEvent
 } from '../models/index.js';

async function seed() {
    try {
        console.log('🌱 Starting database seeding...');

        await testConnection();

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await WebhookEvent.destroy({ where: {} });
        await Refund.destroy({ where: {} });
        await Subscription.destroy({ where: {} });
        await Payment.destroy({ where: {} });
        await Price.destroy({ where: {} });
        await Product.destroy({ where: {} });
        await Customer.destroy({ where: {} });

        // ==================== CUSTOMERS ====================
        console.log('👥 Creating customers...');

        const customersData = [
            {
                email: 'john.doe@example.com',
                name: 'John Doe',
                phone: '+1234567890',
                address: {
                    line1: '123 Main St',
                    city: 'San Francisco',
                    state: 'CA',
                    postal_code: '94111',
                    country: 'US'
                },
                metadata: { source: 'web', plan: 'premium' }
            },
            {
                email: 'jane.smith@example.com',
                name: 'Jane Smith',
                phone: '+1234567891',
                address: {
                    line1: '456 Oak Ave',
                    city: 'New York',
                    state: 'NY',
                    postal_code: '10001',
                    country: 'US'
                },
                metadata: { source: 'mobile', plan: 'basic' }
            },
            {
                email: 'bob.wilson@example.com',
                name: 'Bob Wilson',
                phone: '+1234567892',
                metadata: { source: 'referral' }
            },
            {
                email: 'alice.johnson@example.com',
                name: 'Alice Johnson',
                phone: '+1234567893',
                address: {
                    line1: '789 Pine St',
                    city: 'Austin',
                    state: 'TX',
                    postal_code: '73301',
                    country: 'US'
                },
                metadata: { source: 'web', plan: 'enterprise' }
            },
            {
                email: 'charlie.brown@example.com',
                name: 'Charlie Brown',
                metadata: { source: 'web' }
            }
        ];

        const customers = [];
        for (const customerData of customersData) {
            // Create in Stripe
            const stripeCustomer = await stripe.customers.create(customerData);

            // Create in database
            const customer = await Customer.create({
                stripeCustomerId: stripeCustomer.id,
                email: customerData.email,
                name: customerData.name,
                phone: customerData.phone,
                address: customerData.address,
                metadata: customerData.metadata
            });

            customers.push(customer);
            console.log(`  ✅ Created customer: ${customer.name}`);
        }

        // ==================== PRODUCTS & PRICES ====================
        console.log('\n📦 Creating products and prices...');

        const productsData = [
            {
                name: 'Basic Plan',
                description: 'Perfect for individuals and small teams',
                prices: [
                    { amount: 999, currency: 'usd', type: 'one_time' },
                    {
                        amount: 999,
                        currency: 'usd',
                        type: 'recurring',
                        recurring: { interval: 'month', interval_count: 1 }
                    }
                ],
                metadata: { tier: 'basic', features: '5 users, 10GB storage' }
            },
            {
                name: 'Premium Plan',
                description: 'For growing businesses',
                prices: [
                    { amount: 2999, currency: 'usd', type: 'one_time' },
                    {
                        amount: 2999,
                        currency: 'usd',
                        type: 'recurring',
                        recurring: { interval: 'month', interval_count: 1 }
                    },
                    {
                        amount: 29990,
                        currency: 'usd',
                        type: 'recurring',
                        recurring: { interval: 'year', interval_count: 1 }
                    }
                ],
                metadata: { tier: 'premium', features: '20 users, 100GB storage' }
            },
            {
                name: 'Enterprise Plan',
                description: 'For large organizations',
                prices: [
                    {
                        amount: 9999,
                        currency: 'usd',
                        type: 'recurring',
                        recurring: { interval: 'month', interval_count: 1 }
                    }
                ],
                metadata: { tier: 'enterprise', features: 'Unlimited users, 1TB storage' }
            },
            {
                name: 'E-Book: Stripe Integration Guide',
                description: 'Complete guide to payment integration',
                prices: [
                    { amount: 1999, currency: 'usd', type: 'one_time' }
                ],
                metadata: { category: 'digital-product', format: 'pdf' }
            },
            {
                name: 'Consulting Hour',
                description: 'One hour of expert consulting',
                prices: [
                    { amount: 15000, currency: 'usd', type: 'one_time' }
                ],
                metadata: { category: 'service', duration: '60min' }
            }
        ];

        const products = [];
        const prices = [];

        for (const productData of productsData) {
            // Create product in Stripe
            const stripeProduct = await stripe.products.create({
                name: productData.name,
                description: productData.description,
                metadata: productData.metadata
            });

            // Create product in database
            const product = await Product.create({
                stripeProductId: stripeProduct.id,
                name: productData.name,
                description: productData.description,
                metadata: productData.metadata
            });

            products.push(product);
            console.log(`  ✅ Created product: ${product.name}`);

            // Create prices
            for (const priceData of productData.prices) {
                const stripePriceData = {
                    product: stripeProduct.id,
                    unit_amount: priceData.amount,
                    currency: priceData.currency
                };

                if (priceData.recurring) {
                    stripePriceData.recurring = priceData.recurring;
                }

                const stripePrice = await stripe.prices.create(stripePriceData);

                const price = await Price.create({
                    stripePriceId: stripePrice.id,
                    productId: product.id,
                    amount: priceData.amount,
                    currency: priceData.currency,
                    type: priceData.type,
                    recurring: priceData.recurring
                });

                prices.push(price);
                console.log(`    💰 Created price: $${(priceData.amount / 100).toFixed(2)} ${priceData.type}`);
            }
        }

        // ==================== PAYMENTS ====================
        console.log('\n💳 Creating payments...');

        const paymentsData = [
            {
                customer: customers[0],
                amount: 2999,
                currency: 'usd',
                status: 'succeeded',
                description: 'Premium Plan - Monthly',
                paymentMethod: 'card'
            },
            {
                customer: customers[1],
                amount: 999,
                currency: 'usd',
                status: 'succeeded',
                description: 'Basic Plan - One-time',
                paymentMethod: 'card'
            },
            {
                customer: customers[0],
                amount: 1999,
                currency: 'usd',
                status: 'succeeded',
                description: 'E-Book Purchase',
                paymentMethod: 'card'
            },
            {
                customer: customers[2],
                amount: 15000,
                currency: 'usd',
                status: 'succeeded',
                description: 'Consulting Hour',
                paymentMethod: 'card'
            },
            {
                customer: customers[3],
                amount: 9999,
                currency: 'usd',
                status: 'succeeded',
                description: 'Enterprise Plan - Monthly',
                paymentMethod: 'card'
            },
            {
                customer: customers[4],
                amount: 999,
                currency: 'usd',
                status: 'requires_payment_method',
                description: 'Basic Plan - Pending',
                paymentMethod: null
            },
            {
                customer: customers[1],
                amount: 2999,
                currency: 'usd',
                status: 'canceled',
                description: 'Premium Plan - Canceled',
                paymentMethod: 'card'
            }
        ];

        const payments = [];
        for (const paymentData of paymentsData) {
            // Create payment intent in Stripe (simplified for seeding)
            const stripePaymentIntent = await stripe.paymentIntents.create({
                amount: paymentData.amount,
                currency: paymentData.currency,
                customer: paymentData.customer.stripeCustomerId,
                description: paymentData.description,
                automatic_payment_methods: { enabled: true }
            });

            // Update status if needed
            if (paymentData.status === 'succeeded') {
                // In real scenario, this would be done via webhook
                // For seeding, we'll just set the status
            }

            const payment = await Payment.create({
                stripePaymentIntentId: stripePaymentIntent.id,
                customerId: paymentData.customer.id,
                amount: paymentData.amount,
                currency: paymentData.currency,
                status: paymentData.status,
                description: paymentData.description,
                paymentMethod: paymentData.paymentMethod,
                paidAt: paymentData.status === 'succeeded' ? new Date() : null,
                metadata: { seeded: true }
            });

            payments.push(payment);
            console.log(`  ✅ Created payment: $${(payment.amount / 100).toFixed(2)} - ${payment.status}`);
        }

        // ==================== REFUNDS ====================
        console.log('\n💰 Creating refunds...');

        // Create a refund for one of the successful payments
        const refundPayment = payments[1]; // Basic Plan payment

        const stripeRefund = await stripe.refunds.create({
            payment_intent: refundPayment.stripePaymentIntentId,
            amount: 999, // Full refund
            reason: 'requested_by_customer'
        });

        const refund = await Refund.create({
            stripeRefundId: stripeRefund.id,
            paymentId: refundPayment.id,
            amount: 999,
            currency: 'usd',
            reason: 'requested_by_customer',
            status: 'succeeded',
            refundedAt: new Date()
        });

        console.log(`  ✅ Created refund: $${(refund.amount / 100).toFixed(2)}`);

        // ==================== SUBSCRIPTIONS ====================
        console.log('\n🔄 Creating subscriptions...');

        // Create subscriptions for recurring prices
        const monthlyPremiumPrice = prices.find(p =>
            p.amount === 2999 && p.type === 'recurring' && p.recurring?.interval === 'month'
        );

        const monthlyEnterprisePrice = prices.find(p =>
            p.amount === 9999 && p.type === 'recurring'
        );

        const subscriptionsData = [
            {
                customer: customers[0],
                price: monthlyPremiumPrice,
                status: 'active'
            },
            {
                customer: customers[3],
                price: monthlyEnterprisePrice,
                status: 'active'
            }
        ];

        for (const subData of subscriptionsData) {
            if (!subData.price) continue;

            // Create subscription in Stripe
            const stripeSubscription = await stripe.subscriptions.create({
                customer: subData.customer.stripeCustomerId,
                items: [{ price: subData.price.stripePriceId }]
            });

            const subscription = await Subscription.create({
                stripeSubscriptionId: stripeSubscription.id,
                customerId: subData.customer.id,
                priceId: subData.price.id,
                status: stripeSubscription.status,
                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                metadata: { seeded: true }
            });

            console.log(`  ✅ Created subscription for ${subData.customer.name}`);
        }

        // ==================== WEBHOOK EVENTS ====================
        console.log('\n🔔 Creating webhook events...');

        const webhookEvents = [
            {
                stripeEventId: 'evt_seed_' + Date.now() + '_1',
                type: 'payment_intent.succeeded',
                data: { object: { id: payments[0].stripePaymentIntentId } },
                processed: true,
                processedAt: new Date()
            },
            {
                stripeEventId: 'evt_seed_' + Date.now() + '_2',
                type: 'customer.created',
                data: { object: { id: customers[0].stripeCustomerId } },
                processed: true,
                processedAt: new Date()
            },
            {
                stripeEventId: 'evt_seed_' + Date.now() + '_3',
                type: 'charge.refunded',
                data: { object: { id: refund.stripeRefundId } },
                processed: true,
                processedAt: new Date()
            }
        ];

        for (const eventData of webhookEvents) {
            await WebhookEvent.create(eventData);
            console.log(`  ✅ Created webhook event: ${eventData.type}`);
        }

        // ==================== SUMMARY ====================
        console.log('\n📊 Seeding Summary:');
        console.log(`  👥 Customers: ${customers.length}`);
        console.log(`  📦 Products: ${products.length}`);
        console.log(`  💰 Prices: ${prices.length}`);
        console.log(`  💳 Payments: ${payments.length}`);
        console.log(`  💵 Refunds: 1`);
        console.log(`  🔄 Subscriptions: ${subscriptionsData.length}`);
        console.log(`  🔔 Webhook Events: ${webhookEvents.length}`);

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📝 You can now:');
        console.log('  - Start server: npm start');
        console.log('  - View customers: curl http://localhost:3000/api/customers');
        console.log('  - View payments: curl http://localhost:3000/api/payments');
        console.log('  - Check Neon dashboard: https://console.neon.tech');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
