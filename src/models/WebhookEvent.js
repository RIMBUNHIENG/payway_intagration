const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

const WebhookEvent = sequelize.define('WebhookEvent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stripeEventId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'stripe_event_id'
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Event type (e.g., payment_intent.succeeded)'
    },
    data: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Event data payload'
    },
    processed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'processed_at'
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'error_message'
    }
}, {
    tableName: 'webhook_events',
    indexes: [
        {
            unique: true,
            fields: ['stripe_event_id']
        },
        {
            fields: ['type']
        },
        {
            fields: ['processed']
        },
        {
            fields: ['created_at']
        }
    ]
});

module.exports = WebhookEvent;
