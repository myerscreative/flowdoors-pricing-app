# Deployment Environment Variables Setup

## Issues Fixed

### 1. Product Images Not Showing

**Fixed**: Updated product image paths from non-existent `.svg` files to actual `.png` files in `src/data/mockProducts.ts`.

### 2. 500 Errors from Leads API

**Cause**: Firebase Admin SDK cannot initialize in the deployed environment due to missing environment variables.

**Affected Routes**:

- `/api/quote/leads` (called from LeadIntakeForm, AttributionTracker, DoorConfigurator)
- `/api/marketing/summary`
- Other API routes using Firebase Admin SDK

## Required Environment Variables for Deployment

### Firebase Admin SDK (Server-Side)

These variables are required for the Firebase Admin SDK to authenticate and access Firestore:

```bash
# Firebase Admin SDK Configuration
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PROJECT_ID="your-firebase-project-id"
```

**How to get these values:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Download the JSON file
7. Extract the values:
   - `FIREBASE_PRIVATE_KEY` = `private_key` field (keep the `\n` characters as-is)
   - `FIREBASE_CLIENT_EMAIL` = `client_email` field
   - `FIREBASE_PROJECT_ID` = `project_id` field

### Firebase Client SDK (Browser-Side)

These are public variables needed for client-side Firebase authentication:

```bash
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-firebase-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:xxxxxxxxxxxxx"
```

**How to get these values:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → Project Settings
4. Go to "General" tab
5. Scroll down to "Your apps" section
6. Click on your web app or create one
7. Copy the config values from the `firebaseConfig` object

### Email Service (Postmark)

```bash
# Postmark Configuration
POSTMARK_API_TOKEN="your-production-postmark-token"
POSTMARK_WEBHOOK_SECRET="your-webhook-secret"
```

### App Configuration

```bash
# App URLs
NEXT_PUBLIC_APP_URL="https://app.scenicdoors.co"
NEXT_PUBLIC_BASE_URL="https://app.scenicdoors.co"

# Environment
NODE_ENV="production"
```

## Setting Environment Variables in Firebase App Hosting

Since you're using Firebase App Hosting (based on `apphosting.yaml`), set environment variables using one of these methods:

### Method 1: Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to "App Hosting" in the left sidebar
4. Click on your app
5. Go to "Configuration" or "Environment Variables"
6. Add each variable listed above

### Method 2: Firebase CLI

```bash
# Set environment variables using Firebase CLI
firebase apphosting:secrets:set FIREBASE_PRIVATE_KEY
firebase apphosting:secrets:set FIREBASE_CLIENT_EMAIL
firebase apphosting:secrets:set FIREBASE_PROJECT_ID
firebase apphosting:secrets:set POSTMARK_API_TOKEN

# For non-sensitive values, you can use environment variables
firebase apphosting:env:set NEXT_PUBLIC_FIREBASE_API_KEY="your-key"
firebase apphosting:env:set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-domain"
# ... repeat for all NEXT_PUBLIC_ variables
```

### Method 3: apphosting.yaml Configuration

Add environment variables to your `apphosting.yaml`:

```yaml
# apphosting.yaml
runConfig:
  maxInstances: 1

  # Environment variables (non-sensitive only)
  env:
    NEXT_PUBLIC_FIREBASE_API_KEY: 'your-key'
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'your-domain'
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'your-project-id'
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'your-bucket'
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'your-sender-id'
    NEXT_PUBLIC_FIREBASE_APP_ID: 'your-app-id'
    NEXT_PUBLIC_APP_URL: 'https://app.scenicdoors.co'
    NEXT_PUBLIC_BASE_URL: 'https://app.scenicdoors.co'
    NODE_ENV: 'production'
```

**Note**: Never commit sensitive values like `FIREBASE_PRIVATE_KEY` and `POSTMARK_API_TOKEN` to the `apphosting.yaml` file. Use Firebase secrets for those.

## Verification

After setting the environment variables:

1. **Redeploy your app** to Firebase App Hosting
2. **Check environment variables are set**:
   - Visit: `https://your-app-url/api/env-check`
   - Visit: `https://your-app-url/api/debug-firebase`
   - Visit: `https://your-app-url/api/admin-project`
3. **Test the leads API**:
   - Visit your homepage
   - Open browser console
   - Should see no 500 errors from `/api/quote/leads`
4. **Test product images**:
   - Visit the product selection page
   - Images should now display correctly

## Troubleshooting

### Still seeing 500 errors from leads API

1. Check Firebase Admin SDK logs:
   ```bash
   firebase apphosting:logs --tail
   ```
2. Look for errors like:
   - "firebase-admin initializeApp failed"
   - "Admin SDK not initialized"
   - "Firestore connection failed"

### Images still not showing

1. Clear your browser cache
2. Check the browser console for 404 errors
3. Verify the image files exist in `public/products/` directory
4. Ensure the build process copies the `public/` directory

### Private key formatting issues

If you see authentication errors, the `FIREBASE_PRIVATE_KEY` might be incorrectly formatted:

- The private key should contain literal `\n` characters (not actual newlines)
- Example: `"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"`
- In Firebase secrets, you may need to enter the key with actual newlines instead of `\n`

## Next Steps

1. Set all required environment variables in Firebase App Hosting
2. Redeploy the app
3. Verify images are showing
4. Verify no 500 errors in browser console
5. Test lead form submission to ensure it works correctly
