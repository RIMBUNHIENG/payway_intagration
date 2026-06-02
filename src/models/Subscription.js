const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stripeSubscriptionId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'stripe_subscription_id'
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'customer_id',
        references: {
            model: 'customers',
            key: 'id'
        }
    },
    priceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'price_id',
        references: {
            model: 'prices',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM(
            'incomplete',
            'incomplete_expired',
            'trialing',
            'active',
            'past_due',
            'canceled',
            'unpaid'
        ),
        allowNull: false,
        defaultValue: 'incomplete'
    },
    currentPeriodStart: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'current_period_start'
    },
    currentPeriodEnd: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'current_period_end'
    },
    canceledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'canceled_at'
    },
    cancelAtPeriodEnd: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'cancel_at_period_end'
    },
    trialStart: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'trial_start'
    },
    trialEnd: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'trial_end'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'subscriptions',
    indexes: [
        {
            unique: true,
            fields: ['stripe_subscription_id']
        },
        {
            fields: ['customer_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['current_period_end']
        }
    ]
});

module.exports = Subscription;
