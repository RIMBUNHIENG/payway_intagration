require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize, testConnection } = require('./src/database/config');

// Import routes
const paymentsRouter = require('./src/routes/payments');
const checkoutRouter = require('./src/routes/checkout');
const customersRouter = require('./src/routes/customers');
const productsRouter = require('./src/routes/products');
const webhooksRouter = require('./src/routes/webhooks');
const authRouter = require('./src/routes/auth');
const subscriptionPlansRouter = require('./src/routes/subscription-plans');
const subscriptionsRouter = require('./src/routes/subscriptions');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');

// Import jobs
const { startAllJobs } = require('./src/jobs/subscriptionJobs');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database connection
testConnection();

// Middleware
app.use(cors());

// Webhook route must use raw body parser - mount before JSON parser
app.use('/api/webhook', webhooksRouter);

// JSON body parser for all other routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Stripe Payment Integration API with Database (MVC)',
        status: 'running',
        version: '3.0.0',
        database: sequelize.options.dialect,
        endpoints: {
            auth: '/api/auth/*',
            subscriptionPlans: '/api/subscription-plans/*',
            subscriptions: '/api/subscriptions/*',
            payments: '/api/payments/*',
            checkout: '/api/checkout/*',
            customers: '/api/customers/*',
            products: '/api/products/*',
            webhook: '/api/webhook'
        }
    });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/subscription-plans', subscriptionPlansRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/customers', customersRouter);
app.use('/api/products', productsRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}`);
    console.log(`💳 Stripe integration ready`);
    console.log(`🗄️  Database: ${sequelize.options.dialect}`);

    // Start subscription cron jobs
    startAllJobs();

    console.log(`\n📚 Available Endpoints:`);
    console.log(`   Authentication:`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/auth/profile`);
    console.log(`\n   Subscription Plans:`);
    console.log(`   GET  /api/subscription-plans`);
    console.log(`   POST /api/subscription-plans (admin)`);
    console.log(`   PUT  /api/subscription-plans/:id (admin)`);
    console.log(`\n   Subscriptions:`);
    console.log(`   POST /api/subscriptions/subscribe`);
    console.log(`   GET  /api/subscriptions/my-subscriptions`);
    console.log(`   GET  /api/subscriptions/:id`);
    console.log(`   POST /api/subscriptions/:id/cancel`);
    console.log(`   POST /api/subscriptions/:id/resume`);
    console.log(`   POST /api/subscriptions/:id/upgrade`);
    console.log(`   GET  /api/subscriptions/:id/history`);
    console.log(`\n   Payments:`);
    console.log(`   POST /api/payments/create-payment-intent`);
    console.log(`   GET  /api/payments (List all)`);
    console.log(`   POST /api/payments/refund`);
    console.log(`\n💡 Run 'npm run db:migrate' to create database tables`);
});
