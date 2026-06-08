import 'dotenv/config';
import { sequelize } from './config.js';

// Import all new models to ensure they're registered
import {
    Mentor,
    UsersType,
    User,
    SubscriptionPlan,
    Subscription
} from '../models/index.js';

const migrate = async () => {
    try {
        console.log('🔄 Starting database migration for new ERD structure...');

        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Drop all old tables that are not needed
        console.log('⚠️  Dropping old unnecessary tables...');

        const oldTablesToDrop = [
            'webhook_events',
            'user_subscriptions',
            'subscription_history',
            'payments',
            'refunds',
            'subscription_plans',
            'prices',
            'products',
            'customers',
            'users'
        ];

        for (const tableName of oldTablesToDrop) {
            try {
                await sequelize.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
                console.log(`✅ Dropped old table: ${tableName}`);
            } catch (error) {
                console.log(`⚠️  Table ${tableName} might not exist: ${error.message}`);
            }
        }
        // Create all new tables in the correct order based on your ERD
        console.log('📋 Creating new ERD tables...');

        // 1. Create users_type table first (no dependencies)
        await UsersType.sync({ force: true });
        console.log('✅ users_type table created');

        // 2. Create mentor table (independent)
        await Mentor.sync({ force: true });
        console.log('✅ mentor table created');

        // 3. Create users table (depends on users_type)
        await User.sync({ force: true });
        console.log('✅ users table created');

        // 4. Create subscription_Plan table (depends on users for admin_id)
        await SubscriptionPlan.sync({ force: true });
        console.log('✅ subscription_Plan table created');

        // 5. Create subscription table (depends on users, subscription_Plan, users_type)
        await Subscription.sync({ force: true });
        console.log('✅ subscription table created');

        console.log('🎉 Migration completed successfully!');

        // Seed initial data
        console.log('🌱 Seeding initial data...');

        // Create user types
        const adminType = await UsersType.create({
            user_type_name: 'admin'
        });
        console.log('✅ Admin user type created');

        const userType = await UsersType.create({
            user_type_name: 'user'
        });
        console.log('✅ User type created');

        const mentorType = await UsersType.create({
            user_type_name: 'mentor'
        });
        console.log('✅ Mentor user type created');

        // Create admin user
        const adminUser = await User.create({
            user_type_id: adminType.user_type_id,
            status: 'active',
            email: 'admin@example.com',
            password: 'admin123'
        });
        console.log('✅ Admin user created (email: admin@example.com, password: admin123)');

        // Create a regular user
        const regularUser = await User.create({
            user_type_id: userType.user_type_id,
            status: 'active',
            email: 'user@example.com',
            password: 'user123'
        });
        console.log('✅ Regular user created (email: user@example.com, password: user123)');

        // Create sample mentor
        const mentor = await Mentor.create({
            firstname: 'John',
            lastname: 'Doe',
            gender: 'male',
            phone_number: '+1234567890',
            address: '123 Main St, Tech City, TC 12345',
            description: 'Experienced software engineer and mentor with 10+ years in full-stack development. Specializing in JavaScript, React, Node.js, and system design.',
            profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
        });
        console.log('✅ Sample mentor created');

        // Create sample subscription plans with proper DECIMAL pricing
        const basicPlan = await SubscriptionPlan.create({
            admin_id: adminUser.user_id,
            name: 'Basic Mentorship',
            price: 242.000, // Proper decimal format - fixes your price issue!
            duration_day: 30,
            description: 'Basic mentorship plan with 1-on-1 sessions for 1 month'
        });
        console.log('✅ Basic plan created ($242.00/month)');

        const premiumPlan = await SubscriptionPlan.create({
            admin_id: adminUser.user_id,
            name: 'Premium Mentorship',
            price: 485.000,
            duration_day: 30,
            description: 'Premium mentorship with unlimited sessions and code reviews'
        });
        console.log('✅ Premium plan created ($485.00/month)');

        // Create sample subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30); // 30 days from now

        await Subscription.create({
            subscription_Plan_id: basicPlan.subscription_Plan_id,
            user_id: regularUser.user_id,
            start_date: startDate,
            end_date: endDate,
            user_type_id: userType.user_type_id
        });
        console.log('✅ Sample subscription created');

        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📊 Summary:');
        console.log('- Created 5 tables based on your ERD');
        console.log('- Added 3 user types (admin, user, mentor)');
        console.log('- Created admin and user accounts');
        console.log('- Added sample mentor profile');
        console.log('- Created 2 subscription plans with proper pricing');
        console.log('- Added sample subscription');
        console.log('\n🔑 Login credentials:');
        console.log('Admin: admin@example.com / admin123');
        console.log('User: user@example.com / user123');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await sequelize.close();
    }
};

migrate();
