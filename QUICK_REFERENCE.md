# 📋 Quick Reference Card

## 🚀 Setup Commands

```bash
# Install dependencies
npm install

# Create database tables
npm run db:migrate

# Start server
npm start

# Start with auto-reload (development)
npm run dev
```

---

## 📂 File Structure

```
stripe-payment-integration/
├── src/
│   ├── config/stripe.js                 # Stripe SDK config
│   ├── database/
│   │   ├── config.js                    # DB connection
│   │   └── migrate.js                   # Create tables
│   ├── models/                          # 7 Models
│   │   ├── index.js                     # Relationships
│   │   ├── Customer.js
│   │   ├── Payment.js
│   │   ├── Product.js
│   │   ├── Price.js
│   │   ├── Refund.js
│   │   ├── Subscription.js
│   │   └── WebhookEvent.js
│   ├── controllers/                     # 4 Controllers
│   │   ├── CustomerController.js
│   │   ├── PaymentController.js
│   │   ├── ProductController.js
│   │   └── WebhookController.js
│   ├── routes/                          # 5 Routes
│   │   ├── customers.js
│   │   ├── payments.js
│   │   ├── products.js
│   │   ├── checkout.js
│   │   └── webhooks.js
│   └── middleware/                      # 2 Middleware
│       ├── validation.js
│       └── errorHandler.js
├── server.js                            # Entry point
├── client-example.html                  # Frontend demo
├── .env                                 # Config (configured!)
└── database.sqlite                      # DB file (after migration)
```

---

## 🔌 API Endpoints Cheat Sheet

### Customers
```bash
# Create
POST /api/customers/create
{"email":"user@example.com","name":"John Doe"}

# Get
GET /api/customers/:id

# Stats
GET /api/customers/:id/stats

# List
GET /api/customers?limit=10&page=1
```

### Payments
```bash
# Create payment intent
POST /api/payments/create-payment-intent
{"amount":2000,"currency":"usd","email":"user@example.com"}

# Get payment
GET /api/payments/payment-intent/:id

# List payments
GET /api/payments?status=succeeded&limit=10

# Refund
POST /api/payments/refund
{"paymentIntentId":"pi_xxx","amount":1000}
```

### Products
```bash
# Create product with price
POST /api/products/create
{"name":"Premium","amount":2999,"currency":"usd"}

# Get product
GET /api/products/:id

# List products
GET /api/products?limit=10
```

### Checkout
```bash
# Create checkout session
POST /api/checkout/create-checkout-session
{"priceId":"price_xxx","mode":"payment"}

# Get session
GET /api/checkout/checkout-session/:id
```

---

## 💳 Test Cards

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Decline |
| `4000 0025 0000 3155` | 🔐 3D Secure |

Expiry: Any future date (12/25)  
CVC: Any 3 digits (123)  
ZIP: Any ZIP (12345)

---

## 🗄️ Database Tables

1. **customers** - Customer records
2. **products** - Product catalog
3. **prices** - Pricing tiers
4. **payments** - Transactions
5. **refunds** - Refund records
6. **subscriptions** - Recurring billing
7. **webhook_events** - Event logs

---

## 🔍 Database Queries

```bash
# SQLite - View customers
sqlite3 database.sqlite "SELECT * FROM customers;"

# View payments
sqlite3 database.sqlite "SELECT * FROM payments;"

# View with join
sqlite3 database.sqlite "
  SELECT c.email, p.amount, p.status 
  FROM payments p 
  JOIN customers c ON p.customer_id = c.id;
"

# Interactive mode
sqlite3 database.sqlite
.tables
SELECT * FROM customers;
.quit
```

---

## 🔧 Environment Variables

```env
# Stripe (already configured!)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database (default: SQLite)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# Server
PORT=3000
NODE_ENV=development
```

---

## 🎯 Testing Flow

