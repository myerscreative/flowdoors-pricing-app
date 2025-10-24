# User Authentication Fix Guide

This guide explains how to fix login and password reset issues for users in the Scenic Doors Pricing App.

## Problem: User Can't Log In or Reset Password

### Root Cause

The authentication system requires **both**:

1. A user record in **Firestore** (`salespeople` collection)
2. A corresponding user in **Firebase Authentication**

If these are out of sync (user exists in Firestore but not in Firebase Auth), login and password reset will fail.

## Solution Steps

### Step 1: Configure Firebase Admin SDK

The fix requires Firebase Admin SDK to be properly configured with a service account key.

1. **Get your Firebase Service Account Key:**
   - Go to: https://console.firebase.google.com/project/flowdoors-pricing-app/settings/serviceaccounts/adminsdk
   - Click **"Generate new private key"**
   - Download the JSON file (it will contain your private key)

2. **Create `.env.local` file** in the project root:

   ```bash
   cd ScenicPricingApp-working
   cp .env.local.example .env.local
   ```

3. **Add the service account key** to `.env.local`:

   ```bash
   # Open the downloaded JSON file and copy the entire contents
   # Paste it on ONE LINE in .env.local like this:
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"flowdoors-pricing-app",...}
   ```

   **Important:** The entire JSON object must be on a single line!

### Step 2: Diagnose the User's Status

Run the diagnostic to check what's wrong:

```bash
cd ScenicPricingApp-working

# Start the development server (if not already running)
pnpm dev

# In a new terminal, check user status
curl "http://localhost:3000/api/users/diagnose?email=robert@scenicdoors.com" | json_pp
```

The diagnostic will show:

- ✅ Whether user exists in Firestore
- ✅ Whether user exists in Firebase Auth
- ✅ Current status and configuration
- 💡 Specific recommendations to fix the issue

### Step 3: Fix the User

Run the fix script:

```bash
# Option 1: Generate a random password for the user
pnpm tsx scripts/fixUserAuth.ts robert@scenicdoors.com

# Option 2: Set a specific password
pnpm tsx scripts/fixUserAuth.ts robert@scenicdoors.com "YourSecurePassword123!"
```

The script will:

1. ✅ Find the user in Firestore
2. ✅ Create/update the user in Firebase Auth
3. ✅ Set the correct role claims
4. ✅ Activate the account
5. ✅ Enable email verification
6. ✅ Set the password

### Step 4: Test Login

1. Go to: http://localhost:3000/admin/login (or your production URL)
2. Enter email: `robert@scenicdoors.com`
3. Enter the password (from Step 3)
4. Click "Sign in"

You should be redirected based on your role:

- `admin` or `manager` → `/admin`
- `salesperson` → `/admin/sales`
- `marketing` → `/marketing`

### Step 5: Test Password Reset

1. Click "Forgot password?" on login page
2. Enter email: `robert@scenicdoors.com`
3. Click "Send reset link"
4. Check your email for the password reset link
5. Follow the link to set a new password
6. Try logging in with the new password

## Common Issues

### Issue: "Firebase Admin not available" error

**Cause:** `FIREBASE_SERVICE_ACCOUNT_KEY` not set in `.env.local`

**Fix:** Follow Step 1 above to configure the service account key

### Issue: "User not found in Firestore"

**Cause:** User was never created in the system

**Fix:** Create the user first:

```bash
# Use the create user API endpoint
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Robert Myers",
    "email": "robert@scenicdoors.com",
    "role": "admin",
    "phone": "555-123-4567",
    "location_code": "SD",
    "prefix": "RM"
  }'
```

Then run the fix script from Step 3.

### Issue: Password reset email not sent

**Causes:**

1. User doesn't exist in Firebase Auth → Run fix script
2. Postmark not configured → Add `POSTMARK_API_TOKEN_DEV` to `.env.local`
3. Email not verified in Postmark → Verify sender signature at https://account.postmarkapp.com/signatures

**Fix:**

```bash
# Check user exists in Firebase Auth
curl "http://localhost:3000/api/users/diagnose?email=robert@scenicdoors.com"

# If user not found, run fix script
pnpm tsx scripts/fixUserAuth.ts robert@scenicdoors.com
```

### Issue: "Role claims are not set yet"

**Cause:** User exists but doesn't have role custom claims

**Fix:** The fix script will automatically set role claims. Just run:

```bash
pnpm tsx scripts/fixUserAuth.ts robert@scenicdoors.com
```

## Script Reference

### Diagnose User Status

```bash
# Via API (requires dev server running)
curl "http://localhost:3000/api/users/diagnose?email=USER_EMAIL"

# Or visit in browser
http://localhost:3000/api/users/diagnose?email=USER_EMAIL
```

### Fix User Authentication

```bash
# With random password
pnpm tsx scripts/fixUserAuth.ts USER_EMAIL

# With specific password
pnpm tsx scripts/fixUserAuth.ts USER_EMAIL "Password123!"
```

### List All Users

```bash
pnpm tsx scripts/listUsersWithRoles.ts
```

### Set User Role

```bash
pnpm tsx scripts/setUserRole.ts USER_EMAIL ROLE

# Examples:
pnpm tsx scripts/setUserRole.ts robert@scenicdoors.com admin
pnpm tsx scripts/setUserRole.ts sales@scenicdoors.com salesperson
```

## Prevention

To prevent future authentication issues:

1. **Always use the activation flow:** When creating users via `/api/users/create`, ensure they complete the activation process via the link sent to their email

2. **Check logs:** The activation endpoint (`/api/users/activate`) logs detailed information about user creation

3. **Verify environment:** Ensure `.env.local` has `FIREBASE_SERVICE_ACCOUNT_KEY` configured on all environments (dev, staging, production)

4. **Monitor Firebase console:** Check https://console.firebase.google.com/project/flowdoors-pricing-app/authentication/users to see all authenticated users

## Need Help?

If you're still having issues:

1. Check the browser console for detailed error messages
2. Check the server logs (`pnpm dev` terminal output)
3. Run the diagnostic endpoint to get specific recommendations
4. Contact the development team with the diagnostic output
