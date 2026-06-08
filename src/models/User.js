import { DataTypes } from 'sequelize';
import { sequelize } from '../database/config.js';
import bcrypt from 'bcrypt';

const NewUser = sequelize.define('NewUser', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users_type',
            key: 'user_type_id'
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active'
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
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
    tableName: 'users',
    timestamps: false, // Using custom timestamp fields
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});
// Instance method to compare password
NewUser.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get safe object (without password)
NewUser.prototype.toSafeObject = function () {
    const { password, ...safeUser } = this.toJSON();
    return safeUser;
};

export default NewUser;