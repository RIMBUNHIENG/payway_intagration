# 🚀 Postman Testing Guide

## Base URL
```
http://localhost:3000
```

---

## 📋 Testing Steps

### Step 1: Start Server
```bash
npm start
```

---

## 1️⃣ Authentication

### 1.1 Register User
**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/register`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Expected Response (201):**
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

**📝 Important:** Save the `token` from response!

---

### 1.2 Login
**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.3 Get Profile (Protected)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/auth/profile`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "id": 1,
  "email": "test@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "is_active": true
}
```

---

## 2️⃣ Subscription Plans

### 2.1 Get All Plans (Public)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/subscription-plans`  
**Headers:** None required

**Expected Response (200):**
```json
{
  "count": 2,
  "plans": [
    {
      "id": 1,
      "name": "Basic Monthly",
      "description": "Perfect for individuals",
      "amount": 999,
      "currency": "usd",
      "interval": "month",
      "trial_period_days": 7,
      "status": "active"
    }
  ]
}
```

---

### 2.2 Create Plan (Admin Only)
**Method:** `POST`  
**URL:** `http://localhost:3000/api/subscription-plans`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```
**Body (raw JSON):**
```json
{
  "name": "Basic Monthly",
  "description": "Perfect for individuals getting started",
  "price": 9.99,
  "currency": "usd",
  "interval": "month",
  "interval_count": 1,
  "trial_period_days": 7,
  "features": {
    "storage": "10GB",
    "users": 1,
    "support": "Email"
  },
  "limits": {
    "max_projects": 5,
    "max_storage_gb": 10
  },
  "status": "active"
}
```

**Expected Response (201):**
```json
{
  "message": "Subscription plan created successfully",
  "plan": {
    "id": 1,
    "name": "Basic Monthly",
    "stripe_price_id": "price_1234567890",
    "stripe_product_id": "prod_1234567890"
  }
}
```

---

### 2.3 Update Plan (Admin Only)
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/subscription-plans/1`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```
**Body (raw JSON):**
```json
{
  "name": "Premium Monthly",
  "price": 29.99,
  "status": "active"
}
```

---

### 2.4 Delete Plan (Admin Only)
**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/subscription-plans/1`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 3️⃣ Subscriptions

### 3.1 Subscribe to Plan
**Method:** `POST`  
**URL:** `http://localhost:3000/api/subscriptions/subscribe`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```
**Body (raw JSON):**
```json
{
  "plan_id": 1,
  "payment_method_id": "pm_card_visa"
}
```

**Note:** For testing, use Stripe test payment method:
- Create payment method first using Stripe API or
- Use test token: `pm_card_visa`

**Expected Response (201):**
```json
{
  "message": "Subscription created successfully",
  "subscription": {
    "id": 1,
    "user_id": 1,
    "plan_id": 1,
    "stripe_subscription_id": "sub_1234567890",
    "status": "active",
    "current_period_start": "2026-06-05T...",
    "current_period_end": "2026-07-05T...",
    "auto_renew": true
  }
}
```

---

### 3.2 Get My Subscriptions
**Method:** `GET`  
**URL:** `http://localhost:3000/api/subscriptions/my-subscriptions`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Optional Query Parameters:**
```
?status=active
```

**Expected Response (200):**
```json
{
  "count": 1,
  "subscriptions": [
    {
      "id": 1,
      "user_id": 1,
      "status": "active",
      "plan": {
        "id": 1,
        "name": "Basic Monthly",
        "price": 9.99
      }
    }
  ]
}
```

---

### 3.3 Get Single Subscription
**Method:** `GET`  
**URL:** `http://localhost:3000/api/subscriptions/1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected Response (200):**
```json
{
  "subscription": {
    "id": 1,
    "status": "active",
    "current_period_start": "2026-06-05T...",
    "current_period_end": "2026-07-05T...",
    "plan": {
      "name": "Basic Monthly"
    }
  },
  "stripe_subscription": {
    "id": "sub_1234567890",
    "status": "active"
  }
}
```

---

### 3.4 Cancel Subscription
**Method:** `POST`  
**URL:** `http://localhost:3000/api/subscriptions/1/cancel`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```
**Body (raw JSON):**
```json
{
  "cancel_immediately": false
}
```

**Options:**
- `true` = Cancel immediately
- `false` = Cancel at period end

**Expected Response (200):**
```json
{
  "message": "Subscription will be canceled at the end of the current period",
  "subscription": {
    "id": 1,
    "status": "active",
    "cancel_at_period_end": true
  },
  "cancel_at": "2026-07-05T..."
}
```

---

### 3.5 Resume Subscription
**Method:** `POST`  
**URL:** `http://localhost:3000/api/subscriptions/1/resume`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected Response (200):**
```json
{
  "message": "Subscription resumed successfully",
  "subscription": {
    "id": 1,
    "status": "active",
    "cancel_at_period_end": false,
    "auto_renew": true
  }
}
```

---

