import { DataTypes } from 'sequelize';
import { sequelize } from '../database/config.js';

const NewSubscription = sequelize.define('NewSubscription', {
    subscription_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    subscription_Plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'subscription_Plan_id',
        references: {
            model: 'subscription_Plan',
            key: 'subscription_Plan_id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    user_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users_type',
            key: 'user_type_id'
        }
    }
}, {
    tableName: 'subscription',
    timestamps: true, // This will add createdAt and updatedAt
    createdAt: 'create_date',
    updatedAt: 'update_date'
});

export default NewSubscription;