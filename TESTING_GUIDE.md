# 🧪 Complete Testing Guide - Subscription System

## ✅ System Status
**All files created!** The subscription system is now complete and ready to test.

---

## 📋 Prerequisites

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify Environment Variables
Check your `.env` file has these values:
```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_51TXFvFFf1NjKrMMA...
STRIPE_PUBLISHABLE_KEY=pk_test_51TXFvFFf1NjKrMMA...
STRIPE_WEBHOOK_SECRET=whsec_... (optional for now)

# Database
DATABASE_URL=postgresql://neondb_owner:npg_lW2UmKS0RDbN@ep-little-lab-ap7i2s5c.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3000
```

### 3. Run Database Migration
```bash
npm run db:migrate
```

This will create all tables including:
- users
- subscription_plans
- user_subscriptions
- subscription_histories
- customers, products, prices, payments, refunds, subscriptions, webhook_events

### 4. Start Server
```bash
npm start
```

You should see:
```
🚀 Server is running on port 3000
💳 Stripe integration ready
🗄️  Database: postgres
🚀 Starting subscription cron jobs...
✅ All subscription cron jobs started
```

---

## 🎯 Testing Flow

### Phase 1: Authentication

#### 1.1 Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**📝 Save the token!** You'll need it for all authenticated requests.

#### 1.2 Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

#### 1.3 Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Phase 2: Create Subscription Plans (Admin)

First, register an admin user by manually updating the database:
```sql
-- Connect to your Neon database and run:
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
```

#### 2.1 Create Basic Plan
```bash
curl -X POST http://localhost:3000/api/subscription-plans \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Basic Monthly",
    "description": "Perfect for individuals getting started",
    "price": 9.99,
    "currency": "usd",
    "interval": "month",
    "interval_count": 1,
    "features": {
      "storage": "10GB",
      "users": 1,
      "support": "Email"
    },
    "limits": {
      "max_projects": 5,
      "max_storage_gb": 10
    },
    "trial_period_days": 7,
    "status": "active"
  }'
```

#### 2.2 Create Pro Plan
```bash
curl -X POST http://localhost:3000/api/subscription-plans \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pro Monthly",
    "description": "For professionals and small teams",
    "price": 29.99,
    "currency": "usd",
    "interval": "month",
    "interval_count": 1,
    "features": {
      "storage": "100GB",
      "users": 10,
      "support": "Priority Email + Chat"
    },
    "limits": {
      "max_projects": 50,
      "max_storage_gb": 100
    },
    "trial_period_days": 14,
    "status": "active"
  }'
```

#### 2.3 List All Plans (Public)
```bash
curl -X GET http://localhost:3000/api/subscription-plans
```

---

### Phase 3: Subscribe to a Plan

First, you need a Stripe Payment Method. For testing, use Stripe's test cards:
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

You can create a payment method via Stripe's API or use their test tokens.

#### 3.1 Create Test Payment Method (using Stripe CLI or API)

Using Node.js script:
```javascript
const stripe = require('stripe')('sk_test_51TXFvFFf1NjKrMMA...');

async function createTestPaymentMethod() {
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 2025,
      cvc: '123',
    },
  });
  console.log('Payment Method ID:', paymentMethod.id);
}

createTestPaymentMethod();
```

#### 3.2 Subscribe to Plan
```bash
curl -X POST http://localhost:3000/api/subscriptions/subscribe \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 1,
    "payment_method_id": "pm_1234567890abcdef"
  }'
```

**Expected Response:**
```json
{
  "message": "Subscription created successfully",
  "subscription": {
    "id": 1,
    "user_id": 1,
    "plan_id": 1,
    "stripe_subscription_id": "sub_1234567890",
    "status": "active",
    "current_period_start": "2026-06-02T...",
    "current_period_end": "2026-07-02T...",
    "auto_renew": true,
    "plan": {
      "name": "Basic Monthly",
      "price": 9.99
    }
  }
}
```

---

### Phase 4: Manage Subscriptions

#### 4.1 List My Subscriptions
```bash
curl -X GET http://localhost:3000/api/subscriptions/my-subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4.2 Get Single Subscription
```bash
curl -X GET http://localhost:3000/api/subscriptions/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4.3 Get Subscription History
```bash
curl -X GET http://localhost:3000/api/subscriptions/1/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Phase 5: Cancel & Resume

#### 5.1 Cancel at Period End
```bash
curl -X POST http://localhost:3000/api/subscriptions/1/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cancel_immediately": false
  }'
```

#### 5.2 Cancel Immediately
```bash
curl -X POST http://localhost:3000/api/subscriptions/1/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cancel_immediately": true
  }'
