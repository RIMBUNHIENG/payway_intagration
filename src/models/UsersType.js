import { DataTypes } from 'sequelize';
import { sequelize } from '../database/config.js';

const UsersType = sequelize.define('UsersType', {
    user_type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_type_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    create_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'create_date'
    },
    update_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'update_date'
    }
}, {
    tableName: 'users_type',
    timestamps: false // Using custom timestamp fields
});

export default UsersType;