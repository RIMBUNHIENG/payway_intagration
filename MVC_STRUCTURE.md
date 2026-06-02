# 🏗️ MVC Architecture Documentation

Complete guide to the Model-View-Controller structure of the Stripe Payment Integration.

## 📐 Architecture Overview

This project follows the MVC (Model-View-Controller) pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│              CLIENT (View)                   │
│         client-example.html                  │
└─────────────┬───────────────────────────────┘
              │ HTTP Requests
              ▼
┌─────────────────────────────────────────────┐
│         ROUTES (Entry Points)                │
│    - payments.js                             │
│    - customers.js                            │
│    - products.js                             │
│    - webhooks.js                             │
└─────────────┬───────────────────────────────┘
              │ Forward to Controllers
              ▼
┌─────────────────────────────────────────────┐
│       CONTROLLERS (Business Logic)           │
│    - PaymentController.js                    │
│    - CustomerController.js                   │
│    - ProductController.js                    │
│    - WebhookController.js                    │
└─────────────┬───────────────────────────────┘
              │ Data Operations
              ▼
┌─────────────────────────────────────────────┐
│         MODELS (Data Layer)                  │
│    - Customer.js                             │
│    - Product.js                              │
│    - Price.js                                │
│    - Payment.js                              │
│    - Refund.js                               │
│    - Subscription.js                         │
│    - WebhookEvent.js                         │
└─────────────┬───────────────────────────────┘
              │ Database Operations
              ▼
┌─────────────────────────────────────────────┐
│           DATABASE (SQLite/PostgreSQL/MySQL) │
└─────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
stripe-payment-integration/
├── src/
│   ├── config/
│   │   └── stripe.js              # Stripe SDK configuration
│   │
│   ├── database/
│   │   ├── config.js              # Database connection config
│   │   ├── migrate.js             # Database migration script
│   │   └── seed.js                # Seed data (optional)
│   │
│   ├── models/                    # DATA MODELS
│   │   ├── index.js               # Model aggregation & relationships
│   │   ├── Customer.js            # Customer model
│   │   ├── Product.js             # Product model
│   │   ├── Price.js               # Price model
│   │   ├── Payment.js             # Payment model
│   │   ├── Refund.js              # Refund model
│   │   ├── Subscription.js        # Subscription model
│   │   └── WebhookEvent.js        # Webhook event log model
│   │
│   ├── controllers/               # BUSINESS LOGIC
│   │   ├── CustomerController.js  # Customer operations
│   │   ├── PaymentController.js   # Payment operations
│   │   ├── ProductController.js   # Product operations
│   │   └── WebhookController.js   # Webhook handling
│   │
│   ├── routes/                    # API ROUTES
│   │   ├── customers.js           # Customer endpoints
│   │   ├── payments.js            # Payment endpoints
│   │   ├── products.js            # Product endpoints
│   │   ├── checkout.js            # Checkout endpoints
│   │   └── webhooks.js            # Webhook endpoint
│   │
│   └── middleware/                # MIDDLEWARE
│       ├── validation.js          # Request validation
│       └── errorHandler.js        # Global error handling
│
├── server.js                      # Application entry point
├── client-example.html            # Frontend example (View)
├── package.json                   # Dependencies
├── .env                           # Environment variables
├── README.md                      # General documentation
├── API_DOCUMENTATION.md           # API reference
├── DATABASE.md                    # Database schema
└── MVC_STRUCTURE.md               # This file
```

---

## 🎯 MVC Components

### 1. **MODELS** (Data Layer)

**Location:** `src/models/`

**Responsibility:** Define data structure, relationships, and database operations.

**Example: Customer Model**

```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  // ... other fields
});

