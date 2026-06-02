# 🗺️ Database Relationship Diagram

Visual representation of the database schema and relationships.

## Complete Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│    CUSTOMERS     │
├──────────────────┤
│ PK id            │─┐
│ UK stripe_cust_id│ │
│    email         │ │
│    name          │ │
│    phone         │ │
│    address (JSON)│ │
│    metadata (JSON)│ │
│    is_active     │ │
│    created_at    │ │
│    updated_at    │ │
└──────────────────┘ │
                     │
        ┌────────────┴────────────┐
        │                         │
        │ 1:N                     │ 1:N
        ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│    PAYMENTS      │      │  SUBSCRIPTIONS   │
├──────────────────┤      ├──────────────────┤
│ PK id            │─┐    │ PK id            │
│ UK stripe_pi_id  │ │    │ UK stripe_sub_id │
│ FK customer_id   │◄┘    │ FK customer_id   │◄─┐
│    amount        │      │ FK price_id      │  │
│    currency      │      │    status        │  │
│    status        │      │    period_start  │  │
│    payment_method│      │    period_end    │  │
│    description   │      │    canceled_at   │  │
│    charge_id     │      │    trial_start   │  │
│    error_message │      │    trial_end     │  │
│    paid_at       │      │    metadata (JSON)│  │
│    metadata (JSON)│      │    created_at    │  │
│    created_at    │      │    updated_at    │  │
│    updated_at    │      └──────────────────┘  │
└──────────────────┘                            │
        │                                       │
        │ 1:N                                   │
        ▼                                       │
┌──────────────────┐                            │
│     REFUNDS      │                            │
├──────────────────┤                            │
│ PK id            │                            │
│ UK stripe_ref_id │                            │
│ FK payment_id    │◄───────────────────────────┘
│    amount        │
│    currency      │
│    reason        │
│    status        │
│    refunded_at   │
│    metadata (JSON)│
│    created_at    │
│    updated_at    │
└──────────────────┘


┌──────────────────┐
│    PRODUCTS      │
├──────────────────┤
│ PK id            │─┐
│ UK stripe_prod_id│ │
│    name          │ │
│    description   │ │
│    is_active     │ │
│    metadata (JSON)│ │
│    created_at    │ │
│    updated_at    │ │
└──────────────────┘ │
                     │
                     │ 1:N
                     ▼
             ┌──────────────────┐
             │      PRICES      │
             ├──────────────────┤
             │ PK id            │─┐
             │ UK stripe_price_id│ │
             │ FK product_id    │◄┘
             │    amount        │
             │    currency      │
             │    type          │
             │    recurring (JSON)│
             │    is_active     │
             │    created_at    │
             │    updated_at    │
             └──────────────────┘
                     │
                     │ 1:N (referenced by subscriptions)
                     └─────────────────────┐
                                           │
                     ┌─────────────────────┘
                     ▼
             (See SUBSCRIPTIONS above)


┌──────────────────┐
│  WEBHOOK_EVENTS  │
├──────────────────┤
│ PK id            │
│ UK stripe_evt_id │
│    type          │
│    data (JSON)   │
│    processed     │
│    processed_at  │
│    error_message │
│    created_at    │
│    updated_at    │
└──────────────────┘

Legend:
  PK = Primary Key
  FK = Foreign Key
  UK = Unique Key
  1:N = One-to-Many Relationship
  ─> = Foreign Key Points To
```

---

## Relationship Summary

### Customer → Payment (One-to-Many)
- A customer can have multiple payments
- A payment belongs to one customer (or none)
- Relationship: `customer.id → payment.customer_id`

### Customer → Subscription (One-to-Many)
- A customer can have multiple subscriptions
- A subscription belongs to one customer
- Relationship: `customer.id → subscription.customer_id`

### Product → Price (One-to-Many)
- A product can have multiple prices (different tiers)
- A price belongs to one product
- Relationship: `product.id → price.product_id`

### Price → Subscription (One-to-Many)
- A price can be used by multiple subscriptions
- A subscription uses one price
- Relationship: `price.id → subscription.price_id`

### Payment → Refund (One-to-Many)
- A payment can have multiple refunds (partial refunds)
- A refund belongs to one payment
- Relationship: `payment.id → refund.payment_id`

### Webhook Events (Independent)
- No foreign keys
- Logs all incoming Stripe events for auditing

---

## Table Sizes (Approximate)

| Table | Expected Growth | Recommended Index |
|-------|----------------|-------------------|
| customers | Medium | email, stripe_customer_id |
| products | Low | stripe_product_id |
| prices | Low | product_id, stripe_price_id |
| payments | High | customer_id, status, paid_at |
| refunds | Low | payment_id, status |
| subscriptions | Medium | customer_id, status, period_end |
| webhook_events | Very High | type, processed, created_at |

---

## Query Examples

### Get customer with all payments

```sql
SELECT 
  c.id,
  c.email,
  c.name,
  p.id AS payment_id,
  p.amount,
  p.status,
  p.paid_at
