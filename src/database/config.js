require('dotenv').config();
const { Sequelize } = require('sequelize');

// Database configuration
let sequelize;

// Option 1: Use DATABASE_URL (connection string) - for Neon, Heroku, Railway, etc.
if (process.env.DATABASE_URL) {
    console.log('🔌 Using DATABASE_URL connection string');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Required for Neon and similar services
            }
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
            timestamps: true,
            underscored: true,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
}
// Option 2: Use individual database settings (SQLite, local PostgreSQL, MySQL)
else {
    console.log(`🔌 Using individual DB settings (${process.env.DB_DIALECT || 'sqlite'})`);
    sequelize = new Sequelize({
        dialect: process.env.DB_DIALECT || 'sqlite',
        storage: process.env.DB_STORAGE || './database.sqlite',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
            timestamps: true,
            underscored: true,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
}

// Test connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, testConnection };
