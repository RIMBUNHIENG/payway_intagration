const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

const Refund = sequelize.define('Refund', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stripeRefundId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'stripe_refund_id'
    },
    paymentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'payment_id',
        references: {
            model: 'payments',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Refund amount in cents'
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'usd'
    },
    reason: {
        type: DataTypes.ENUM('duplicate', 'fraudulent', 'requested_by_customer'),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'canceled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    refundedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'refunded_at'
    }
}, {
    tableName: 'refunds',
    indexes: [
        {
            unique: true,
            fields: ['stripe_refund_id']
        },
        {
            fields: ['payment_id']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = Refund;