FROM customers c
LEFT JOIN payments p ON c.id = p.customer_id
WHERE c.id = 1
ORDER BY p.created_at DESC;
```

### Get total revenue per customer

```sql
SELECT 
  c.id,
  c.email,
  COUNT(p.id) AS total_payments,
  SUM(p.amount) AS total_spent
FROM customers c
LEFT JOIN payments p ON c.id = p.customer_id
WHERE p.status = 'succeeded'
GROUP BY c.id, c.email;
```

### Get active subscriptions with product info

```sql
SELECT 
  s.id,
  c.email,
  pr.name AS product_name,
  p.amount,
  s.status,
  s.current_period_end
FROM subscriptions s
JOIN customers c ON s.customer_id = c.id
JOIN prices p ON s.price_id = p.id
JOIN products pr ON p.product_id = pr.id
WHERE s.status = 'active'
ORDER BY s.current_period_end ASC;
```

### Get refund summary

```sql
SELECT 
  DATE(r.created_at) AS refund_date,
  COUNT(r.id) AS total_refunds,
  SUM(r.amount) AS total_amount
FROM refunds r
WHERE r.status = 'succeeded'
GROUP BY DATE(r.created_at)
ORDER BY refund_date DESC;
```

### Get unprocessed webhook events

```sql
SELECT 
  id,
  type,
  created_at
FROM webhook_events
WHERE processed = FALSE
ORDER BY created_at ASC
LIMIT 100;
```

---

## Performance Optimization

### Indexes Created

All tables have appropriate indexes:

**customers:**
- `idx_stripe_customer_id` (unique)
- `idx_email` (unique)

**products:**
- `idx_stripe_product_id` (unique)

**prices:**
- `idx_stripe_price_id` (unique)
- `idx_product_id`

**payments:**
- `idx_stripe_payment_intent_id` (unique)
- `idx_customer_id`
- `idx_status`
- `idx_paid_at`

**refunds:**
- `idx_stripe_refund_id` (unique)
- `idx_payment_id`
- `idx_status`

**subscriptions:**
- `idx_stripe_subscription_id` (unique)
- `idx_customer_id`
- `idx_status`
- `idx_current_period_end`

**webhook_events:**
- `idx_stripe_event_id` (unique)
- `idx_type`
- `idx_processed`
- `idx_created_at`

---

## Data Flow Diagram

```
┌─────────────┐
│   STRIPE    │ (External Service)
└─────┬───────┘
      │
      │ Webhooks
      ▼
┌─────────────────────────────────────────┐
│         YOUR APPLICATION                 │
│                                          │
│  ┌──────────────────────────────────┐  │
│  │  Controller receives webhook     │  │
│  └────────┬─────────────────────────┘  │
│           │                             │
│           ▼                             │
│  ┌──────────────────────────────────┐  │
│  │  Creates/Updates records in DB   │  │
│  └────────┬─────────────────────────┘  │
│           │                             │
│           ▼                             │
│  ┌──────────────────────────────────┐  │
│  │        DATABASE                   │  │
│  │  - customers                      │  │
│  │  - payments                       │  │
│  │  - subscriptions                  │  │
│  │  - webhook_events                 │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Cascade Rules

### ON DELETE Behaviors

**Product → Price:**
- `ON DELETE CASCADE`
- When a product is deleted, all its prices are deleted

**Customer → Payment:**
- `ON DELETE SET NULL`
- When a customer is deleted, their payments remain but customer_id becomes null

**Customer → Subscription:**
- `ON DELETE CASCADE`
- When a customer is deleted, all their subscriptions are deleted

**Payment → Refund:**
- `ON DELETE CASCADE`
- When a payment is deleted, all its refunds are deleted

**Price → Subscription:**
- `ON DELETE RESTRICT`
- Cannot delete a price that has active subscriptions

---

## JSON Fields

Some fields store JSON data for flexibility:

### address (customers)
```json
{
  "line1": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "postal_code": "94111",
  "country": "US"
}
```

### recurring (prices)
```json
{
  "interval": "month",
  "interval_count": 1
}
```

### metadata (all tables)
```json
{
  "userId": "user_123",
  "source": "web",
  "campaign": "summer2024"
}
```

---

## Database Statistics Queries

### Total customers
```sql
SELECT COUNT(*) FROM customers WHERE is_active = TRUE;
```

### Total revenue
```sql
SELECT SUM(amount) FROM payments WHERE status = 'succeeded';
```

### Active subscriptions
```sql
SELECT COUNT(*) FROM subscriptions WHERE status = 'active';
```

### Average payment amount
```sql
SELECT AVG(amount) FROM payments WHERE status = 'succeeded';
```

### Refund rate
```sql
SELECT 
  (COUNT(DISTINCT r.payment_id) * 100.0 / COUNT(DISTINCT p.id)) AS refund_rate_percent
FROM payments p
LEFT JOIN refunds r ON p.id = r.payment_id
WHERE p.status = 'succeeded';
```

---

This diagram and documentation should help you understand how all the database tables relate to each other!
