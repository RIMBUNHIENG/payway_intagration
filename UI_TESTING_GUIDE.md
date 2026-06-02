# 🎨 UI Testing Guide

## 🚀 Quick Start

### Step 1: Start Your Server
```bash
npm start
```

Server should be running on `http://localhost:3000`

### Step 2: Open the UI
Open `subscription-ui.html` in your web browser:
```bash
# On macOS
open subscription-ui.html

# Or simply double-click the file in Finder
```

---

## 📋 Testing Workflow

### 1️⃣ Register a New User

1. Click on the **"Register"** tab
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: test@example.com
   - Password: SecurePass123!
3. Click **"Register"** button
4. You'll be automatically logged in

**Expected Result:** ✅ You should see "Registration successful!" message and be logged into the app.

---

### 2️⃣ Make User Admin (For Testing Admin Features)

**Option A - Via Database (Recommended):**
1. Connect to your Neon database
2. Run this SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
```
3. Logout and login again in the UI

**Option B - Via Terminal:**
```bash
# Connect to Neon with psql
psql "postgresql://neondb_owner:npg_lW2UmKS0RDbN@ep-little-lab-ap7i2s5c.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Update user role
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
```

**Expected Result:** ✅ After re-login, you'll see an "Admin: Create Subscription Plan" section.

---

### 3️⃣ Create Subscription Plans (Admin Only)

As an admin, scroll down to the **"Admin: Create Subscription Plan"** section:

**Create Basic Plan:**
- Plan Name: Basic Monthly
- Price: 9.99
- Interval: Monthly
- Trial Days: 7
- Description: Perfect for individuals
- Click **"Create Plan"**

**Create Pro Plan:**
- Plan Name: Pro Monthly
- Price: 29.99
- Interval: Monthly
- Trial Days: 14
- Description: For professionals and teams
- Click **"Create Plan"**

**Expected Result:** ✅ Plans appear in the "Available Subscription Plans" section with pricing cards.

---

### 4️⃣ Subscribe to a Plan

1. In the **"Available Subscription Plans"** section, find a plan
2. Click **"Subscribe Now"** button
3. A payment modal will appear
4. Enter test card details:
   - Card Number: `4242 4242 4242 4242`
   - Expiry Date: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
5. Click **"Subscribe"** button

**Expected Result:** ✅ "Subscription created successfully!" message appears, and the subscription shows up in "My Subscriptions" section.

---

### 5️⃣ View Your Subscriptions

Check the **"My Subscriptions"** section:
- You'll see your active subscription
- Status badge shows "active"
- Current period dates displayed
- Auto-renew status shown

**Available Actions:**
- **Cancel** - Cancel the subscription
- **View History** - See all subscription events

---

### 6️⃣ Cancel a Subscription

1. In "My Subscriptions", click **"Cancel"** button
2. Confirm the cancellation
3. Choose:
   - **OK** = Cancel immediately
   - **Cancel** = Cancel at period end

**Expected Result:** ✅ Subscription status updates and shows when it will end.

---

### 7️⃣ Resume a Canceled Subscription

If you canceled at period end (not immediately):
1. You'll see a **"Resume"** button
2. Click **"Resume"**
3. Subscription is reactivated

**Expected Result:** ✅ Auto-renew is turned back on.

---

### 8️⃣ View Subscription History

1. Click **"View History"** button on any subscription
2. See complete audit trail:
   - Subscribed
   - Status changes
   - Cancellations
   - Resumptions
   - Timestamps for all events

**Expected Result:** ✅ A popup shows all subscription events in chronological order.

---

## 🎨 UI Features

### Visual Indicators

**Status Badges:**
- 🟢 **Active** - Green badge, subscription is active
- 🔴 **Canceled** - Red badge, subscription ended
- 🔵 **Trialing** - Blue badge, in trial period
- 🟡 **Past Due** - Yellow badge, payment failed

**User Roles:**
- 💜 **Admin** - Pink badge, can create plans
- 💙 **User** - Blue badge, regular user

### Real-time Updates
- All data refreshes after actions
- Alerts appear for success/error messages
- Auto-dismiss after 5 seconds

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path
1. ✅ Register → Login
2. ✅ View available plans
3. ✅ Subscribe to a plan
4. ✅ View subscription details
5. ✅ View history

### Scenario 2: Cancel & Resume
1. ✅ Subscribe to a plan
2. ✅ Cancel at period end
3. ✅ Verify warning shows
4. ✅ Resume subscription
5. ✅ Verify auto-renew back on

### Scenario 3: Admin Flow
1. ✅ Login as admin
2. ✅ Create multiple plans
3. ✅ Verify plans appear
4. ✅ Subscribe to own plan
5. ✅ Manage subscription

### Scenario 4: Multiple Users
1. ✅ Register User A
2. ✅ Subscribe to Plan 1
3. ✅ Logout
4. ✅ Register User B
5. ✅ Subscribe to Plan 2
6. ✅ Verify isolation (can't see other's subscriptions)

---

## 🔍 What to Verify

### ✅ Authentication
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Invalid password shows error
- [ ] Token persists (refresh page stays logged in)
- [ ] Logout works properly

### ✅ Plans Display
- [ ] Plans load and display correctly
- [ ] Prices shown properly formatted
- [ ] Trial period displayed if > 0
- [ ] Subscribe button works

### ✅ Subscription Flow
- [ ] Payment modal opens
- [ ] Stripe card element loads
- [ ] Test card works (4242...)
- [ ] Invalid card shows error
- [ ] Subscription appears in "My Subscriptions"

### ✅ Subscription Management
- [ ] Active subscription displays correctly
- [ ] Status badges show right color
- [ ] Cancel button appears for active
- [ ] Resume button appears for scheduled cancellation
- [ ] History shows all events

### ✅ Admin Features
- [ ] Admin section visible only for admins
- [ ] Can create new plans
- [ ] Plans sync to Stripe
- [ ] New plans appear immediately

---

## 🚨 Common Issues & Solutions

### Issue: "Failed to load plans"
**Solution:** Check if server is running on port 3000

### Issue: "Network error"
**Solution:** 
1. Check `API_BASE` in HTML (line ~212)
2. Should be `http://localhost:3000/api`
3. Verify server is running

