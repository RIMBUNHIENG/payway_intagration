import { DataTypes  } from 'sequelize';
import { sequelize  } from '../database/config.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stripeProductId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'stripe_product_id'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'products',
    indexes: [
        {
            unique: true,
            fields: ['stripe_product_id']
        }
    ]
});

export default Product;
