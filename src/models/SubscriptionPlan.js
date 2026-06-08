import { DataTypes } from 'sequelize';
import { sequelize } from '../database/config.js';

const NewSubscriptionPlan = sequelize.define('NewSubscriptionPlan', {
    subscription_Plan_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'subscription_Plan_id'
    },
    admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Assuming admin is a user
            key: 'user_id'
        }
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        comment: 'Price with 3 decimal places (e.g., 242.000)'
    },
    duration_day: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Duration in days'
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'subscription_Plan',
    timestamps: true, // This will add createdAt and updatedAt
    createdAt: 'create_date',
    updatedAt: 'update_date'
});

export default NewSubscriptionPlan;