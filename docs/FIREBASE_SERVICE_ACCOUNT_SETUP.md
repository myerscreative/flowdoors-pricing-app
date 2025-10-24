# Firebase Service Account Setup

This guide walks you through getting your Firebase service account credentials for the Scenic Doors Pricing App.

## Why We Need This

The Marketing dashboard and other admin features use the Firebase Admin SDK to query Firestore from server-side API routes. This requires service account credentials for secure authentication.

## How to Get Your Service Account Key

### Step 1: Go to Firebase Console

1. Visit: https://console.firebase.google.com/
2. Select your project: **flowdoors-pricing-app**

### Step 2: Navigate to Service Accounts

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Click the **"Service accounts"** tab at the top

### Step 3: Generate New Private Key

1. Scroll down to the "Firebase Admin SDK" section
2. Click **"Generate new private key"**
3. Click **"Generate key"** in the confirmation dialog
4. A JSON file will download to your computer (e.g., `flowdoors-pricing-app-abc123.json`)

⚠️ **Keep this file secure!** It provides full admin access to your Firebase project.

### Step 4: Add to Environment Variables

#### For Local Development (.env.local):

1. Open the downloaded JSON file in a text editor
2. Copy the **ENTIRE contents** (all lines)
3. Create or open `.env.local` in the project root
4. Add the following line:

```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"flowdoors-pricing-app",...PASTE_ENTIRE_JSON_HERE...}'
```

**Important formatting rules:**

- Wrap the entire JSON in **single quotes** (`'`)
- Make it a **single line** (remove all line breaks from the JSON)
- Include the **entire JSON content** from the downloaded file

#### Example:

```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"flowdoors-pricing-app","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...","client_email":"firebase-adminsdk-xyz@flowdoors-pricing-app.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/..."}'
```

#### For Production (Vercel/Firebase Hosting):

**Vercel:**

1. Go to your project on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value:** The entire JSON contents (paste as-is, Vercel handles the formatting)
   - **Environment:** Production (or all environments)
4. Redeploy your application

**Firebase App Hosting:**

1. The service account is automatically available in App Hosting
2. No manual configuration needed for Firebase-hosted deployments

### Step 5: Restart Development Server

After adding the environment variable:

```bash
# Stop the server (Ctrl+C or Cmd+C)
# Then restart:
pnpm dev
```

### Step 6: Verify It Works

1. Visit the Marketing dashboard: http://localhost:3000/admin/marketing
2. Open the browser console (F12 or Cmd+Option+I)
3. Look for the success message:
   ```
   [Firebase Admin] Initialized with service account credentials
   ```
4. The Marketing dashboard should now display data without errors

## Security Notes

⚠️ **CRITICAL: NEVER commit the service account key to Git!**

**✅ DO:**

- Keep the key in `.env.local` (already in `.gitignore`)
- Add it as an environment variable in production hosting
- Rotate keys periodically (generate new ones, revoke old ones)
- Limit access to the Firebase Console

**❌ DON'T:**

- Put it directly in source code
- Commit it to version control (Git)
- Share it in public channels (Slack, email, etc.)
- Check it into `.env` files that might be committed

## Troubleshooting

### Error: "Could not load the default credentials"

**Solution:**

- Check that `FIREBASE_SERVICE_ACCOUNT_KEY` is set in `.env.local`
- Verify the JSON is valid using a JSON validator (https://jsonlint.com/)
- Make sure it's wrapped in single quotes
- Restart the dev server after adding the variable

### Error: "Invalid service account"

**Solution:**

- Ensure you downloaded the key from the correct Firebase project (`flowdoors-pricing-app`)
- Verify the `project_id` in the JSON matches your actual project
- Check that the JSON hasn't been truncated or corrupted

### Error: "Invalid FIREBASE_SERVICE_ACCOUNT_KEY format"

**Solution:**

- The JSON must be valid and contain all required fields
- Make sure you copied the **entire** JSON file contents
- Check for any missing quotes or brackets
- Remove any line breaks within the JSON string

### Still Not Working?

**Debug steps:**

1. Check the console logs for `[Firebase Admin]` messages
2. Verify the environment variable is loading:
   ```typescript
   console.log(
     'Has service account key:',
     !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY
   )
   ```
3. Test parsing the JSON manually:
   ```typescript
   try {
     JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}')
     console.log('JSON is valid')
   } catch (e) {
     console.error('JSON is invalid:', e)
   }
   ```

## Managing Multiple Environments

If you have separate Firebase projects for staging and production:

```bash
# .env.local (development)
FIREBASE_SERVICE_ACCOUNT_KEY='{"project_id":"flowdoors-pricing-app-dev",...}'

# .env.production (production - DO NOT COMMIT)
FIREBASE_SERVICE_ACCOUNT_KEY='{"project_id":"flowdoors-pricing-app",...}'
```

Set the appropriate variable in each hosting environment.

## Revoking/Rotating Keys

If a key is compromised or you need to rotate it:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click **"Manage service account permissions"** (opens Google Cloud Console)
3. Find the service account email
4. Click the three dots → **"Manage keys"**
5. Delete the old key
6. Generate a new key following the steps above
7. Update all environments with the new key

## Additional Resources

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
