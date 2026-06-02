# 🚀 Getting Started with Database-Enabled Stripe Integration

Quick start guide for setting up the MVC-based Stripe payment system with database.

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Already done! Your .env file is configured with:
# ✅ Stripe keys
# ✅ SQLite database (default)
```

### 3. Create Database Tables

```bash
npm run db:migrate
```

You should see:
```
🔄 Starting database migration...
✅ Database connection established successfully.
✅ Database migration completed successfully!
📊 Tables created:
   - customers
   - products
   - prices
   - payments
   - refunds
   - subscriptions
   - webhook_events
```

### 4. Start Server

```bash
npm start
```

You should see:
```
🚀 Server is running on port 3000
📍 Health check: http://localhost:3000
💳 Stripe integration ready
🗄️  Database: sqlite
```

### 5. Test the API

Open another terminal:

```bash
# Create a product
curl -X POST http://localhost:3000/api/products/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Plan",
    "description": "Monthly subscription",
    "amount": 2999,
    "currency": "usd"
  }'
```

✅ **Done!** Your system is running with database support.

---

## 📖 What's Different from the Basic Version?

### Before (Basic Version)
- ❌ No data persistence
- ❌ No customer records
- ❌ No payment history
- ❌ Lost data on restart

### Now (Database Version)
- ✅ All payments stored
- ✅ Customer management
- ✅ Full payment history
- ✅ Relationship tracking
- ✅ Webhook event logging
- ✅ Refund tracking
- ✅ Subscription management

---

## 🗄️ Database Options

### Option 1: SQLite (Default - Easiest)

**Already configured!** No additional setup needed.

**Pros:**
- ✅ No installation required
- ✅ File-based (database.sqlite)
- ✅ Perfect for development

**Cons:**
- ❌ Not recommended for production
- ❌ Limited concurrent connections

---

### Option 2: PostgreSQL (Production Ready)

**Installation:**

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
sudo service postgresql start

# Create database
createdb stripe_payments
```

**Update `.env`:**

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stripe_payments
DB_USER=postgres
DB_PASSWORD=your_password
```

**Run migration:**

```bash
npm run db:migrate
```

---

### Option 3: MySQL (Alternative)

**Installation:**

```bash
# macOS
brew install mysql
brew services start mysql

# Ubuntu/Debian
sudo apt-get install mysql-server
sudo service mysql start