module.exports = Customer;
```

**Key Models:**
- `Customer` - Customer/user data
- `Product` - Product catalog
- `Price` - Pricing tiers
- `Payment` - Transaction records
- `Refund` - Refund records
- `Subscription` - Recurring billing
- `WebhookEvent` - Event logs

---

### 2. **CONTROLLERS** (Business Logic Layer)

**Location:** `src/controllers/`

**Responsibility:** Handle business logic, orchestrate models, interact with Stripe API.

**Example: PaymentController**

```javascript
class PaymentController {
  async createPaymentIntent(req, res, next) {
    try {
      const { amount, currency, email } = req.body;
      
      // Business logic
      let customer = await Customer.findOne({ where: { email } });
      if (!customer) {
        const stripeCustomer = await stripe.customers.create({ email });
        customer = await Customer.create({
          stripeCustomerId: stripeCustomer.id,
          email: email
        });
      }
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customer.stripeCustomerId
      });
      
      // Save to database
      const payment = await Payment.create({
        stripePaymentIntentId: paymentIntent.id,
        customerId: customer.id,
        amount,
        currency,
        status: paymentIntent.status
      });
      
      res.json({ success: true, payment });
    } catch (error) {
      next(error);
    }
  }
  
  // Other methods...
}

module.exports = new PaymentController();
```

**Key Controllers:**
- `PaymentController` - Payment processing
- `CustomerController` - Customer management
- `ProductController` - Product/pricing management
- `WebhookController` - Webhook event handling

---

### 3. **ROUTES** (API Endpoints)

**Location:** `src/routes/`

**Responsibility:** Define API endpoints and map them to controller methods.

**Example: Payment Routes**

```javascript
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { validatePaymentIntent } = require('../middleware/validation');

// POST /api/payments/create-payment-intent
router.post(
  '/create-payment-intent',
  validatePaymentIntent,
  PaymentController.createPaymentIntent.bind(PaymentController)
);

// GET /api/payments/payment-intent/:id
router.get(
  '/payment-intent/:id',
  PaymentController.getPaymentIntent.bind(PaymentController)
);

module.exports = router;
```

**Key Route Files:**
- `payments.js` - Payment-related endpoints
- `customers.js` - Customer-related endpoints
- `products.js` - Product-related endpoints
- `checkout.js` - Checkout session endpoints
- `webhooks.js` - Webhook endpoint

---

### 4. **VIEWS** (Frontend)

**Location:** `client-example.html`

**Responsibility:** Present data to users and capture user input.

For this API-focused project, the "View" is a simple HTML page demonstrating frontend integration. In a full application, this would be:
- React/Vue/Angular app
- Mobile app
- Server-rendered templates

---

### 5. **MIDDLEWARE**

**Location:** `src/middleware/`

**Responsibility:** Process requests before they reach controllers.

**Validation Middleware:**
```javascript
const validatePaymentIntent = (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ 
      error: 'Invalid amount' 
    });
  }
  
  next();
};
```

**Error Handler:**
```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'StripeCardError') {
    return res.status(400).json({
      error: 'Card error',
      message: err.message
    });
  }
  
  res.status(500).json({
    error: 'Internal server error'
  });
};
```

---

## 🔄 Request Flow Example

### Creating a Payment

1. **CLIENT** sends POST request
   ```
   POST /api/payments/create-payment-intent
   { amount: 2000, currency: "usd", email: "user@example.com" }
   ```

2. **ROUTE** receives request
   ```javascript
   router.post('/create-payment-intent', 
     validatePaymentIntent,  // Middleware validates
     PaymentController.createPaymentIntent  // Forward to controller
   );
   ```

3. **MIDDLEWARE** validates request
   ```javascript
   validatePaymentIntent(req, res, next) {
     if (!amount || amount <= 0) {
       return res.status(400).json({ error: 'Invalid amount' });
     }
     next();  // Pass to controller
   }
   ```

4. **CONTROLLER** executes business logic
   ```javascript
   async createPaymentIntent(req, res, next) {
     // Find or create customer (Model operation)
     const customer = await Customer.findOne({ where: { email } });
     
     // Call Stripe API
     const paymentIntent = await stripe.paymentIntents.create({...});
     
     // Save to database (Model operation)
     const payment = await Payment.create({...});
     
     // Return response
     res.json({ success: true, payment });
   }
   ```

5. **MODELS** handle data operations
   ```javascript
   // Sequelize ORM executes SQL
   INSERT INTO payments (stripe_payment_intent_id, customer_id, amount, ...)
   VALUES ('pi_xxx', 1, 2000, ...);
   ```

6. **RESPONSE** sent back to client
   ```json
   {
     "success": true,
     "clientSecret": "pi_xxx_secret_xxx",
     "paymentId": 123
   }
   ```

---

## 🎨 Design Patterns Used

### 1. **MVC Pattern**
Separates data, business logic, and presentation.

### 2. **Repository Pattern**
Models act as repositories for data access.

### 3. **Singleton Pattern**
Controllers are instantiated once and reused.

### 4. **Middleware Pattern**
Request processing pipeline with validation and error handling.

### 5. **Factory Pattern**
Model relationships are defined in `models/index.js`.

---

## ✅ Benefits of This Structure

### ✅ Separation of Concerns
Each component has a single responsibility.

### ✅ Maintainability
Changes in one layer don't affect others.

### ✅ Testability
Easy to unit test controllers and models independently.

### ✅ Scalability
Can add new features without modifying existing code.

### ✅ Reusability
Controllers and models can be reused across different routes.

### ✅ Consistency
Standard structure makes onboarding easier for new developers.

---

## 📝 Adding New Features

### Example: Adding Invoice Feature

**1. Create Model** (`src/models/Invoice.js`)
```javascript
const Invoice = sequelize.define('Invoice', {
  stripeInvoiceId: DataTypes.STRING,
  customerId: DataTypes.INTEGER,
  amount: DataTypes.INTEGER,
  status: DataTypes.ENUM('draft', 'open', 'paid', 'void')
});
```

**2. Add Relationships** (`src/models/index.js`)
```javascript
Customer.hasMany(Invoice, { foreignKey: 'customer_id' });
Invoice.belongsTo(Customer, { foreignKey: 'customer_id' });
```

**3. Create Controller** (`src/controllers/InvoiceController.js`)
```javascript
class InvoiceController {
  async createInvoice(req, res, next) {
    // Business logic here
  }
  
