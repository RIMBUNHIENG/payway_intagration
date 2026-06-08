import { sequelize } from '../database/config.js';

// Import all models based on your ERD
import Mentor from './Mentor.js';
import UsersType from './UsersType.js';
import User from './User.js';
import SubscriptionPlan from './SubscriptionPlan.js';
import Subscription from './Subscription.js';

// Define relationships based on your ERD

// Users belongs to UsersType
User.belongsTo(UsersType, {
    foreignKey: 'user_type_id',
    as: 'userType'
});
UsersType.hasMany(User, {
    foreignKey: 'user_type_id',
    as: 'users'
});

// SubscriptionPlan belongs to admin (User)
SubscriptionPlan.belongsTo(User, {
    foreignKey: 'admin_id',
    as: 'admin'
});
User.hasMany(SubscriptionPlan, {
    foreignKey: 'admin_id',
    as: 'createdPlans'
});

// Subscription belongs to SubscriptionPlan
Subscription.belongsTo(SubscriptionPlan, {
    foreignKey: 'subscription_Plan_id',
    as: 'subscriptionPlan'
});
SubscriptionPlan.hasMany(Subscription, {
    foreignKey: 'subscription_Plan_id',
    as: 'subscriptions'
});

// Subscription belongs to User
Subscription.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});
User.hasMany(Subscription, {
    foreignKey: 'user_id',
    as: 'subscriptions'
});

// Subscription belongs to UsersType
Subscription.belongsTo(UsersType, {
    foreignKey: 'user_type_id',
    as: 'userType'
});
UsersType.hasMany(Subscription, {
    foreignKey: 'user_type_id',
    as: 'subscriptions'
});

export {
    sequelize,
    Mentor,
    UsersType,
    User,
    SubscriptionPlan,
    Subscription
};