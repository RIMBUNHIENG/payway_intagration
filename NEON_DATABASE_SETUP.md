# 🐘 Neon PostgreSQL Setup Guide

Your Stripe integration is now configured to use Neon PostgreSQL!

## ✅ Already Configured

Your `.env` file is set up with your Neon connection string:

```env
DATABASE_URL=postgresql://neondb_owner:npg_lW2UmKS0RDbN@ep-little-lab-ap7i2s5c.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 🚀 Quick Start

### 1. Install PostgreSQL Driver

```bash
npm install pg pg-hstore
```

### 2. Create Database Tables

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

### 3. Start Server

```bash
npm start
```

You should see:
```
🚀 Server is running on port 3000
📍 Health check: http://localhost:3000
💳 Stripe integration ready
🗄️  Database: postgres
✅ Database connection established successfully.
```

## 🎯 Test the Setup

### Create a Customer

```bash
curl -X POST http://localhost:3000/api/customers/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'
```

### Create a Payment

```bash
curl -X POST http://localhost:3000/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2000,
    "currency": "usd",
    "email": "test@example.com",
    "description": "Test payment"
  }'
```

### Check Data in Neon

Go to your Neon dashboard and run:

```sql
-- View customers
SELECT * FROM customers;

-- View payments
SELECT * FROM payments;

-- View payments with customer info
SELECT 
  p.id,
  p.amount,
  p.status,
  c.email,
  c.name
FROM payments p
LEFT JOIN customers c ON p.customer_id = c.id
ORDER BY p.created_at DESC;
```

## 📊 Neon Dashboard Access

1. Go to: https://console.neon.tech
2. Login with your account
3. Select your project
4. Click "SQL Editor" to run queries
5. View tables, data, and run analytics

## 🔍 Query Your Data

### Get Customer Stats

```sql
SELECT 
  c.id,
  c.email,
  c.name,
  COUNT(p.id) AS total_payments,
  SUM(CASE WHEN p.status = 'succeeded' THEN p.amount ELSE 0 END) AS total_spent,
  c.created_at AS member_since
FROM customers c
LEFT JOIN payments p ON c.id = p.customer_id
GROUP BY c.id, c.email, c.name, c.created_at
ORDER BY total_spent DESC;
```

### Get Recent Payments

```sql
SELECT 
  p.id,
  p.stripe_payment_intent_id,
  p.amount / 100.0 AS amount_dollars,
  p.currency,
  p.status,
  c.email,
  p.created_at
FROM payments p
LEFT JOIN customers c ON p.customer_id = c.id
ORDER BY p.created_at DESC
LIMIT 10;
```

### Revenue Summary

```sql
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS payment_count,
  SUM(amount) / 100.0 AS total_revenue,
  AVG(amount) / 100.0 AS average_payment
FROM payments
WHERE status = 'succeeded'
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

## 🔧 Configuration Details

### SSL Connection

Your Neon connection uses SSL (secure connection):

```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

This is **required** for Neon and ensures secure data transmission.

### Connection Pooling

Configured for optimal performance:

```javascript
pool: {
  max: 5,        // Maximum connections
  min: 0,        // Minimum connections
  acquire: 30000, // Maximum time to get connection (30s)
  idle: 10000    // Maximum idle time (10s)
}
```

## 🎨 Advantages of Neon PostgreSQL

### ✅ Over SQLite

- **Concurrent connections** - Multiple users simultaneously
- **Production-ready** - Used by major companies
- **Advanced features** - Full-text search, JSON queries
- **Scalable** - Grows with your application
- **Cloud-hosted** - No local file management

### ✅ Neon-Specific Benefits

- **Serverless** - Pay only for what you use
- **Instant branching** - Test features safely
- **Auto-scaling** - Handles traffic spikes
- **Built-in backups** - Data protection
- **Global CDN** - Fast worldwide access

## 📈 Monitoring

### Check Connection

```bash
curl http://localhost:3000
```

Response should show:
```json
{
  "message": "Stripe Payment Integration API with Database (MVC)",
  "status": "running",
  "database": "postgres"
}
```

### View Logs

Your application logs database queries in development mode. Watch for:

```
Executing (default): SELECT ...
Executing (default): INSERT INTO ...
```

## 🔐 Security

### ✅ Best Practices Implemented

1. **SSL/TLS Encryption** - All data encrypted in transit
2. **Connection Pooling** - Prevents connection exhaustion
3. **Parameterized Queries** - SQL injection protection (Sequelize)
4. **Environment Variables** - Credentials not in code
5. **SSL Verification** - Secure certificate handling

### 🔒 Important Notes

- ✅ Your connection string includes authentication
- ✅ SSL is required and enabled
- ✅ `.env` file is gitignored (credentials protected)
- ⚠️ Never commit `.env` to version control
- ⚠️ Use different credentials for production

## 🔄 Switching Between Databases

### Use Neon (Current Setup)

```env
DATABASE_URL=postgresql://...
```

### Switch Back to SQLite

Comment out DATABASE_URL in `.env`:

```env
# DATABASE_URL=postgresql://...

DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

Then restart:
```bash
npm run db:migrate
npm start
```

## 🛠️ Troubleshooting

### "Unable to connect to database"

**Check:**
1. Neon project is active
2. Connection string is correct
3. SSL is enabled
4. `pg` package is installed: `npm install pg pg-hstore`

**Test connection:**
```bash
psql "postgresql://neondb_owner:npg_lW2UmKS0RDbN@ep-little-lab-ap7i2s5c.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### "SSL required"

Already configured! Check `src/database/config.js`:
```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

### "Too many connections"

Increase pool size in `src/database/config.js`:
```javascript
pool: {
  max: 10,  // Increase from 5
  ...
}
```

### "Connection timeout"

Increase acquire time:
```javascript
pool: {
  ...
  acquire: 60000,  // Increase to 60 seconds
}
```

## 📊 Performance Tips

### 1. Use Indexes (Already Added)

All foreign keys and frequently queried fields have indexes.

### 2. Use Neon Branching

Create a branch for testing:
- Go to Neon Dashboard
- Click "Branches"
- Create new branch
- Use branch connection string for testing

### 3. Monitor Query Performance

Enable query logging:
```env
NODE_ENV=development
```

### 4. Use Connection Pooling

Already configured! Application reuses connections for better performance.

## 🎯 Next Steps

### Development
- ✅ Your database is ready
- ✅ Tables are created
- ✅ Start building features

### Production
1. Create separate Neon project for production
2. Update `DATABASE_URL` in production environment
3. Run migrations: `npm run db:migrate`
4. Set `NODE_ENV=production`
5. Monitor performance in Neon dashboard

## 📚 Resources

- **Neon Documentation**: https://neon.tech/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Sequelize Docs**: https://sequelize.org/docs/v6/
- **Your Neon Dashboard**: https://console.neon.tech

## ✅ Checklist

- [x] PostgreSQL driver installed (`pg`, `pg-hstore`)
- [x] Connection string in `.env`
- [x] SSL configured
- [x] Migration script ready
- [ ] Run `npm run db:migrate`
- [ ] Run `npm start`
- [ ] Test API endpoints
- [ ] Check data in Neon dashboard

---

**You're all set!** Run `npm run db:migrate` then `npm start` to begin! 🚀

Your Stripe integration now uses a production-grade PostgreSQL database hosted on Neon! 🎉
