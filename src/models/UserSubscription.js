import { DataTypes  } from 'sequelize';
import { sequelize  } from '../database/config.js';

const UserSubscription = sequelize.define('UserSubscription', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    subscriptionPlanId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'subscription_plan_id',
        references: {
            model: 'subscription_plans',
            key: 'id'
        }
    },
    stripeSubscriptionId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'stripe_subscription_id'
    },
    status: {
        type: DataTypes.ENUM(
            'incomplete',
            'incomplete_expired',
            'trialing',
            'active',
            'past_due',
            'canceled',
            'unpaid',
            'paused'
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
    cancelReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'cancel_reason'
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
    startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'started_at',
        comment: 'When subscription became active'
    },
    endedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'ended_at',
        comment: 'When subscription ended'
    },
    autoRenew: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'auto_renew'
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    tableName: 'user_subscriptions',
    indexes: [
        {
            unique: true,
            fields: ['stripe_subscription_id']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['subscription_plan_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['current_period_end']
        },
        {
            fields: ['auto_renew']
        }
    ]
});

export default UserSubscription;
