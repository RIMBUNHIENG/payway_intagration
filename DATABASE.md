# 🗄️ Database Schema Documentation

Complete database structure for Stripe Payment Integration using Sequelize ORM.

## Database Architecture

The system follows MVC (Model-View-Controller) pattern with 7 main entities:

1. **Customers** - User/customer information
2. **Products** - Products available for purchase
3. **Prices** - Pricing tiers for products
4. **Payments** - Payment transactions
5. **Refunds** - Refund records
6. **Subscriptions** - Recurring subscriptions
7. **WebhookEvents** - Stripe webhook event logs

---

## Entity Relationship Diagram

```
Customer (1) ───────< (N) Payment
    │                      │
    │                      │
    └──────< (N) Subscription
                   │
                   │
Product (1) ───< (N) Price
                   │
                   │
                   └───< (N) Subscription

Payment (1) ───────< (N) Refund
```

---

## Tables

### 1. `customers`

Stores customer/user information synced with Stripe.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `stripe_customer_id` | STRING | Unique Stripe customer ID |
| `email` | STRING | Customer email (unique) |
| `name` | STRING | Customer name (optional) |
| `phone` | STRING | Phone number (optional) |
| `address` | JSON | Address object (optional) |
| `metadata` | JSON | Custom metadata |
| `is_active` | BOOLEAN | Active status (default: true) |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- Unique: `stripe_customer_id`
- Index: `email`

**Relationships:**
- Has many `payments`
- Has many `subscriptions`

---

### 2. `products`

Stores product information from Stripe.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `stripe_product_id` | STRING | Unique Stripe product ID |
| `name` | STRING | Product name |
| `description` | TEXT | Product description (optional) |
| `is_active` | BOOLEAN | Active status (default: true) |
| `metadata` | JSON | Custom metadata |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- Unique: `stripe_product_id`

**Relationships:**
- Has many `prices`

---

### 3. `prices`

Stores pricing information for products (supports one-time and recurring).

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `stripe_price_id` | STRING | Unique Stripe price ID |
| `product_id` | INTEGER | Foreign key to products |
| `amount` | INTEGER | Price amount in cents |
| `currency` | STRING(3) | Currency code (default: 'usd') |
| `type` | ENUM | 'one_time' or 'recurring' |
| `recurring` | JSON | Recurring details (interval, interval_count) |
| `is_active` | BOOLEAN | Active status (default: true) |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- Unique: `stripe_price_id`
- Index: `product_id`

**Relationships:**
- Belongs to `product`
- Has many `subscriptions`

---

### 4. `payments`

Stores payment transaction records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `stripe_payment_intent_id` | STRING | Unique Stripe Payment Intent ID |
| `customer_id` | INTEGER | Foreign key to customers (nullable) |
| `amount` | INTEGER | Payment amount in cents |
| `currency` | STRING(3) | Currency code (default: 'usd') |
| `status` | ENUM | Payment status (requires_payment_method, processing, succeeded, etc.) |
| `payment_method` | STRING | Payment method type (card, bank_account, etc.) |
| `description` | TEXT | Payment description (optional) |
| `receipt_email` | STRING | Email for receipt (optional) |
| `metadata` | JSON | Custom metadata |
| `charge_id` | STRING | Stripe Charge ID (optional) |
| `error_message` | TEXT | Error message if failed (optional) |
| `paid_at` | TIMESTAMP | Payment success timestamp (optional) |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- Unique: `stripe_payment_intent_id`
- Index: `customer_id`
- Index: `status`
- Index: `paid_at`

**Relationships:**
- Belongs to `customer`
- Has many `refunds`

---

### 5. `refunds`

Stores refund records for payments.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `stripe_refund_id` | STRING | Unique Stripe refund ID |
| `payment_id` | INTEGER | Foreign key to payments |
| `amount` | INTEGER | Refund amount in cents |
| `currency` | STRING(3) | Currency code (default: 'usd') |
| `reason` | ENUM | 'duplicate', 'fraudulent', 'requested_by_customer' |
| `status` | ENUM | 'pending', 'succeeded', 'failed', 'canceled' |
| `metadata` | JSON | Custom metadata |
| `refunded_at` | TIMESTAMP | Refund timestamp (optional) |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- Unique: `stripe_refund_id`
- Index: `payment_id`
- Index: `status`

**Relationships:**
- Belongs to `payment`

---

### 6. `subscriptions`

Stores recurring subscription records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `stripe_subscription_id` | STRING | Unique Stripe subscription ID |
| `customer_id` | INTEGER | Foreign key to customers |
| `price_id` | INTEGER | Foreign key to prices |
| `status` | ENUM | Subscription status (incomplete, active, past_due, canceled, etc.) |
| `current_period_start` | TIMESTAMP | Current billing period start |
| `current_period_end` | TIMESTAMP | Current billing period end |
| `canceled_at` | TIMESTAMP | Cancellation timestamp (optional) |
| `cancel_at_period_end` | BOOLEAN | Cancel at period end flag (default: false) |
| `trial_start` | TIMESTAMP | Trial start timestamp (optional) |
| `trial_end` | TIMESTAMP | Trial end timestamp (optional) |
| `metadata` | JSON | Custom metadata |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- Unique: `stripe_subscription_id`
- Index: `customer_id`
- Index: `status`
- Index: `current_period_end`

