# 🌱 Database Seeding Guide

Complete guide to seeding your Stripe payment database with realistic test data.

## What Gets Seeded

The seed script creates comprehensive test data including:

### 👥 **5 Customers**
- John Doe (Premium subscriber)
- Jane Smith (Basic plan)
- Bob Wilson (Consulting client)
- Alice Johnson (Enterprise subscriber)
- Charlie Brown (New user)

All with complete details: names, emails, phones, addresses, and metadata.

### 📦 **5 Products with Multiple Pricing Options**

1. **Basic Plan** - $9.99
   - One-time: $9.99
   - Monthly: $9.99/month

2. **Premium Plan** - $29.99
   - One-time: $29.99
   - Monthly: $29.99/month
   - Yearly: $299.90/year

3. **Enterprise Plan** - $99.99
   - Monthly: $99.99/month

4. **E-Book** - $19.99
   - One-time: $19.99

5. **Consulting Hour** - $150.00
   - One-time: $150.00

### 💳 **7 Payments**
- ✅ 5 successful payments
- ⏳ 1 pending payment
- ❌ 1 canceled payment

### 💰 **1 Refund**
- Full refund on a Basic Plan purchase

### 🔄 **2 Active Subscriptions**
- Premium monthly subscription
- Enterprise monthly subscription

### 🔔 **3 Webhook Events**
- Payment succeeded event
- Customer created event
- Charge refunded event

---

## 🚀 How to Seed

### Prerequisites

1. **Database tables must exist:**
   ```bash
   npm run db:migrate
   ```

2. **Server should not be running** (optional, but recommended)

3. **Stripe keys must be configured** in `.env`

### Run the Seed Script

```bash
npm run db:seed
```

### What Happens

The script will:

1. ✅ Connect to your Neon PostgreSQL database
2. 🗑️ Clear all existing data (optional - can be disabled)
3. 🎯 Create customers in Stripe AND database
4. 📦 Create products and prices in Stripe AND database
5. 💳 Create payment intents in Stripe AND database
6. 💰 Create refunds in Stripe AND database
7. 🔄 Create subscriptions in Stripe AND database
8. 🔔 Log webhook events in database
9. 📊 Display summary

### Expected Output

```
🌱 Starting database seeding...
✅ Database connection established successfully.
🗑️  Clearing existing data...

👥 Creating customers...
  ✅ Created customer: John Doe
  ✅ Created customer: Jane Smith
  ✅ Created customer: Bob Wilson
  ✅ Created customer: Alice Johnson
  ✅ Created customer: Charlie Brown

📦 Creating products and prices...
  ✅ Created product: Basic Plan
    💰 Created price: $9.99 one_time
    💰 Created price: $9.99 recurring
  ✅ Created product: Premium Plan
    💰 Created price: $29.99 one_time
    💰 Created price: $29.99 recurring
    💰 Created price: $299.90 recurring
  ✅ Created product: Enterprise Plan
    💰 Created price: $99.99 recurring
  ✅ Created product: E-Book: Stripe Integration Guide
    💰 Created price: $19.99 one_time
  ✅ Created product: Consulting Hour
    💰 Created price: $150.00 one_time

💳 Creating payments...
  ✅ Created payment: $29.99 - succeeded
  ✅ Created payment: $9.99 - succeeded
  ✅ Created payment: $19.99 - succeeded
  ✅ Created payment: $150.00 - succeeded
  ✅ Created payment: $99.99 - succeeded
  ✅ Created payment: $9.99 - requires_payment_method
  ✅ Created payment: $29.99 - canceled

💰 Creating refunds...
  ✅ Created refund: $9.99

🔄 Creating subscriptions...
  ✅ Created subscription for John Doe
  ✅ Created subscription for Alice Johnson

🔔 Creating webhook events...
  ✅ Created webhook event: payment_intent.succeeded
  ✅ Created webhook event: customer.created
  ✅ Created webhook event: charge.refunded

📊 Seeding Summary:
  👥 Customers: 5
  📦 Products: 5
  💰 Prices: 8
  💳 Payments: 7
  💵 Refunds: 1
  🔄 Subscriptions: 2
  🔔 Webhook Events: 3

✅ Database seeding completed successfully!
```

---

## 🧪 Testing After Seeding

### 1. View Customers

```bash
curl http://localhost:3000/api/customers
```

**Expected:** List of 5 customers

### 2. View Payments

```bash
curl http://localhost:3000/api/payments
```

**Expected:** 7 payments with various statuses

### 3. Get Customer Stats

```bash
curl http://localhost:3000/api/customers/1/stats
```

**Expected:** Customer analytics showing total spent, payment count, etc.

### 4. View Products

