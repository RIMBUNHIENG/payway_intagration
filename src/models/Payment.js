import { DataTypes  } from 'sequelize';
import { sequelize  } from '../database/config.js';

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stripePaymentIntentId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'stripe_payment_intent_id'
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'customer_id',
        references: {
            model: 'customers',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Amount in cents'
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'usd'
    },
    status: {
        type: DataTypes.ENUM(
            'requires_payment_method',
            'requires_confirmation',
            'requires_action',
            'processing',
            'requires_capture',
            'canceled',
            'succeeded'
        ),
        allowNull: false,
        defaultValue: 'requires_payment_method'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'payment_method',
        comment: 'Type of payment method (card, bank_account, etc.)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    receiptEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'receipt_email'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    chargeId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'charge_id',
        comment: 'Stripe Charge ID'
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'error_message'
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'paid_at'
    }
}, {
    tableName: 'payments',
    indexes: [
        {
            unique: true,
            fields: ['stripe_payment_intent_id']
        },
        {
            fields: ['customer_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['paid_at']
        }
    ]
});

export default Payment;