**Relationships:**
- Belongs to `customer`
- Belongs to `price`

---

### 7. `webhook_events`

Logs all incoming Stripe webhook events for debugging and audit.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `stripe_event_id` | STRING | Unique Stripe event ID |
| `type` | STRING | Event type (payment_intent.succeeded, etc.) |
| `data` | JSON | Complete event payload |
| `processed` | BOOLEAN | Processing status (default: false) |
| `processed_at` | TIMESTAMP | Processing timestamp (optional) |
| `error_message` | TEXT | Error message if failed (optional) |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- Unique: `stripe_event_id`
- Index: `type`
- Index: `processed`
- Index: `created_at`

---

## Database Configuration

### Supported Databases

1. **SQLite** (default - easiest for development)
2. **PostgreSQL** (recommended for production)
3. **MySQL** (alternative for production)

### Configuration (`.env`)

```env
# SQLite (Development)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# PostgreSQL (Production)
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stripe_payments
DB_USER=postgres
DB_PASSWORD=yourpassword

# MySQL (Alternative)
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stripe_payments
DB_USER=root
DB_PASSWORD=yourpassword
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `sequelize` - ORM framework
- `sqlite3` - SQLite driver (default)
- `pg` & `pg-hstore` - PostgreSQL driver
- `mysql2` - MySQL driver

### 2. Configure Database

Edit `.env` file with your database settings.

### 3. Run Migrations

```bash
npm run db:migrate
```

This creates all tables with proper indexes and relationships.

### 4. Start Server

```bash
npm start
```

---

## Common Queries

### Get customer with payments

```javascript
const customer = await Customer.findByPk(customerId, {
  include: [
    {
      model: Payment,
      as: 'payments',
      order: [['createdAt', 'DESC']],
      limit: 10
    }
  ]
});
```

### Get payment with refunds

```javascript
const payment = await Payment.findOne({
  where: { stripePaymentIntentId: 'pi_xxx' },
  include: [
    {
      model: Refund,
      as: 'refunds'
    }
  ]
});
```

### Get product with prices

```javascript
const product = await Product.findByPk(productId, {
  include: [
    {
      model: Price,
      as: 'prices',
      where: { isActive: true }
    }
  ]
});
```

### Calculate customer lifetime value

```javascript
const customer = await Customer.findByPk(customerId, {
  include: [
    {
      model: Payment,
      as: 'payments',
      where: { status: 'succeeded' },
      required: false
    }
  ]
});

const totalSpent = customer.payments.reduce((sum, p) => sum + p.amount, 0);
```

---

## Migration Guide

### From SQLite to PostgreSQL

1. **Export data** from SQLite
2. **Update `.env`** with PostgreSQL credentials
3. **Run migrations**: `npm run db:migrate`
4. **Import data** into PostgreSQL

---

## Best Practices

1. **Always use transactions** for operations that modify multiple tables
2. **Index foreign keys** for better query performance
3. **Use eager loading** (`include`) to avoid N+1 queries
4. **Soft delete** sensitive data (use `isActive` flag)
5. **Log webhook events** for audit trail
6. **Use metadata** for custom fields instead of adding columns

---

## Backup & Recovery

### SQLite

```bash
# Backup
cp database.sqlite database.backup.sqlite

# Restore
cp database.backup.sqlite database.sqlite
```

### PostgreSQL

```bash
# Backup
pg_dump stripe_payments > backup.sql

# Restore
psql stripe_payments < backup.sql
```

---

## Performance Tips

1. Add composite indexes for common queries
2. Use pagination for large result sets
3. Cache frequently accessed data (Redis)
4. Use read replicas for read-heavy workloads
5. Regularly analyze and optimize queries

---

## Security

- ✅ Never store card numbers in database
- ✅ Use parameterized queries (Sequelize does this)
- ✅ Encrypt sensitive data at rest
- ✅ Use SSL/TLS for database connections
- ✅ Implement role-based access control
- ✅ Regular database backups
- ✅ Audit logs for all modifications

---

## Troubleshooting

### "No such table" error
```bash
npm run db:migrate
```

### Relationship not working
Check foreign key names match the model definitions.

### Slow queries
Add indexes on frequently queried columns.

---

## Next Steps

- [ ] Add database migrations versioning (Sequelize Migrations)
- [ ] Implement soft delete for all tables
- [ ] Add full-text search capabilities
- [ ] Set up database replication
- [ ] Implement caching layer (Redis)
- [ ] Add database monitoring
- [ ] Create backup automation
- [ ] Write database tests

