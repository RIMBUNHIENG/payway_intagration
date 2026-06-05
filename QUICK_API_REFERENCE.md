# ⚡ Quick API Reference

## 🚀 Base URL
```
http://localhost:3000
```

---

## 📝 Quick Links (Copy & Paste to Postman)

### 1. Register
```
POST http://localhost:3000/api/auth/register
Body: {"email":"test@example.com","password":"SecurePass123!","first_name":"John","last_name":"Doe"}
```

### 2. Login
```
POST http://localhost:3000/api/auth/login
Body: {"email":"test@example.com","password":"SecurePass123!"}
```

### 3. Get Profile
```
GET http://localhost:3000/api/auth/profile
Header: Authorization: Bearer YOUR_TOKEN
```

### 4. Get Plans
```
GET http://localhost:3000/api/subscription-plans
```

### 5. Create Plan (Admin)
```
POST http://localhost:3000/api/subscription-plans
Header: Authorization: Bearer YOUR_TOKEN
Body: {"name":"Basic Monthly","price":9.99,"interval":"month","status":"active"}
```

### 6. Subscribe
```
POST http://localhost:3000/api/subscriptions/subscribe
Header: Authorization: Bearer YOUR_TOKEN
Body: {"plan_id":1,"payment_method_id":"pm_card_visa"}
```

### 7. My Subscriptions
```
GET http://localhost:3000/api/subscriptions/my-subscriptions
Header: Authorization: Bearer YOUR_TOKEN
```

### 8. Cancel Subscription
```
POST http://localhost:3000/api/subscriptions/1/cancel
Header: Authorization: Bearer YOUR_TOKEN
Body: {"cancel_immediately":false}
```

### 9. Get History
```
GET http://localhost:3000/api/subscriptions/1/history
Header: Authorization: Bearer YOUR_TOKEN
```

---

## 🔐 Authentication

All protected endpoints need:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Get token from:
- Register response
- Login response

---

## 📊 All Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Health check |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/profile` | Yes | Get profile |
| GET | `/api/subscription-plans` | No | List plans |
| POST | `/api/subscription-plans` | Admin | Create plan |
| PUT | `/api/subscription-plans/:id` | Admin | Update plan |
| DELETE | `/api/subscription-plans/:id` | Admin | Delete plan |
| POST | `/api/subscriptions/subscribe` | Yes | Subscribe |
| GET | `/api/subscriptions/my-subscriptions` | Yes | My subs |
| GET | `/api/subscriptions/:id` | Yes | Get sub |
| POST | `/api/subscriptions/:id/cancel` | Yes | Cancel |
| POST | `/api/subscriptions/:id/resume` | Yes | Resume |
| POST | `/api/subscriptions/:id/upgrade` | Yes | Upgrade |
| GET | `/api/subscriptions/:id/history` | Yes | History |

---

## 🎯 Test Sequence

1. ✅ Register → Save token
2. ✅ Login → Verify token
3. ✅ Get profile → Check auth
4. ✅ Get plans → See available plans
5. ✅ Make admin (database)
6. ✅ Create plan → Save plan_id
7. ✅ Subscribe → Save subscription_id
8. ✅ Get my subscriptions → Verify
9. ✅ Cancel subscription
10. ✅ Get history → See events

---

## 📥 Import to Postman

File: `Stripe_Subscription_API.postman_collection.json`

1. Open Postman
2. Click "Import"
3. Select the JSON file
4. All requests ready to use!

---

## 🔑 Make User Admin

```sql
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
```

Then login again to get admin token.

---

## 💡 Tips

- Save token after login
- Use `{{token}}` variable in Postman
- Set `base_url` = `http://localhost:3000`
- Check response for IDs to use in next requests

---

Happy Testing! 🚀
