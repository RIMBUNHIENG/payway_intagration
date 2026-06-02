const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stripeCustomerId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'stripe_customer_id'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.JSON,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'customers',
    indexes: [
        {
            unique: true,
            fields: ['stripe_customer_id']
        },
        {
            fields: ['email']
        }
    ]
});

module.exports = Customer;
