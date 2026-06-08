import { DataTypes } from 'sequelize';
import { sequelize } from '../database/config.js';

const Mentor = sequelize.define('Mentor', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstname: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    lastname: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    phone_number: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    profile_picture: {
        type: DataTypes.TEXT,
        allowNull: true
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
    tableName: 'mentor',
    timestamps: false // Using custom timestamp fields
});

export default Mentor;