### Issue: Payment modal doesn't show card form
**Solution:**
1. Check Stripe publishable key in HTML (line ~388)
2. Replace with your key: `pk_test_51TXFvFFf1NjKrMMA...`
3. Check browser console for errors

### Issue: "401 Unauthorized"
**Solution:**
1. Logout and login again
2. Token may have expired
3. Check JWT_EXPIRES_IN in .env

### Issue: Admin section not showing
**Solution:**
1. Update user role to 'admin' in database
2. Logout and login again
3. Verify `currentUser.role === 'admin'`

### Issue: Stripe errors
**Solution:**
1. Check STRIPE_SECRET_KEY in `.env`
2. Verify publishable key in HTML
3. Ensure test mode keys (start with `pk_test_` and `sk_test_`)

---

## 🎯 Test Card Numbers

Use these Stripe test cards:

**Success:**
- `4242 4242 4242 4242` - Succeeds immediately
- `4000 0025 0000 3155` - Requires authentication (3D Secure)

**Failure:**
- `4000 0000 0000 9995` - Insufficient funds
- `4000 0000 0000 0069` - Card expired

**For all cards:**
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

## 📊 Verify in Stripe Dashboard

After testing, check your Stripe Dashboard:

1. **Customers** tab:
   - Should see customers created
   - Email matches users

2. **Products** tab:
   - Should see products created
   - Names match plan names

3. **Subscriptions** tab:
   - Should see active subscriptions
   - Status matches UI

4. **Payments** tab:
   - Should see successful payments
   - Amounts match plan prices

---

## 🎉 Success Criteria

Your UI is working correctly if:

1. ✅ Users can register and login
2. ✅ Plans display with correct pricing
3. ✅ Payment form loads Stripe elements
4. ✅ Subscriptions are created successfully
5. ✅ Subscriptions appear in "My Subscriptions"
6. ✅ Can cancel and resume subscriptions
7. ✅ History shows all events
8. ✅ Admins can create new plans
9. ✅ All actions show success/error messages
10. ✅ Data syncs with Stripe dashboard

---

## 💡 Pro Tips

1. **Open Browser DevTools** (F12) to see:
   - Network requests
   - Console errors
   - API responses

2. **Check Server Logs** for:
   - API calls
   - Stripe events
   - Error messages

3. **Use Incognito Mode** to test:
   - Multiple users
   - Fresh sessions
   - Different roles

4. **Test Mobile View**:
   - Resize browser window
   - UI is responsive
   - Forms work on mobile

---

## 📞 Need Help?

If something doesn't work:

1. **Check Server:** Is it running? `npm start`
2. **Check Console:** Open browser DevTools
3. **Check Network:** View API responses
4. **Check Database:** Verify data was saved
5. **Check Stripe:** View dashboard events

---

## 🎊 Ready to Test!

Open `subscription-ui.html` in your browser and start testing! 🚀

The UI provides a complete subscription management experience:
- Beautiful design
- Real-time updates
- Stripe integration
- Error handling
- Admin features

Enjoy testing! 🎉
