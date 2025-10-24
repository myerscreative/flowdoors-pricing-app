# Password Reset Setup Complete ✅

## What Was Configured

### 1. Environment Variables Added to `.env.local`

The following Firebase credentials were added to enable password reset functionality:

```
FIREBASE_SERVICE_ACCOUNT_KEY='...'  # Admin SDK service account
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDzzpdpzRfM2n-TJYP2W_L2Q5DKq9Ix8pg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flowdoors-pricing-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=flowdoors-pricing-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flowdoors-pricing-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=593997843062
NEXT_PUBLIC_FIREBASE_APP_ID=1:593997843062:web:130eb085ae949b1df0ad57
```

## Password Reset Flow

### User Journey:

1. User visits `/forgot-password`
2. User enters their email address
3. System sends password reset email via Firebase
4. User clicks link in email (redirects to `/reset-password?mode=resetPassword&oobCode=...`)
5. User enters new password
6. System confirms password reset via Firebase REST API
7. User can now log in with new password

### API Endpoints:

1. **`POST /api/users/password-reset`**
   - Initiates password reset
   - Body: `{ email: string }`
   - Sends Firebase password reset email

2. **`POST /api/users/confirm-password-reset`**
   - Confirms password reset
   - Body: `{ oobCode: string, newPassword: string }`
   - Completes the password reset process

## How to Test

### Option 1: Via UI (Recommended)

1. Start the dev server:

   ```bash
   cd "/Users/robertmyers/Documents/Apps/ScenicDoors Pricing App/ScenicPricingApp-working"
   pnpm dev
   ```

2. Open browser and visit:
   - **Forgot Password Page:** http://localhost:3000/forgot-password
   - **Admin Login (with reset link):** http://localhost:3000/admin/login

3. Enter a valid email address registered in Firebase Auth

4. Check the email inbox for the password reset link

5. Click the link and enter a new password

### Option 2: Via Test Script

1. Start the dev server (if not already running):

   ```bash
   pnpm dev
   ```

2. Run the test script:
   ```bash
   node test-password-reset.js your-email@example.com
   ```

### Option 3: Via API Direct

```bash
# Test GET endpoint (health check)
curl http://localhost:3000/api/users/password-reset

# Send password reset email
curl -X POST http://localhost:3000/api/users/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

## Expected Responses

### Success Response:

```json
{
  "message": "Password reset email sent successfully. Check your inbox."
}
```

### Security Response (prevents email enumeration):

```json
{
  "message": "If an account with this email exists, a password reset email has been sent."
}
```

### Error Response:

```json
{
  "error": "Firebase API key not configured"
}
```

## Firebase Email Configuration

Password reset emails are sent by Firebase with:

- **From:** noreply@flowdoors-pricing-app.firebaseapp.com
- **Continue URL:** `${baseUrl}/admin/login`
- **Email Template:** Firebase's default password reset template

You can customize the email template in the Firebase Console under:
**Authentication** → **Templates** → **Password reset**

## Troubleshooting

### If password reset email doesn't arrive:

1. **Check Firebase Console** → Authentication → Users
   - Verify the email address exists
   - Check if email verification is required

2. **Check Spam/Junk folder**

3. **Check Firebase Console** → Authentication → Settings
   - Verify email provider is configured

4. **Check Server Logs**
   - Look for console.warn messages with password reset status

### If API returns "Firebase API key not configured":

1. Verify `.env.local` has `NEXT_PUBLIC_FIREBASE_API_KEY`
2. Restart the dev server to pick up new environment variables

### If "Invalid or expired reset code" error:

- Reset codes expire after 1 hour
- Request a new password reset email

## Security Features

✅ Prevents email enumeration attacks (same response for existing/non-existing emails)
✅ Uses Firebase's secure password reset flow
✅ Reset codes expire automatically
✅ HTTPS recommended for production
✅ Environment variables protected by `.gitignore`

## Production Deployment

For production, ensure:

1. `.env.local` or deployment platform env vars are configured
2. `NEXT_PUBLIC_APP_URL` is set to your production domain
3. Firebase Console → Authentication → Authorized domains includes your domain
4. Email template is customized with your branding

## Files Involved

- `/src/app/forgot-password/page.tsx` - Request reset UI
- `/src/app/reset-password/page.tsx` - Confirm reset UI
- `/src/app/admin/login/page.tsx` - Login with reset link
- `/src/app/api/users/password-reset/route.ts` - Request reset API
- `/src/app/api/users/confirm-password-reset/route.ts` - Confirm reset API
- `.env.local` - Environment configuration
- `test-password-reset.js` - Test script

---

**Status:** ✅ Ready to test
**Date:** 2025-10-13
