require('dotenv').config();
const { sequelize, testConnection } = require('./config');
const models = require('../models');

async function migrate() {
    try {
        console.log('🔄 Starting database migration...');

        // Test connection
        await testConnection();

        // Sync all models
        await sequelize.sync({
            force: false,  // Set to true to drop existing tables (use with caution!)
            alter: true    // Automatically alter tables to match models
        });

        console.log('✅ Database migration completed successfully!');
        console.log('📊 Tables created:');
        console.log('   - customers');
        console.log('   - products');
        console.log('   - prices');
        console.log('   - payments');
        console.log('   - refunds');
        console.log('   - subscriptions');
        console.log('   - webhook_events');
        console.log('   - users');
        console.log('   - subscription_plans');
        console.log('   - user_subscriptions');
        console.log('   - subscription_histories');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