  async getInvoice(req, res, next) {
    // Business logic here
  }
}
```

**4. Create Routes** (`src/routes/invoices.js`)
```javascript
router.post('/create', InvoiceController.createInvoice);
router.get('/:id', InvoiceController.getInvoice);
```

**5. Register Routes** (`server.js`)
```javascript
const invoicesRouter = require('./src/routes/invoices');
app.use('/api/invoices', invoicesRouter);
```

---

## 🧪 Testing Strategy

### Unit Tests
Test individual functions in isolation.

```javascript
// Test Controller
describe('PaymentController', () => {
  it('should create payment intent', async () => {
    const result = await PaymentController.createPaymentIntent(req, res);
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests
Test multiple components together.

```javascript
// Test API Endpoint
describe('POST /api/payments/create-payment-intent', () => {
  it('should return client secret', async () => {
    const response = await request(app)
      .post('/api/payments/create-payment-intent')
      .send({ amount: 2000, currency: 'usd' });
    
    expect(response.status).toBe(200);
    expect(response.body.clientSecret).toBeDefined();
  });
});
```

---

## 🔒 Security Best Practices

1. **Input Validation** - Validate all inputs in middleware
2. **Error Handling** - Never expose sensitive errors to client
3. **Authentication** - Add JWT/OAuth middleware
4. **Rate Limiting** - Prevent abuse with rate limiters
5. **SQL Injection** - Sequelize ORM prevents this automatically
6. **XSS Protection** - Sanitize user inputs
7. **CORS** - Configure allowed origins properly

---

## 📚 Further Reading

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Stripe API Reference](https://stripe.com/docs/api)
- [MVC Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)

---

## 🎯 Next Steps

- [ ] Add authentication middleware (JWT)
- [ ] Implement role-based access control (RBAC)
- [ ] Add request/response logging
- [ ] Implement caching (Redis)
- [ ] Add API versioning (/api/v1, /api/v2)
- [ ] Create Swagger/OpenAPI documentation
- [ ] Add unit and integration tests
- [ ] Implement rate limiting
- [ ] Add monitoring and metrics

