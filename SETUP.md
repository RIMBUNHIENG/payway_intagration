# 🚀 Stripe Payment Integration Setup Guide

Complete setup instructions for the Node.js/Express Stripe payment backend.

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Stripe account ([sign up here](https://dashboard.stripe.com/register))

---

## ⚙️ Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `stripe` - Stripe Node.js SDK
- `dotenv` - Environment variable management
- `cors` - Cross-origin resource sharing
- `body-parser` - Request body parsing
- `nodemon` - Development auto-reload (dev dependency)

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Stripe keys:

```env
# Stripe API Keys (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Where to find your Stripe keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API keys**
3. Copy your **Secret key** and **Publishable key**
4. For test mode, use keys starting with `sk_test_` and `pk_test_`

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

---

## 🔌 Webhook Configuration

Webhooks allow you to receive real-time events from Stripe.

### Local Development (using Stripe CLI)

1. **Install Stripe CLI:**

   **macOS:**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

   **Linux:**
   ```bash
   wget https://github.com/stripe/stripe-cli/releases/download/vX.X.X/stripe_X.X.X_linux_x86_64.tar.gz
   tar -xvf stripe_X.X.X_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin
   ```

   **Windows:**
   Download from [GitHub releases](https://github.com/stripe/stripe-cli/releases)

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`) and add it to your `.env` file:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

### Production Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `customer.subscription.created`
   - etc.
5. Copy the **Signing secret** and add to your production environment variables

---

## 🧪 Testing

### Test Cards

Stripe provides test cards for different scenarios:

| Card Number          | Description                  |
|----------------------|------------------------------|
| 4242 4242 4242 4242  | Success (Visa)               |
| 4000 0025 0000 3155  | Requires authentication      |
| 4000 0000 0000 0002  | Card declined                |
| 4000 0000 0000 9995  | Insufficient funds           |
| 4000 0000 0000 0069  | Expired card                 |
| 4000 0000 0000 0127  | Incorrect CVC                |

**For all test cards:**
- Use any future expiry date (e.g., 12/25)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

### Testing API Endpoints

1. **Create a product:**
   ```bash
   curl -X POST http://localhost:3000/api/products/create \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Product",
       "description": "A test product",
       "amount": 2000,
       "currency": "usd"
     }'
   ```

2. **Create a payment intent:**
   ```bash
   curl -X POST http://localhost:3000/api/payments/create-payment-intent \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 2000,
       "currency": "usd",
       "description": "Test payment"
     }'
   ```

3. **Test the frontend:**
   - Open `client-example.html` in your browser
   - Update the Stripe publishable key (line 77)
   - Test a payment with card `4242 4242 4242 4242`

---

## 📁 Project Structure

```
stripe-payment-integration/
├── src/
│   ├── config/
│   │   └── stripe.js              # Stripe configuration
│   ├── middleware/
│   │   ├── errorHandler.js        # Global error handling
│   │   └── validation.js          # Request validation
│   └── routes/
│       ├── payments.js             # Payment Intent routes
│       ├── checkout.js             # Checkout Session routes
│       ├── customers.js            # Customer management routes
│       ├── products.js             # Product management routes
│       └── webhooks.js             # Webhook event handlers
├── server.js                       # Main application entry point
├── client-example.html             # Frontend demo
├── package.json                    # Dependencies
├── .env                            # Environment variables (don't commit!)
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── README.md                       # Project overview
├── SETUP.md                        # This file
└── API_DOCUMENTATION.md            # Complete API reference
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file**
   - Already included in `.gitignore`
   - Use environment variables in production

2. **Verify webhook signatures**
   - Always verify `stripe-signature` header
   - Already implemented in webhook route

3. **Use HTTPS in production**
   - Required for live mode Stripe requests
   - Configure SSL/TLS on your server

4. **Validate all inputs**
   - Validation middleware already implemented
   - Add custom validation as needed

5. **Handle errors gracefully**
   - Don't expose sensitive error details
   - Log errors for debugging

6. **Use Stripe test mode for development**
   - Test keys start with `sk_test_` and `pk_test_`
   - Switch to live keys only in production

---

## 🚀 Deployment

### Deploy to Heroku

1. **Install Heroku CLI:**
   ```bash
   brew install heroku/brew/heroku
   ```

2. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set STRIPE_SECRET_KEY=sk_live_xxx
   heroku config:set STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Deploy to AWS/DigitalOcean/Other

1. Set up a Node.js server
2. Install dependencies: `npm install --production`
3. Set environment variables
4. Configure HTTPS
5. Use PM2 or similar for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name stripe-api
   pm2 save
   pm2 startup
   ```

---

## 🛠️ Troubleshooting

### "No such API key"
- Check that `STRIPE_SECRET_KEY` is set in `.env`
- Ensure `.env` file is in the root directory
- Restart the server after changing `.env`

### "Webhook signature verification failed"
- Run `stripe listen --forward-to localhost:3000/api/webhook`
- Copy the webhook signing secret to `.env`
- Restart the server

### "CORS error" from frontend
- Ensure `cors` middleware is enabled
- Check that frontend is making requests to correct URL
- Update CORS configuration if needed

### Port already in use
- Change `PORT` in `.env` file
- Or kill existing process: `lsof -ti:3000 | xargs kill -9`

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhook Events](https://stripe.com/docs/api/events/types)
- [Node.js SDK](https://github.com/stripe/stripe-node)

---

## 💡 Next Steps

- [ ] Implement database storage (PostgreSQL, MongoDB, etc.)
- [ ] Add user authentication (JWT, OAuth, etc.)
- [ ] Create a proper frontend (React, Vue, Angular)
- [ ] Add subscription management
- [ ] Implement invoice generation
- [ ] Add email notifications (SendGrid, Mailgun, etc.)
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Add rate limiting
- [ ] Create admin dashboard
- [ ] Write unit and integration tests

---

## 📧 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review [Stripe documentation](https://stripe.com/docs)
3. Check Stripe logs in the [Dashboard](https://dashboard.stripe.com/logs)

Happy coding! 🎉
