import { DataTypes  } from 'sequelize';
import { sequelize  } from '../database/config.js';

const Price = sequelize.define('Price', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stripePriceId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'stripe_price_id'
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id',
        references: {
            model: 'products',
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
    type: {
        type: DataTypes.ENUM('one_time', 'recurring'),
        allowNull: false,
        defaultValue: 'one_time'
    },
    recurring: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Recurring interval details (interval, interval_count)'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'prices',
    indexes: [
        {
            unique: true,
            fields: ['stripe_price_id']
        },
        {
            fields: ['product_id']
        }
    ]
});

export default Price;