### 1. Create Customer
```bash
curl -X POST http://localhost:3000/api/customers/create \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 2. Create Payment
```bash
curl -X POST http://localhost:3000/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount":2000,"currency":"usd","email":"test@example.com"}'
```

### 3. Check Database
```bash
sqlite3 database.sqlite "SELECT * FROM customers;"
sqlite3 database.sqlite "SELECT * FROM payments;"
```

### 4. Get Customer Stats
```bash
curl http://localhost:3000/api/customers/1/stats
```

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Unable to connect to database" | Run `npm run db:migrate` |
| "Table doesn't exist" | Run `npm run db:migrate` |
| "Port already in use" | Change PORT in .env or kill process |
| "Stripe key not found" | Check .env file exists and has keys |
| "Module not found" | Run `npm install` |

---

## 📊 MVC Flow

```
Route → Controller → Model → Database
  ↓         ↓          ↓
Endpoint  Logic    Data Layer
```

**Example: Create Payment**
1. Route: `POST /api/payments/create-payment-intent`
2. Controller: `PaymentController.createPaymentIntent()`
3. Model: `Payment.create()`
4. Database: `INSERT INTO payments ...`

---

## 🔄 Data Flow

```
CLIENT (Frontend)
    ↓ HTTP Request
ROUTE (API Endpoint)
    ↓ Forward
CONTROLLER (Business Logic)
    ├─ Call Stripe API
    └─ Call Model
MODEL (ORM)
    ↓ SQL Query
DATABASE (SQLite/PostgreSQL/MySQL)
    ↓ Response
CONTROLLER
    ↓ JSON Response
CLIENT
```

---

## 🎨 Code Examples

### Create Customer (Controller)
```javascript
const customer = await Customer.findOne({ 
  where: { email } 
});

if (!customer) {
  customer = await Customer.create({
    stripeCustomerId: stripeCustomer.id,
    email,
    name
  });
}
```

### Get with Relationship
```javascript
const customer = await Customer.findByPk(id, {
  include: [
    {
      model: Payment,
      as: 'payments',
      limit: 10
    }
  ]
});
```

### Query with Filter
```javascript
const payments = await Payment.findAll({
  where: { 
    status: 'succeeded',
    customerId: 1
  },
  limit: 10,
  order: [['createdAt', 'DESC']]
});
```

---

## 📚 Documentation Files

- `README.md` - Main overview
- `GETTING_STARTED.md` - Quick setup
- `API_DOCUMENTATION.md` - API reference
- `DATABASE.md` - Database schema
- `DATABASE_DIAGRAM.md` - Visual relationships
- `MVC_STRUCTURE.md` - Architecture
- `IMPLEMENTATION_SUMMARY.md` - What's included
- `QUICK_REFERENCE.md` - This file!

---

## 🚀 Deployment Checklist

### Development
- [x] SQLite configured
- [x] Stripe test keys
- [x] Local testing

### Production
- [ ] Switch to PostgreSQL/MySQL
- [ ] Use Stripe live keys
- [ ] Enable HTTPS
- [ ] Set up webhooks in Stripe Dashboard
- [ ] Configure CORS for your domain
- [ ] Set NODE_ENV=production
- [ ] Database backups
- [ ] Monitoring/logging

---

## ⚡ Quick Commands

```bash
# Health check
curl http://localhost:3000

# List all customers
curl http://localhost:3000/api/customers

# List all payments
curl http://localhost:3000/api/payments

# View database
sqlite3 database.sqlite .dump

# Reset database
rm database.sqlite && npm run db:migrate

# View logs
tail -f logs/*.log  # (if logging configured)
```

---

## 🎯 Your Next Steps

1. ✅ Run `npm run db:migrate`
2. ✅ Run `npm start`
3. ✅ Test API with curl
4. ✅ Open `client-example.html`
5. ✅ Make a test payment
6. ✅ Check database
7. ✅ Build your application!

---

## 💡 Pro Tips

1. **Always check database after API calls**
2. **Use customer stats endpoint for analytics**
3. **Monitor webhook_events table for debugging**
4. **Paginate large result sets**
5. **Use metadata fields for custom data**
6. **Test with Stripe CLI for webhooks**
7. **Read the other documentation files**

---

## 📞 Resources

- Stripe Docs: https://stripe.com/docs
- Sequelize Docs: https://sequelize.org
- Express Docs: https://expressjs.com

---

**Bookmark this page for quick reference!** 🔖
