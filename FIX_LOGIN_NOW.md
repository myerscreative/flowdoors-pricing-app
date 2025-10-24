# Quick Fix for robert@scenicdoors.com Login Issue

## TL;DR - Run These Commands

```bash
cd /Users/robertmyers/Documents/Apps/ScenicDoors\ Pricing\ App/ScenicPricingApp-working

# Step 1: Get Firebase service account key (see below)
# Add it to .env.local file

# Step 2: Fix the user
pnpm tsx scripts/fixUserAuth.ts robert@scenicdoors.com "YourNewPassword123!"

# Step 3: Test login
# Go to http://localhost:3000/admin/login
# Login with: robert@scenicdoors.com / YourNewPassword123!
```

## Full Instructions

### Step 1: Configure Firebase Admin SDK

1. **Get your Firebase Service Account Key:**
   - Visit: https://console.firebase.google.com/project/flowdoors-pricing-app/settings/serviceaccounts/adminsdk
   - Click the **"Generate new private key"** button
   - Click **"Generate key"** in the confirmation dialog
   - A JSON file will download (e.g., `flowdoors-pricing-app-xxxxx.json`)

2. **Create `.env.local` file:**

   ```bash
   cd /Users/robertmyers/Documents/Apps/ScenicDoors\ Pricing\ App/ScenicPricingApp-working

   # Create the file
   touch .env.local

   # Open in your editor
   open -a TextEdit .env.local
   # Or use your preferred editor: code .env.local, nano .env.local, etc.
   ```

3. **Add the service account key:**

   Open the downloaded JSON file and copy ALL the contents. Then paste into `.env.local`:

   ```bash
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"flowdoors-pricing-app","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...","client_email":"firebase-adminsdk-xxxxx@flowdoors-pricing-app.iam.gserviceaccount.com",...}
   ```

   **CRITICAL:** The entire JSON must be on ONE LINE!

4. **Add other required variables:**

   ```bash
   FIREBASE_WEB_API_KEY=AIzaSyDzzpdpzRfM2n-TJYP2W_L2Q5DKq9Ix8pg
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

   Your complete `.env.local` should look like:

   ```
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...entire JSON on one line...}
   FIREBASE_WEB_API_KEY=AIzaSyDzzpdpzRfM2n-TJYP2W_L2Q5DKq9Ix8pg
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

### Step 2: Fix Your User Account

```bash
cd /Users/robertmyers/Documents/Apps/ScenicDoors\ Pricing\ App/ScenicPricingApp-working

# Option A: Set a specific password
pnpm tsx scripts/fixUserAuth.ts robert@scenicdoors.com "MySecurePassword123!"

# Option B: Let the script generate a random password
pnpm tsx scripts/fixUserAuth.ts robert@scenicdoors.com
```

The script will show you:

- ✅ If user found in Firestore
- ✅ If user created/updated in Firebase Auth
- ✅ Role claims set
- ✅ Account activated
- 🔑 The password to use for login

### Step 3: Test Login

1. **Start the dev server** (if not already running):

   ```bash
   cd /Users/robertmyers/Documents/Apps/ScenicDoors\ Pricing\ App/ScenicPricingApp-working
   pnpm dev
   ```

2. **Open browser and go to:**

   ```
   http://localhost:3000/admin/login
   ```

3. **Login with:**
   - Email: `robert@scenicdoors.com`
   - Password: (the one you set in Step 2)

4. **You should be redirected to** `/admin` (if you have admin role)

### Step 4: Test Password Reset

1. On the login page, click **"Forgot password?"**
2. Enter: `robert@scenicdoors.com`
3. Click **"Send reset link"**
4. Check your email for the reset link
5. Click the link and set a new password
6. Try logging in with the new password

## Troubleshooting

### Error: "Missing FIREBASE_SERVICE_ACCOUNT_KEY"

- Make sure you created `.env.local` in the correct directory
- Verify the JSON is on ONE LINE (no line breaks)
- Check that the file is saved

### Error: "User not found in Firestore"

Your account doesn't exist yet. Create it first:

```bash
# Start dev server
pnpm dev

# In another terminal, create user
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Robert Myers",
    "email": "robert@scenicdoors.com",
    "role": "admin",
    "phone": "555-555-5555",
    "location_code": "SD",
    "prefix": "RM"
  }'

# Then run the fix script
pnpm tsx scripts/fixUserAuth.ts robert@scenicdoors.com "Password123!"
```

### Still Can't Login?

Run the diagnostic to see what's wrong:

```bash
# Start dev server
pnpm dev

# Open in browser
http://localhost:3000/api/users/diagnose?email=robert@scenicdoors.com

# Or use curl
curl "http://localhost:3000/api/users/diagnose?email=robert@scenicdoors.com"
```

The diagnostic will tell you exactly what's wrong and how to fix it.

## What This Fix Does

The authentication system requires users to exist in TWO places:

1. **Firestore** (`salespeople` collection) - stores user profile, role, status
2. **Firebase Authentication** - handles actual login with email/password

When these get out of sync, you can't log in. The `fixUserAuth.ts` script:

1. ✅ Finds your user in Firestore
2. ✅ Creates/updates you in Firebase Authentication
3. ✅ Sets your role claims (so you can access admin routes)
4. ✅ Activates your account
5. ✅ Enables email verification
6. ✅ Sets your password
7. ✅ Updates Firestore with correct status

After running the fix, both systems are in sync and you can log in!

## Need More Help?

- Full guide: `docs/USER_AUTH_FIX_GUIDE.md`
- Scripts README: `scripts/README.md`
- Environment setup: `environment-setup.md`
