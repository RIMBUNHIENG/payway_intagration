# Stripe Payment Integration with Database (MVC Pattern)

A complete, production-ready Stripe payment integration built with Node.js/Express following MVC architecture with full database persistence using Sequelize ORM.

## 🌟 Features

### Payment Processing
- ✅ Payment Intents API (custom payment flows)
- ✅ Checkout Sessions (hosted checkout)
- ✅ Refund processing
- ✅ Payment confirmation & cancellation

### Customer Management
- ✅ Customer creation and management
- ✅ Customer payment history
- ✅ Customer analytics and stats
- ✅ Payment method storage

### Product & Pricing
- ✅ Product catalog management
- ✅ Multiple pricing tiers
- ✅ One-time and recurring pricing
- ✅ Subscription support

### Database & Persistence
- ✅ Full payment history
- ✅ Customer records
- ✅ Transaction tracking
- ✅ Webhook event logging
- ✅ Relationship management
- ✅ SQLite/PostgreSQL/MySQL support

### Architecture
- ✅ MVC pattern (Model-View-Controller)
- ✅ Sequelize ORM
- ✅ RESTful API design
- ✅ Input validation
- ✅ Error handling
- ✅ CORS enabled

---

## 📁 Project Structure

```
stripe-payment-integration/
├── src/
│   ├── config/              # Configuration
│   │   └── stripe.js
│   ├── database/            # Database setup
│   │   ├── config.js
│   │   └── migrate.js
│   ├── models/              # Data models (ORM)
│   │   ├── Customer.js
│   │   ├── Payment.js
│   │   ├── Product.js
│   │   ├── Price.js
│   │   ├── Refund.js
│   │   ├── Subscription.js
│   │   ├── WebhookEvent.js
│   │   └── index.js
│   ├── controllers/         # Business logic
│   │   ├── CustomerController.js
│   │   ├── PaymentController.js
│   │   ├── ProductController.js
│   │   └── WebhookController.js
│   ├── routes/              # API endpoints
│   │   ├── customers.js
│   │   ├── payments.js
│   │   ├── products.js
│   │   ├── checkout.js
│   │   └── webhooks.js
│   └── middleware/          # Middleware
│       ├── validation.js
│       └── errorHandler.js
├── server.js                # Application entry
├── client-example.html      # Frontend demo
├── package.json
├── .env                     # Environment variables
└── database.sqlite          # Database file (SQLite)
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Your `.env` file is already configured with:
- ✅ Stripe API keys
- ✅ SQLite database (default)

### 3. Create Database Tables

```bash
npm run db:migrate
```

### 4. Start Server

```bash
npm start
```

Server runs on `http://localhost:3000`

### 5. Test the API

```bash
# Create a customer
curl -X POST http://localhost:3000/api/customers/create \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Create a payment
curl -X POST http://localhost:3000/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount":2000,"currency":"usd","email":"test@example.com"}'
```

---

## 📖 Documentation

- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Quick setup guide
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference
- **[DATABASE.md](DATABASE.md)** - Database schema and setup
- **[DATABASE_DIAGRAM.md](DATABASE_DIAGRAM.md)** - Visual database relationships
- **[MVC_STRUCTURE.md](MVC_STRUCTURE.md)** - Architecture explanation
- **[SETUP.md](SETUP.md)** - Detailed setup instructions

---

## 🗄️ Database

### Supported Databases


1. **PostgreSQL** - Production recommended





## 💳 Test Cards

| Card Number | Description |
|------------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | Requires authentication |

Use any future date, any 3-digit CVC, and any ZIP code.

---

## 🔧 Configuration

### Environment Variables

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Database (SQLite - default)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# Server
PORT=3000
NODE_ENV=development
```


## 🔐 Security

- ✅ Input validation on all endpoints
- ✅ Webhook signature verification
- ✅ SQL injection protection (Sequelize ORM)
- ✅ Environment variable protection
- ✅ CORS configuration
- ✅ Error message sanitization

---

## 📊 MVC Pattern

### Models (Data Layer)
Define database structure and relationships using Sequelize ORM.

### Controllers (Business Logic)
Handle business logic, interact with Stripe API, and manage database operations.

### Routes (API Layer)
Define API endpoints and route requests to controllers.

### Views (Frontend)
Simple HTML client demonstrating integration (or use React/Vue/Angular).

---

## 🎯 What Makes This Different?

### Standard Stripe Integration
- ❌ No persistence
- ❌ Lost data on restart
- ❌ No customer history
- ❌ No analytics

### This Integration
- ✅ Full database persistence
- ✅ Complete payment history
- ✅ Customer management
- ✅ Advanced analytics
- ✅ Webhook event logging
- ✅ Production-ready structure
- ✅ MVC architecture
- ✅ Scalable design

---

## 📈 Advanced Features

### Customer Analytics

```bash
curl http://localhost:3000/api/customers/1/stats
```

Returns:
- Total spent
- Payment count
- Active subscriptions
- Member since date

### Payment Filtering

```bash
# By status
curl "http://localhost:3000/api/payments?status=succeeded"

# By customer
curl "http://localhost:3000/api/payments?customerId=1"

# Pagination
curl "http://localhost:3000/api/payments?limit=10&page=2"
```

### Webhook Event Logging

All Stripe webhook events are automatically logged in the `webhook_events` table for auditing and debugging.

---

## 🚀 Deployment

### Development
- Uses SQLite
- Run locally with `npm start`

### Production
1. Switch to PostgreSQL/MySQL
2. Update `.env` with production database
3. Run `npm run db:migrate`
4. Deploy to your hosting platform
5. Set up webhook endpoint in Stripe Dashboard

---

## 🛠️ Available Scripts

```bash
npm start          # Start server
npm run dev        # Start with auto-reload (nodemon)
npm run db:migrate # Create database tables
```

---

## 📦 Dependencies

- **express** - Web framework
- **stripe** - Stripe SDK
- **sequelize** - ORM
- **sqlite3** - SQLite driver (default)
- **pg** - PostgreSQL driver
- **mysql2** - MySQL driver
- **dotenv** - Environment variables
- **cors** - CORS middleware
- **body-parser** - Request parsing

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📝 License

ISC

---

## 🆘 Support

### Common Issues

**Database not found:**
```bash
npm run db:migrate
```

**Port already in use:**
```bash
# Change PORT in .env or kill process
lsof -ti:3000 | xargs kill -9
```

**Stripe key error:**
Check your `.env` file has valid Stripe keys.

### Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Express Documentation](https://expressjs.com/)

---

## ✨ Credits

Built with ❤️ using:
- Node.js
- Express.js
- Stripe API
- Sequelize ORM

---

**Ready to accept payments?** Start with `npm install` and follow the quick start guide! 🎉