# Create database
mysql -u root -p
CREATE DATABASE stripe_payments;
```

**Update `.env`:**

```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stripe_payments
DB_USER=root
DB_PASSWORD=your_password
```

**Run migration:**

```bash
npm run db:migrate
```

---

## 🧪 Testing the Database Integration

### 1. Create a Customer

```bash
curl -X POST http://localhost:3000/api/customers/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  }'
```

**Response:**
```json
{
  "success": true,
  "customer": {
    "id": 1,
    "stripeCustomerId": "cus_xxx",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Create a Payment

```bash
curl -X POST http://localhost:3000/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2000,
    "currency": "usd",
    "email": "john@example.com",
    "description": "Test payment"
  }'
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "paymentId": 1,
  "amount": 2000,
  "currency": "usd"
}
```

### 3. Get Customer with Payments

```bash
curl http://localhost:3000/api/customers/1
```

**Response:**
```json
{
  "success": true,
  "customer": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "payments": [
      {
        "id": 1,
        "amount": 2000,
        "status": "succeeded",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 4. Get Customer Stats

```bash
curl http://localhost:3000/api/customers/1/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "customerId": 1,
    "email": "john@example.com",
    "totalSpent": 2000,
    "totalPayments": 1,
    "activeSubscriptions": 0,
    "memberSince": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 📊 Viewing Your Data

### SQLite (Default)

**Option 1: Install DB Browser for SQLite**
- Download: https://sqlitebrowser.org/
- Open `database.sqlite` file
- Browse tables and data

**Option 2: Command Line**
```bash
sqlite3 database.sqlite

# View tables
.tables

# View customers
SELECT * FROM customers;

# View payments
SELECT * FROM payments;

# Exit
.quit
```

### PostgreSQL

```bash
psql stripe_payments

# View tables
\dt

# View customers
SELECT * FROM customers;

# View payments with customer info
SELECT p.*, c.email 
FROM payments p 
JOIN customers c ON p.customer_id = c.id;
```

### MySQL

```bash
mysql -u root -p stripe_payments

# View tables
SHOW TABLES;

# View customers
SELECT * FROM customers;

# View payments with customer info
SELECT p.*, c.email 
FROM payments p 
JOIN customers c ON p.customer_id = c.id;
```

---

## 🔄 Understanding the Flow

### Payment with Database

```
1. Customer visits website
2. Enters payment details
   ↓
3. Frontend calls POST /api/payments/create-payment-intent
   ↓
4. Controller checks if customer exists in DB
   - If not, creates customer in Stripe AND database
   ↓
5. Controller creates payment intent in Stripe
   ↓
6. Controller saves payment record to database
   ↓
7. Returns client secret to frontend
   ↓
8. Frontend completes payment with Stripe
   ↓
9. Stripe sends webhook to POST /api/webhook
   ↓
10. Webhook updates payment status in database
    ↓
11. Database now has complete payment record
```

---

## 📁 File Structure Explained

```
src/
├── models/           # Database table definitions
│   ├── Customer.js   # Customer table
│   ├── Payment.js    # Payments table
│   ├── Product.js    # Products table
│   └── ...
│
├── controllers/      # Business logic
│   ├── PaymentController.js    # Payment operations
│   ├── CustomerController.js   # Customer operations
│   └── ...
│
├── routes/           # API endpoints
│   ├── payments.js   # /api/payments/*
│   ├── customers.js  # /api/customers/*
│   └── ...
│
└── database/         # Database configuration
    ├── config.js     # Connection settings
    └── migrate.js    # Table creation script
```

---

## 🛠️ Common Tasks

### Reset Database

```bash
# Delete database file (SQLite)
rm database.sqlite

# Run migration again
npm run db:migrate
```

### Backup Database

```bash
# SQLite
cp database.sqlite database.backup.sqlite

# PostgreSQL
pg_dump stripe_payments > backup.sql

# MySQL
mysqldump stripe_payments > backup.sql
```

### View All Customers

```bash
curl http://localhost:3000/api/customers?limit=10&page=1
```

### View All Payments

```bash
curl http://localhost:3000/api/payments?limit=10&page=1
```

### Filter Payments by Status

```bash
curl "http://localhost:3000/api/payments?status=succeeded&limit=10"
```

### Filter Payments by Customer

```bash
curl "http://localhost:3000/api/payments?customerId=1"
```

---

## 🎯 Next Steps

### For Development
1. ✅ Use SQLite (default)
2. ✅ Test with Stripe test cards
3. ✅ Monitor webhook events
4. ✅ Check database after each operation

### For Production
1. 🔄 Switch to PostgreSQL or MySQL
2. 🔄 Set up database backups
3. 🔄 Enable SSL for database connections
4. 🔄 Add monitoring and logging
5. 🔄 Implement caching (Redis)
6. 🔄 Set up read replicas

---

## 📚 Documentation

- **API Reference**: See `API_DOCUMENTATION.md`
- **Database Schema**: See `DATABASE.md`
- **MVC Structure**: See `MVC_STRUCTURE.md`
- **Setup Guide**: See `SETUP.md`

---

## 🐛 Troubleshooting

### "Unable to connect to the database"
```bash
# Check .env file is present
ls -la .env

# Check database dialect
cat .env | grep DB_DIALECT

# Try migration again
npm run db:migrate
```

### "Table doesn't exist"
```bash
# Run migration
npm run db:migrate
```

### "Port 3000 already in use"
```bash
# Change port in .env
echo "PORT=3001" >> .env

# Or kill process
lsof -ti:3000 | xargs kill -9
```

### "Stripe key not found"
```bash
# Check .env has your keys
cat .env | grep STRIPE
```

---

## ✅ Checklist

- [x] Dependencies installed (`npm install`)
- [x] Environment configured (`.env` file)
- [x] Database migrated (`npm run db:migrate`)
- [x] Server running (`npm start`)
- [x] Test API endpoint (curl command)
- [x] Check database has data

---

## 💡 Tips

1. **Use SQLite for development** - It's already configured and working
2. **Check database after each API call** - Verify data is being saved
3. **Monitor webhook events** - Use `stripe listen` for local testing
4. **Use the stats endpoint** - Get customer analytics easily
5. **Paginate large result sets** - Use `?limit=10&page=1` parameters

---

## 🎉 You're Ready!

Your Stripe payment integration with database is now running. Start building your payment features!

Need help? Check the other documentation files or review the code in `src/` directory.

Happy coding! 🚀
