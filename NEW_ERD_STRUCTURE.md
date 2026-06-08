# New ERD Structure Implementation

## Overview
This implements your new database structure for a mentor/user subscription system, replacing the current Stripe-focused design.

## New Database Structure

### 1. **mentor** table
- `user_id` (PK) - Primary key
- `firstname` - User's first name (100 chars)
- `lastname` - User's last name (100 chars) 
- `gender` - Gender (20 chars)
- `phone_number` - Phone number (100 chars)
- `address` - Address (255 chars)
- `description` - Profile description (text)
- `profile_picture` - Profile picture URL (text)
- `create_date` - Creation timestamp
- `update_date` - Update timestamp

### 2. **users_type** table
- `user_type_id` (PK) - Primary key
- `user_type_name` - Type name (50 chars) - e.g., 'admin', 'user', 'mentor'
- `create_date` - Creation timestamp
- `update_date` - Update timestamp

### 3. **users** table
- `user_id` (PK) - Primary key
- `user_type_id` (FK) - References users_type.user_type_id
- `status` - User status (active/inactive)
- `email` - Email address (100 chars, unique)
- `password` - Hashed password (255 chars)
- `create_date` - Creation timestamp
- `update_date` - Update timestamp

### 4. **subscription_Plan** table
- `subscription_Plan_id` (PK) - Primary key
- `admin_id` (FK) - References users.user_id (admin who created plan)
- `name` - Plan name (200 chars)
- `price` - Plan price (DECIMAL 10,3) - **This fixes your price format issue!**
- `duration_day` - Duration in days
- `description` - Plan description (255 chars)

### 5. **subscription** table
- `subscription_id` (PK) - Primary key
- `subscription_Plan_id` (FK) - References subscription_Plan.subscription_Plan_id
- `user_id` (FK) - References users.user_id
- `start_date` - Subscription start date
- `end_date` - Subscription end date
- `user_type_id` (FK) - References users_type.user_type_id

## Key Changes

### ✅ Price Format Fixed
- **Old**: `amount` as INTEGER (cents) - caused 242 → 24200 issue
- **New**: `price` as DECIMAL(10,3) - stores 242.000 exactly as entered

### ✅ Proper Relationships
- Users have types (admin, user, mentor)
- Subscription plans created by admins
- Subscriptions link users to plans with duration tracking

### ✅ Mentor System
- Separate mentor profiles with detailed information
- Profile pictures, descriptions, contact info

## Files Created

1. **Models:**
   - `src/models/Mentor.js` - Mentor model
   - `src/models/UsersType.js` - User types model
   - `src/models/NewUser.js` - New user model structure
   - `src/models/NewSubscriptionPlan.js` - New subscription plan model
   - `src/models/NewSubscription.js` - New subscription model
   - `src/models/newIndex.js` - Relationships setup

2. **Migration:**
   - `src/database/newMigrate.js` - Migration script with sample data

## How to Apply Changes

1. **Backup your current database** (important!)
2. Run the new migration:
   ```bash
   node src/database/newMigrate.js
   ```
3. Update controllers to use new model structure
4. Update UI to work with new API endpoints

## Price Format Example

**With new structure:**
- User enters: `242`
- Stored as: `242.000` (DECIMAL)
- Displayed as: `$242.00` ✅

**Old structure had:**
- User enters: `242`
- Converted to: `24200` (cents)
- Sometimes displayed as: `$242.00` or `$24200.00` ❌

## Next Steps

Would you like me to:
1. Run the migration to create the new structure?
2. Update the controllers to work with the new models?
3. Create new API endpoints for the mentor system?
4. Update the UI to match the new structure?