import { DataTypes  } from 'sequelize';
import { sequelize  } from '../database/config.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('admin', 'user', 'guest'),
        defaultValue: 'user'
    },
    stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        field: 'stripe_customer_id'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login'
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Additional user information'
    }
}, {
    tableName: 'users',
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            fields: ['stripe_customer_id']
        },
        {
            fields: ['role']
        }
    ],
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
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get safe user data (without password)
User.prototype.toSafeObject = function () {
    const { password, ...safeUser } = this.toJSON();
    return safeUser;
};

export default User;