```
#### 5.3 Resume Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions/1/resume \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Phase 6: Upgrade/Downgrade

#### 6.1 Upgrade to Pro Plan
```bash
curl -X POST http://localhost:3000/api/subscriptions/1/upgrade \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_plan_id": 2
  }'
```

---

## 🎨 Using Postman

1. Import this collection URL or create requests manually
2. Set up environment variables:
   - `base_url`: `http://localhost:3000`
   - `token`: Your JWT token from login/register
   - `plan_id`: ID of the subscription plan
   - `subscription_id`: ID of the subscription

---

## 🔍 What to Verify

### ✅ Authentication
- [ ] User registration creates user with hashed password
- [ ] Login returns JWT token
- [ ] Profile endpoint requires valid token
- [ ] Invalid token returns 401 Unauthorized

### ✅ Subscription Plans
- [ ] Admin can create plans
- [ ] Plans are created in Stripe with correct pricing
- [ ] Non-admin cannot create plans (403 Forbidden)
- [ ] Anyone can list active plans

### ✅ Subscriptions
- [ ] User can subscribe to a plan
- [ ] Stripe subscription is created
- [ ] Database records are created (UserSubscription + SubscriptionHistory)
- [ ] User can list their subscriptions
- [ ] User can view subscription details
- [ ] User cannot view other users' subscriptions

### ✅ Cancellation
- [ ] Cancel at period end sets `cancel_at_period_end: true`
- [ ] Cancel immediately marks subscription as canceled
- [ ] History records are created for cancellations
- [ ] Canceled subscription can be resumed (if not immediate)

### ✅ Upgrade/Downgrade
- [ ] User can upgrade to higher plan
- [ ] User can downgrade to lower plan
- [ ] Stripe subscription is updated with proration
- [ ] History records show plan changes

### ✅ Cron Jobs (Check server logs)
- [ ] Jobs start when server starts
- [ ] Check logs for scheduled execution messages

### ✅ Webhooks (If configured)
- [ ] Subscription events update database
- [ ] Payment success/failure is logged
- [ ] Invoice events trigger history records

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module 'bcrypt'"
**Solution:** Run `npm install`

### Issue: "Table doesn't exist"
**Solution:** Run `npm run db:migrate`

### Issue: "Invalid Stripe API key"
**Solution:** Check `.env` file has correct `STRIPE_SECRET_KEY`

### Issue: "401 Unauthorized"
**Solution:** Make sure you're passing the Bearer token in Authorization header

### Issue: "Payment method pm_xxx cannot be attached..."
**Solution:** Create a new payment method for testing

### Issue: Cron jobs not running
**Solution:** Check server console for job startup messages

---

## 📊 Database Verification

Connect to your Neon database and run:

```sql
-- Check users
SELECT id, email, role, created_at FROM users;

-- Check subscription plans
SELECT id, name, price, status, stripe_price_id FROM subscription_plans;

-- Check user subscriptions
SELECT us.id, u.email, sp.name as plan_name, us.status, us.current_period_end
FROM user_subscriptions us
JOIN users u ON us.user_id = u.id
JOIN subscription_plans sp ON us.plan_id = sp.id;

-- Check subscription history
SELECT sh.id, u.email, sh.action, sh.status_from, sh.status_to, sh.created_at
FROM subscription_histories sh
JOIN users u ON sh.user_id = u.id
ORDER BY sh.created_at DESC;
```

---

## 🎉 Success Criteria

Your system is working correctly if:

1. ✅ Users can register and login
2. ✅ Admin can create subscription plans
3. ✅ Plans appear in Stripe dashboard
4. ✅ Users can subscribe with payment method
5. ✅ Subscriptions appear in Stripe dashboard
6. ✅ Users can cancel/resume subscriptions
7. ✅ Users can upgrade/downgrade plans
8. ✅ All actions are logged in subscription_histories
9. ✅ Cron jobs start without errors
10. ✅ Webhooks update database (if configured)

---

## 📝 Next Steps

After testing:

1. **Configure Stripe Webhooks:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhook`
   - Select events: all subscription and invoice events
   - Copy webhook secret to `.env`

2. **Email Integration:**
   - Add email service (SendGrid, Mailgun, etc.)
   - Send welcome emails on registration
   - Send reminder emails before subscription expires
   - Send receipts for payments

3. **Frontend Integration:**
   - Use `client-example.html` as reference
   - Integrate Stripe Elements for payment methods
   - Build subscription management dashboard

4. **Testing:**
   - Write unit tests for controllers
   - Write integration tests for API endpoints
   - Test webhook handling with Stripe CLI

---

## 📞 Need Help?

If you encounter any issues:
1. Check server logs for error messages
2. Verify database connection
3. Check Stripe dashboard for API errors
4. Review subscription_histories table for action logs

Happy Testing! 🚀
