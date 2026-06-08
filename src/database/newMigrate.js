import 'dotenv/config';
import { sequelize } from './config.js';

// Import all new models to ensure they're registered
import {
    Mentor,
    UsersType,
    User,
    SubscriptionPlan,
    Subscription
} from '../models/newIndex.js';

const migrate = async () => {
    try {
        console.log('🔄 Starting database migration for new ERD structure...');

        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Drop all tables if they exist (be careful!)
        console.log('⚠️  Dropping existing tables...');
        await sequelize.drop();

        // Create all tables in the correct order
        console.log('📋 Creating tables...');

        // 1. Create users_type table first (no dependencies)
        await UsersType.sync({ force: true });
        console.log('✅ users_type table created');

        // 2. Create mentor table (no dependencies)
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
        const userType = await UsersType.create({
            user_type_name: 'user'
        });
        const mentorType = await UsersType.create({
            user_type_name: 'mentor'
        });

        console.log('✅ User types created');

        // Create admin user
        const adminUser = await User.create({
            user_type_id: adminType.user_type_id,
            status: 'active',
            email: 'admin@example.com',
            password: 'admin123'
        });

        console.log('✅ Admin user created');

        // Create sample mentor
        await Mentor.create({
            firstname: 'John',
            lastname: 'Doe',
            gender: 'male',
            phone_number: '+1234567890',
            address: '123 Main St, City',
            description: 'Experienced software engineer and mentor',
            profile_picture: 'https://example.com/profile.jpg'
        });

        console.log('✅ Sample mentor created');

        // Create sample subscription plan
        await SubscriptionPlan.create({
            admin_id: adminUser.user_id,
            name: 'Basic Mentorship',
            price: 242.000, // Using decimal format as per your ERD
            duration_day: 30,
            description: 'Basic mentorship plan for 1 month'
        });

        console.log('✅ Sample subscription plan created');

        console.log('🎉 Database setup completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await sequelize.close();
    }
};

migrate();