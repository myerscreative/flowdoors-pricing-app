# Email Functionality Fix - Deployment Guide

## Problem Fixed

The deployed app was experiencing email sending failures with the following errors:

- `Error sending email: Error: An error occurred in the Server Components render...`
- 500 errors from the summary page when attempting to email quotes
- Firebase environment variable warnings

## Root Cause

The issue was that client components were directly calling the `emailQuote` server action from `@/ai/flows/emailQuoteFlow`. In Next.js 15 production builds, server actions called from client components can have issues accessing environment variables (like `POSTMARK_API_TOKEN`), especially when those actions need to perform complex operations.

## Solution Applied

1. **Created new API route**: `/api/quotes/email-with-pdf/route.ts`
   - This route accepts email parameters directly (email, name, quoteId, pdfBase64)
   - Calls the `emailQuote` server action from server-side context
   - Properly handles environment variables
   - Logs email events to Firestore

2. **Updated client components** to use the API route instead:
   - `src/components/summary/QuoteActions.tsx`
   - `src/components/steps/StepQuoteSummary.tsx`
   - `src/components/steps/StepQuote-summary.tsx`

## Required Environment Variables for Production

### Critical: Postmark Email Service

```bash
# Production Postmark Server API Token
POSTMARK_API_TOKEN="your-production-postmark-server-api-token"

# Optional: Development Postmark Server API Token
POSTMARK_API_TOKEN_DEV="your-dev-postmark-server-api-token"
```

**How to get Postmark API Token:**

1. Log in to [Postmark](https://postmarkapp.com/)
2. Go to your Server
3. Click "API Tokens" tab
4. Copy the Server API token
5. Ensure your sender email (`quotes@scenicdoors.co`) is verified in Postmark:
   - Go to "Sender Signatures"
   - Add and verify `quotes@scenicdoors.co`

### Firebase Admin SDK (if not already set)

```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PROJECT_ID="flowdoors-pricing-app"
```

### Firebase Client SDK (public vars - if not already set)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyDzzpdpzRfM2n-TJYP2W_L2Q5DKq9Ix8pg"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="flowdoors-pricing-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="flowdoors-pricing-app"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="flowdoors-pricing-app.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="593997843062"
NEXT_PUBLIC_FIREBASE_APP_ID="1:593997843062:web:130eb085ae949b1df0ad57"
```

## Deployment Steps

### 1. Set Environment Variables in Firebase App Hosting

Using Firebase Console:

```bash
# Navigate to your Firebase project
# Go to App Hosting > Your App > Environment Variables
# Add the variables listed above
```

Using Firebase CLI:

```bash
# For sensitive values (use secrets)
firebase apphosting:secrets:set POSTMARK_API_TOKEN
firebase apphosting:secrets:set FIREBASE_PRIVATE_KEY
firebase apphosting:secrets:set FIREBASE_CLIENT_EMAIL

# For public values (use env vars)
firebase apphosting:env:set NEXT_PUBLIC_FIREBASE_API_KEY="your-key"
firebase apphosting:env:set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-domain"
# ... etc
```

### 2. Commit and Push Changes

```bash
cd "/Users/robertmyers/Documents/Apps/ScenicDoors Pricing App/ScenicPricingApp-working"
git add -A
git commit -m "Fix email functionality by using API routes instead of direct server actions

- Created /api/quotes/email-with-pdf route for reliable email sending
- Updated QuoteActions and StepQuoteSummary components to use API route
- Ensures proper environment variable access in production
- Fixes 500 errors on quote submission"
git push origin main
```

### 3. Deploy to Firebase App Hosting

The deployment will happen automatically via GitHub integration, or manually:

```bash
firebase deploy --only hosting
```

### 4. Verify the Fix

After deployment:

1. **Check environment variables are loaded:**
   - Visit: `https://your-app-url/api/dev-diag`
   - Verify `POSTMARK_API_TOKEN` is set (will show as "SET" not the actual value)

2. **Test quote submission flow:**
   - Go through the quote process
   - Fill in customer information with a real email
   - Click "Save & Email Quote"
   - Check browser console for:
     - No 500 errors
     - Success message: "Quote Emailed!"
     - Redirection to thank you page

3. **Check email delivery:**
   - Log in to Postmark
   - Go to "Activity" or "Messages"
   - Verify the email was sent successfully
   - Check your inbox for the quote email

4. **Verify Firestore logging:**
   - Open Firebase Console
   - Go to Firestore Database
   - Check `quotes/{quoteId}/emailEvents` collection
   - Verify email event was logged with status "sent"

## Troubleshooting

### Still seeing "Email Failed" errors

1. **Check Postmark token:**

   ```bash
   # Verify token is set correctly in Firebase
   firebase apphosting:secrets:get POSTMARK_API_TOKEN
   ```

2. **Check sender signature:**
   - Ensure `quotes@scenicdoors.co` is verified in Postmark
   - Go to Postmark > Sender Signatures
   - If not verified, add it and confirm via email

3. **Check API route logs:**

   ```bash
   # View recent logs
   firebase apphosting:logs --tail

   # Look for errors from /api/quotes/email-with-pdf
   ```

### Firebase environment variable warnings

If you see "⚠️ Firebase env vars not set, using fallback config":

- This is OK for client-side Firebase (the fallback config is correct)
- Only a problem if you see Firebase Admin SDK errors in server logs

### 500 errors persisting

1. Check that all files were deployed correctly
2. Verify the new API route exists: `/api/quotes/email-with-pdf/route.ts`
3. Check build logs for any compilation errors
4. Clear Next.js cache and rebuild:
   ```bash
   rm -rf .next
   pnpm build
   ```

## Files Changed

- ✅ `src/app/api/quotes/email-with-pdf/route.ts` (NEW)
- ✅ `src/components/summary/QuoteActions.tsx` (MODIFIED)
- ✅ `src/components/steps/StepQuoteSummary.tsx` (MODIFIED)
- ✅ `src/components/steps/StepQuote-summary.tsx` (MODIFIED)

## Technical Details

### Why This Fix Works

1. **Environment Variable Access**: API routes run in a Node.js server context where environment variables are always accessible via `process.env`

2. **Server Actions from Client Components**: While server actions can be called from client components, complex operations involving environment variables and external services (like email) are more reliable when handled through API routes

3. **Error Handling**: API routes provide better error handling and logging capabilities, making it easier to debug issues in production

4. **Consistency**: All email operations now go through a consistent API route pattern, matching the pattern used for quote notifications

### Architecture After Fix

```
Client Component (QuoteActions.tsx)
  ↓ fetch POST request
API Route (/api/quotes/email-with-pdf)
  ↓ calls
Server Action (emailQuote from emailQuoteFlow.ts)
  ↓ uses
Postmark SMTP (via nodemailer)
```

This architecture ensures reliable email delivery in production.
