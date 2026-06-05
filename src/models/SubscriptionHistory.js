import { DataTypes  } from 'sequelize';
import { sequelize  } from '../database/config.js';

const SubscriptionHistory = sequelize.define('SubscriptionHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userSubscriptionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_subscription_id',
        references: {
            model: 'user_subscriptions',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    event: {
        type: DataTypes.ENUM(
            'created',
            'activated',
            'renewed',
            'upgraded',
            'downgraded',
            'canceled',
            'paused',
            'resumed',
            'expired',
            'payment_failed',
            'trial_started',
            'trial_ended'
        ),
        allowNull: false
    },
    previousStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'previous_status'
    },
    newStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'new_status'
    },
    previousPlanId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'previous_plan_id'
    },
    newPlanId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'new_plan_id'
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Transaction amount in cents'
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'usd'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Additional event data'
    },
    stripeEventId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'stripe_event_id',
        comment: 'Related Stripe webhook event ID'
    }
}, {
    tableName: 'subscription_history',
    indexes: [
        {
            fields: ['user_subscription_id']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['event']
        },
        {
            fields: ['created_at']
        }
    ]
});

export default SubscriptionHistory;