```bash
curl http://localhost:3000/api/products
```

**Expected:** 5 products with their prices

### 5. Check in Neon Dashboard

1. Go to https://console.neon.tech
2. Open SQL Editor
3. Run queries:

```sql
-- View all customers
SELECT * FROM customers;

-- View all payments
SELECT * FROM payments;

-- View customer with their payments
SELECT 
  c.name,
  c.email,
  COUNT(p.id) AS payment_count,
  SUM(p.amount) / 100.0 AS total_spent
FROM customers c
LEFT JOIN payments p ON c.id = p.customer_id
WHERE p.status = 'succeeded'
GROUP BY c.id, c.name, c.email;

-- View active subscriptions
SELECT 
  s.id,
  c.name AS customer_name,
  pr.name AS product_name,
  p.amount / 100.0 AS monthly_price,
  s.status
FROM subscriptions s
JOIN customers c ON s.customer_id = c.id
JOIN prices p ON s.price_id = p.id
JOIN products pr ON p.product_id = pr.id;
```

---

## 🔧 Customizing Seed Data

### Add More Customers

Edit `src/database/seed.js` and add to `customersData` array:

```javascript
{
  email: 'your.email@example.com',
  name: 'Your Name',
  phone: '+1234567899',
  metadata: { source: 'web' }
}
```

### Add More Products

Add to `productsData` array:

```javascript
{
  name: 'New Product',
  description: 'Product description',
  prices: [
    { amount: 4999, currency: 'usd', type: 'one_time' }
  ],
  metadata: { category: 'your-category' }
}
```

### Disable Data Clearing

Comment out these lines in `seed.js`:

```javascript
// await WebhookEvent.destroy({ where: {} });
// await Refund.destroy({ where: {} });
// ... etc
```

---

## 🎯 Use Cases

### 1. Development Testing

Quickly populate your database with realistic data for testing features.

### 2. Demo Purposes

Show off your payment system with real-looking data.

### 3. QA Testing

Test edge cases with different payment statuses and scenarios.

### 4. Training

Help new team members understand the data structure.

---

## 🔄 Re-seeding

To start fresh:

```bash
# 1. Clear and re-seed
npm run db:seed

# 2. Or manually reset
npm run db:migrate  # Recreates tables
npm run db:seed     # Adds fresh data
```

---

## 📊 Data Statistics

After seeding, you'll have:

- **Total Customers:** 5
- **Total Products:** 5
- **Total Prices:** 8 (various payment options)
- **Total Payments:** 7 ($319.94 total)
- **Successful Payments:** 5 ($309.95)
- **Pending Payments:** 1
- **Canceled Payments:** 1
- **Refunds:** 1 ($9.99)
- **Active Subscriptions:** 2
- **Total MRR:** $129.98/month

---

## 🐛 Troubleshooting

### "Stripe key not found"

Make sure your `.env` file has:
```env
STRIPE_SECRET_KEY=sk_test_...
```

### "Database connection failed"

Check your `DATABASE_URL` in `.env` is correct.

### "Duplicate key error"

The seed script clears data first. If you've disabled clearing, you may get duplicates. Either:
1. Enable data clearing
2. Or drop and recreate tables: `npm run db:migrate`

### "Network error"

Check your internet connection - the script needs to connect to both Stripe and Neon.

---

## 🔒 Important Notes

### ⚠️ Test Mode Only

This seed script uses your **test mode** Stripe keys. It will:
- ✅ Create test data in Stripe (visible in test mode)
- ✅ Save to your database
- ❌ NOT charge real money
- ❌ NOT affect production data

### 🗑️ Cleaning Up Stripe Test Data

The seed script creates real test objects in Stripe. To clean up:

1. Go to Stripe Dashboard (test mode)
2. Navigate to each section (Customers, Products, etc.)
3. Delete test objects if needed

Or simply keep them - they're in test mode and won't affect anything.

---

## 💡 Pro Tips

1. **Run after migration** - Always run `db:migrate` before seeding
2. **Test with seed data** - Use this data for frontend development
3. **Check Stripe Dashboard** - View the created objects in Stripe
4. **Customize as needed** - Edit the seed file for your specific needs
5. **Re-seed anytime** - Safe to run multiple times

---

## 📚 Related Commands

```bash
# Setup sequence
npm run db:migrate    # Create tables
npm run db:seed       # Add data
npm start             # Start server

# View data
curl http://localhost:3000/api/customers
curl http://localhost:3000/api/payments
curl http://localhost:3000/api/products

# Reset everything
npm run db:migrate    # Drops and recreates tables
npm run db:seed       # Fresh seed data
```

---

**Happy seeding!** 🌱 Your database is now populated with realistic test data for development and testing!
