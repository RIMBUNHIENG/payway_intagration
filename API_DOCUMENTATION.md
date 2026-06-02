# Stripe Payment API Documentation

Complete API reference for the Stripe Payment Integration backend.

## Base URL
```
http://localhost:3000/api
```

---

## 🔹 Payments

### Create Payment Intent
Create a payment intent for processing card payments.

**Endpoint:** `POST /api/payments/create-payment-intent`

**Request Body:**
```json
{
  "amount": 2000,
  "currency": "usd",
  "description": "Product purchase",
  "customerId": "cus_xxx",
  "metadata": {
    "orderId": "12345",
    "userId": "user_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 2000,
  "currency": "usd"
}
```

### Retrieve Payment Intent
Get details of a payment intent.

**Endpoint:** `GET /api/payments/payment-intent/:id`

**Response:**
```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_xxx",
    "amount": 2000,
    "currency": "usd",
    "status": "succeeded",
    "created": 1234567890,
    "description": "Product purchase"
  }
}
```

### Confirm Payment Intent
Confirm a payment intent (server-side).

**Endpoint:** `POST /api/payments/confirm-payment-intent`

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "paymentMethodId": "pm_xxx"
}
```

### Cancel Payment Intent
Cancel a payment intent.

**Endpoint:** `POST /api/payments/cancel-payment-intent`

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx"
}
```

### Create Refund
Refund a payment (full or partial).

**Endpoint:** `POST /api/payments/refund`

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "amount": 1000,
  "reason": "requested_by_customer"
}
```

**Refund Reasons:**
- `duplicate` - Duplicate charge
- `fraudulent` - Fraudulent transaction
- `requested_by_customer` - Customer requested

**Response:**
```json
{
  "success": true,
  "refund": {
    "id": "re_xxx",
    "amount": 1000,
    "currency": "usd",
    "status": "succeeded",
    "reason": "requested_by_customer"
  }
}
```

---

## 🔹 Checkout

### Create Checkout Session
Create a hosted Stripe Checkout session.

**Endpoint:** `POST /api/checkout/create-checkout-session`

**Request Body:**
```json
{
  "priceId": "price_xxx",
  "mode": "payment",
  "quantity": 1,
  "customerId": "cus_xxx",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel",
  "metadata": {
    "orderId": "12345"
  }
}
```

**Mode Options:**
- `payment` - One-time payment
- `subscription` - Recurring subscription
- `setup` - Save payment method

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_xxx",
  "url": "https://checkout.stripe.com/c/pay/cs_xxx"
}
```

### Retrieve Checkout Session
Get details of a checkout session.

**Endpoint:** `GET /api/checkout/checkout-session/:id`

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "cs_xxx",
    "status": "complete",
    "payment_status": "paid",
    "amount_total": 2000,
    "currency": "usd",
    "customer": "cus_xxx",
    "payment_intent": "pi_xxx"
  }
}
```

---

## 🔹 Customers

### Create Customer
Create a new Stripe customer.

**Endpoint:** `POST /api/customers/create`

**Request Body:**
```json
{
  "email": "customer@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "address": {
    "line1": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94111",
    "country": "US"
  },
  "metadata": {
    "userId": "user_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "customer": {
    "id": "cus_xxx",
    "email": "customer@example.com",
    "name": "John Doe",
    "created": 1234567890
  }
}
```

### Get Customer
Retrieve customer details.

**Endpoint:** `GET /api/customers/:id`

### Update Customer
Update customer information.

**Endpoint:** `PUT /api/customers/:id`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

### Delete Customer
Delete a customer.

**Endpoint:** `DELETE /api/customers/:id`

### List Customers
List all customers.

**Endpoint:** `GET /api/customers?limit=10&email=test@example.com`

### Attach Payment Method
Attach a payment method to a customer.

**Endpoint:** `POST /api/customers/:id/payment-methods`

**Request Body:**
```json
{
  "paymentMethodId": "pm_xxx"
}
```

### List Customer Payment Methods
Get all payment methods for a customer.

**Endpoint:** `GET /api/customers/:id/payment-methods?type=card`

---

## 🔹 Products

### Create Product with Price
Create a new product and price.

**Endpoint:** `POST /api/products/create`

**Request Body (One-time payment):**
```json
{
  "name": "Premium Widget",
  "description": "High-quality widget",
  "amount": 2999,
  "currency": "usd",
  "metadata": {
    "category": "widgets"
  }
}
```

**Request Body (Subscription):**
```json
{
  "name": "Premium Plan",
  "description": "Monthly subscription",
  "amount": 1999,
  "currency": "usd",
  "recurring": {
    "interval": "month",
    "interval_count": 1
  }
}
```

**Recurring Intervals:**
- `day`
- `week`
- `month`
- `year`

**Response:**
```json
{
  "success": true,
  "product": {
    "id": "prod_xxx",
    "name": "Premium Widget",
    "description": "High-quality widget"
  },
  "price": {
    "id": "price_xxx",
    "amount": 2999,
    "currency": "usd",
    "recurring": null
  }
}
```

### Get Product
Retrieve product details.

**Endpoint:** `GET /api/products/:id`

### List Products
List all products.

**Endpoint:** `GET /api/products?limit=10&active=true`

### Update Product
Update product information.

**Endpoint:** `PUT /api/products/:id`

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "description": "New description",
  "active": true
}
```

### Delete Product
Delete a product.

**Endpoint:** `DELETE /api/products/:id`

### List Product Prices
Get all prices for a product.

**Endpoint:** `GET /api/products/:id/prices?limit=10`

---

## 🔹 Webhooks

### Webhook Endpoint
Receive Stripe webhook events.

**Endpoint:** `POST /api/webhook`

**Headers:**
- `stripe-signature`: Webhook signature for verification

**Handled Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `checkout.session.completed`
- `checkout.session.expired`
- `charge.succeeded`
- `charge.failed`
- `charge.refunded`
- `customer.created`
- `customer.updated`
- `customer.deleted`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Error description"
}
```

**HTTP Status Codes:**
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (Stripe connection error)

---

## Testing

### Test Cards

**Success:**
- `4242 4242 4242 4242` - Visa

**Decline:**
- `4000 0000 0000 0002` - Decline

**Authentication Required:**
- `4000 0025 0000 3155` - Requires 3D Secure

**Insufficient Funds:**
- `4000 0000 0000 9995` - Decline (insufficient funds)

Use any future expiry date, any 3-digit CVC, and any ZIP code.

### Test Mode
All API requests use test mode keys (`sk_test_*` and `pk_test_*`).

---

## Rate Limiting

Stripe has rate limits on API requests:
- **Test mode:** 25 requests/second
- **Live mode:** 100 requests/second

---

## Security

- ✅ All sensitive keys stored in environment variables
- ✅ Webhook signatures verified
- ✅ CORS enabled
- ✅ Input validation on all endpoints
- ✅ Error messages don't expose sensitive data

---

## Next Steps

1. Set up webhook endpoint in Stripe Dashboard
2. Implement database storage for transactions
3. Add user authentication
4. Create frontend integration
5. Set up monitoring and logging
6. Deploy to production with HTTPS
