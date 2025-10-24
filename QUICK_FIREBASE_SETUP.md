# Quick Firebase Environment Variables Setup

## Step 1: Get Your Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (probably "flowdoors-pricing-app")
3. Click the **⚙️ gear icon** → **Project Settings**
4. Click the **Service Accounts** tab
5. Click **Generate New Private Key** button
6. Click **Generate Key** to download the JSON file

## Step 2: Extract Values from JSON

Open the downloaded JSON file. You'll see something like:

```json
{
  "type": "service_account",
  "project_id": "flowdoors-pricing-app",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@flowdoors-pricing-app.iam.gserviceaccount.com",
  ...
}
```

Extract these three values:

- **FIREBASE_PROJECT_ID** = `project_id` field
- **FIREBASE_CLIENT_EMAIL** = `client_email` field
- **FIREBASE_PRIVATE_KEY** = `private_key` field (keep the `\n` characters!)

## Step 3: Add to Firebase App Hosting

### Option A: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **App Hosting** in left sidebar
4. Click on your app
5. Click **Configuration** or **Environment** tab
6. Add these as secrets:

```
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
FIREBASE_PROJECT_ID
```

### Option B: Firebase CLI

Run these commands in your terminal:

```bash
cd "/Users/robertmyers/Documents/Apps/ScenicDoors Pricing App/ScenicPricingApp-working"

# Set the private key (paste the entire key including BEGIN/END lines)
firebase apphosting:secrets:set FIREBASE_PRIVATE_KEY

# Set the client email
firebase apphosting:secrets:set FIREBASE_CLIENT_EMAIL

# Set the project ID
firebase apphosting:secrets:set FIREBASE_PROJECT_ID
```

## Step 4: Trigger a New Deployment

After setting the secrets, you need to trigger a new deployment:

**Option 1:** Push any change to your main branch (triggers auto-deploy)
**Option 2:** Manually trigger deployment in Firebase Console

## Step 5: Verify It's Working

After deployment completes:

1. Visit your app URL
2. Open browser console (F12)
3. You should see **NO MORE** 500 errors from `/api/quote/leads`
4. Images should display correctly

## Need Help?

If you see errors, check:

- `/api/admin-project` endpoint to see if project ID is detected
- `/api/debug-firebase` endpoint to see Firebase config
- Firebase App Hosting logs for detailed error messages
