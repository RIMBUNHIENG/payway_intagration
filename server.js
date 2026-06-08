import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sequelize, testConnection } from './src/database/config.js';

// Import routes
import paymentsRouter from './src/routes/payments.js';
import authRouter from './src/routes/auth.js';
import subscriptionPlansRouter from './src/routes/subscription-plans.js';
import subscriptionsRouter from './src/routes/subscriptions.js';

// Legacy routes (commented out - using new ERD structure)
// import checkoutRouter from './src/routes/checkout.js';
// import customersRouter from './src/routes/customers.js';
// import productsRouter from './src/routes/products.js';
// import webhooksRouter from './src/routes/webhooks.js';

// Import middleware
import errorHandler from './src/middleware/errorHandler.js';

// Import jobs
import { startAllJobs } from './src/jobs/subscriptionJobs.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database connection
testConnection();

// Middleware
app.use(cors());

// JSON body parser for all routes
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
            payments: '/api/payments/*'
        }
    });
});

// API Routes (New ERD Structure with Stripe Payments)
app.use('/api/auth', authRouter);
app.use('/api/subscription-plans', subscriptionPlansRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/payments', paymentsRouter);

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
    console.log(`   DELETE /api/subscription-plans/:id (admin)`);
    console.log(`\n   Subscriptions (with Stripe payment):`);
    console.log(`   POST /api/subscriptions/subscribe`);
    console.log(`   GET  /api/subscriptions/my-subscriptions`);
    console.log(`   GET  /api/subscriptions/:id`);
    console.log(`   POST /api/subscriptions/:id/cancel`);
    console.log(`   POST /api/subscriptions/:id/extend`);
    console.log(`\n   Payments (Stripe):`);
    console.log(`   POST /api/payments/create-payment-intent`);
    console.log(`   GET  /api/payments/payment-intent/:id`);
    console.log(`\n💡 Run 'npm run db:migrate' to create database tables`);
});
