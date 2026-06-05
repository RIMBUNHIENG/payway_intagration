import Customer from './Customer.js';
import Product from './Product.js';
import Price from './Price.js';
import Payment from './Payment.js';
import Refund from './Refund.js';
import Subscription from './Subscription.js';
import WebhookEvent from './WebhookEvent.js';
import User from './User.js';
import SubscriptionPlan from './SubscriptionPlan.js';
import UserSubscription from './UserSubscription.js';
import SubscriptionHistory from './SubscriptionHistory.js';

// Define Relationships

// Product -> Price (One to Many)
Product.hasMany(Price, {
    foreignKey: 'product_id',
    as: 'prices',
    onDelete: 'CASCADE'
});
Price.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});

// Customer -> Payment (One to Many)
Customer.hasMany(Payment, {
    foreignKey: 'customer_id',
    as: 'payments',
    onDelete: 'SET NULL'
});
Payment.belongsTo(Customer, {
    foreignKey: 'customer_id',
    as: 'customer'
});

// Payment -> Refund (One to Many)
Payment.hasMany(Refund, {
    foreignKey: 'payment_id',
    as: 'refunds',
    onDelete: 'CASCADE'
});
Refund.belongsTo(Payment, {
    foreignKey: 'payment_id',
    as: 'payment'
});

// Customer -> Subscription (One to Many)
Customer.hasMany(Subscription, {
    foreignKey: 'customer_id',
    as: 'subscriptions',
    onDelete: 'CASCADE'
});
Subscription.belongsTo(Customer, {
    foreignKey: 'customer_id',
    as: 'customer'
});

// Price -> Subscription (One to Many)
Price.hasMany(Subscription, {
    foreignKey: 'price_id',
    as: 'subscriptions',
    onDelete: 'RESTRICT'
});
Subscription.belongsTo(Price, {
    foreignKey: 'price_id',
    as: 'price'
});

// User -> UserSubscription (One to Many)
User.hasMany(UserSubscription, {
    foreignKey: 'user_id',
    as: 'subscriptions',
    onDelete: 'CASCADE'
});
UserSubscription.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// SubscriptionPlan -> UserSubscription (One to Many)
SubscriptionPlan.hasMany(UserSubscription, {
    foreignKey: 'plan_id',
    as: 'subscriptions',
    onDelete: 'RESTRICT'
});
UserSubscription.belongsTo(SubscriptionPlan, {
    foreignKey: 'plan_id',
    as: 'plan'
});

// User -> SubscriptionHistory (One to Many)
User.hasMany(SubscriptionHistory, {
    foreignKey: 'user_id',
    as: 'subscription_history',
    onDelete: 'CASCADE'
});
SubscriptionHistory.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// UserSubscription -> SubscriptionHistory (One to Many)
UserSubscription.hasMany(SubscriptionHistory, {
    foreignKey: 'subscription_id',
    as: 'history',
    onDelete: 'CASCADE'
});
SubscriptionHistory.belongsTo(UserSubscription, {
    foreignKey: 'subscription_id',
    as: 'subscription'
});

export {
    Customer,
    Product,
    Price,
    Payment,
    Refund,
    Subscription,
    WebhookEvent,
    User,
    SubscriptionPlan,
    UserSubscription,
    SubscriptionHistory
};
