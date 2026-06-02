const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Plan name (e.g., Basic, Premium, Enterprise)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    stripePriceId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'stripe_price_id',
        comment: 'Stripe Price ID'
    },
    stripeProductId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'stripe_product_id',
        comment: 'Stripe Product ID'
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Price in cents'
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'usd'
    },
    interval: {
        type: DataTypes.ENUM('day', 'week', 'month', 'year'),
        allowNull: false,
        comment: 'Billing interval'
    },
    intervalCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        field: 'interval_count',
        comment: 'Number of intervals between billings'
    },
    trialPeriodDays: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'trial_period_days',
        comment: 'Free trial days'
    },
    features: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Array of plan features'
    },
    limits: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Usage limits (users, storage, etc.)'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    isPopular: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_popular',
        comment: 'Flag for featured/popular plans'
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'sort_order',
        comment: 'Display order'
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    tableName: 'subscription_plans',
    indexes: [
        {
            unique: true,
            fields: ['stripe_price_id']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['interval']
        },
        {
            fields: ['sort_order']
        }
    ]
});

module.exports = SubscriptionPlan;