### 3.6 Upgrade/Downgrade Plan
**Method:** `POST`  
**URL:** `http://localhost:3000/api/subscriptions/1/upgrade`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```
**Body (raw JSON):**
```json
{
  "new_plan_id": 2
}
```

**Expected Response (200):**
```json
{
  "message": "Subscription upgraded to Pro Monthly",
  "subscription": {
    "id": 1,
    "plan_id": 2
  }
}
```

---

### 3.7 Get Subscription History
**Method:** `GET`  
**URL:** `http://localhost:3000/api/subscriptions/1/history`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected Response (200):**
```json
{
  "subscription_id": 1,
  "count": 3,
  "history": [
    {
      "id": 1,
      "action": "subscribed",
      "status_from": null,
      "status_to": "active",
      "created_at": "2026-06-05T..."
    },
    {
      "id": 2,
      "action": "scheduled_cancellation",
      "status_from": "active",
      "status_to": "active",
      "created_at": "2026-06-10T..."
    }
  ]
}
```

---

## 4️⃣ Payments (Legacy)

### 4.1 Create Payment Intent
**Method:** `POST`  
**URL:** `http://localhost:3000/api/payments/create-payment-intent`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "amount": 1999,
  "currency": "usd",
  "description": "Test payment",
  "receipt_email": "customer@example.com"
}
```

**Expected Response (200):**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_1234567890"
}
```

---

### 4.2 Get All Payments
**Method:** `GET`  
**URL:** `http://localhost:3000/api/payments`  

**Expected Response (200):**
```json
{
  "count": 5,
  "payments": [
    {
      "id": 1,
      "amount": 1999,
      "status": "succeeded"
    }
  ]
}
```

---

## 5️⃣ Customers

### 5.1 Create Customer
**Method:** `POST`  
**URL:** `http://localhost:3000/api/customers/create`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "email": "customer@example.com",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

---

### 5.2 Get Customer
**Method:** `GET`  
**URL:** `http://localhost:3000/api/customers/1`  

---

## 6️⃣ Products

### 6.1 Create Product
**Method:** `POST`  
**URL:** `http://localhost:3000/api/products/create`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "name": "Premium Feature",
  "description": "Access to premium features",
  "prices": [
    {
      "amount": 2999,
      "currency": "usd",
      "type": "one_time"
    }
  ]
}
```

---

## 🔐 Making User Admin

To test admin endpoints, update user role in database:

```sql
-- Connect to Neon database
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
```

Then logout and login again to get new token with admin role.

---

## 📝 Postman Environment Variables

Create these variables in Postman:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:3000` |
| `token` | (Save after login) |
| `plan_id` | (Save after creating plan) |
| `subscription_id` | (Save after subscribing) |

Use them as: `{{base_url}}/api/auth/login`

---

## 🧪 Test Sequence

### Complete Flow:
1. ✅ Register user → Save token
2. ✅ Login → Verify token works
3. ✅ Get profile → Verify authentication
4. ✅ Make user admin (database)
5. ✅ Login again → Get admin token
6. ✅ Create subscription plan → Save plan_id
7. ✅ Get all plans → Verify plan exists
8. ✅ Subscribe to plan → Save subscription_id
9. ✅ Get my subscriptions → Verify subscription
10. ✅ Get subscription history → See "subscribed" event
11. ✅ Cancel subscription → Choose immediate/period end
12. ✅ Resume subscription (if canceled at period end)
13. ✅ Get subscription history → See all events

---

## 🎯 Quick Test Links

Copy and paste these into Postman:

### Health Check
```
GET http://localhost:3000/
```

### Register
```
POST http://localhost:3000/api/auth/register
```

### Login
```
POST http://localhost:3000/api/auth/login
```

### Get Plans
```
GET http://localhost:3000/api/subscription-plans
```

### Get Profile
```
GET http://localhost:3000/api/auth/profile
```

---

## 💡 Tips

1. **Save Tokens**: Copy token from login response to use in other requests
2. **Set Headers**: Always include `Content-Type: application/json` for POST/PUT
3. **Authorization**: Use format `Bearer YOUR_TOKEN` (with space)
4. **Admin Access**: Update role in database first
5. **Test Cards**: Use Stripe test card `4242 4242 4242 4242`

---

## 🚨 Common Errors

### 401 Unauthorized
- Token missing or invalid
- Token expired
- Solution: Login again

### 403 Forbidden
- User doesn't have required role
- Solution: Make user admin in database

### 404 Not Found
- Resource doesn't exist
- Wrong ID
- Solution: Check ID exists

### 400 Bad Request
- Missing required fields
- Invalid data format
- Solution: Check request body

---

## 📥 Import Postman Collection

I'll create a JSON file you can import!

See: `Stripe_Subscription_API.postman_collection.json`

---

## ✅ Ready to Test!

1. Start server: `npm start`
2. Open Postman
3. Follow the test sequence above
4. Use the provided URLs and bodies

Happy Testing! 🚀
