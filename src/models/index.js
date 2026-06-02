const Customer = require('./Customer');
const Product = require('./Product');
const Price = require('./Price');
const Payment = require('./Payment');
const Refund = require('./Refund');
const Subscription = require('./Subscription');
const WebhookEvent = require('./WebhookEvent');
const User = require('./User');
const SubscriptionPlan = require('./SubscriptionPlan');
const UserSubscription = require('./UserSubscription');
const SubscriptionHistory = require('./SubscriptionHistory');

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

module.exports = {
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
