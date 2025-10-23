# FlowDoors Firebase Setup Guide

This document outlines the steps to set up a new Firebase project for FlowDoors Pricing App.

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Google Cloud account with billing enabled
- Admin access to create Firebase projects

## Step 1: Create New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: `flowdoors-pricing-app` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Select or create Analytics account
6. Click "Create project"

## Step 2: Enable Required Services

### Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode**
4. Choose your region (e.g., `us-central1`)
5. Click "Enable"

### Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Click "Save"

### Firebase Storage (Optional)

1. Go to **Storage**
2. Click "Get started"
3. Use default security rules initially
4. Choose same region as Firestore

## Step 3: Register Web App

1. In Project Overview, click the **Web** icon (`</>`)
2. App nickname: `flowdoors-web-app`
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 4: Configure Environment Variables

Create/update `.env.local` with your Firebase credentials:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Application URLs
NEXT_PUBLIC_APP_URL=https://flowdoors.com
NEXT_PUBLIC_SITE_URL=https://flowdoors.com

# Email Configuration (Postmark)
POSTMARK_API_TOKEN=your_postmark_token
EMAIL_FROM=info@flowdoors.com

# Optional: Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

## Step 5: Set Up Firebase Admin Service Account

1. Go to **Project Settings** → **Service accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the following values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` escape sequences)

**Security Note**: Never commit the service account JSON or private key to git!

## Step 6: Deploy Firestore Rules and Indexes

```bash
# Login to Firebase
firebase login

# Select your project
firebase use your_project_id

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## Step 7: Create Initial Admin User

Run the setup script to create your first admin user:

```bash
# Option 1: Using Firebase Console
# Go to Authentication → Users → Add user
# Email: admin@flowdoors.com
# Password: (choose a secure password)

# Option 2: Using scripts (after project is set up)
pnpm tsx scripts/setUserRole.ts admin@flowdoors.com administrator
```

## Step 8: Set Custom Claims for Roles

After creating users, set their roles using custom claims:

```bash
# Set admin role
pnpm tsx scripts/setUserRole.ts user@example.com administrator

# Set salesperson role
pnpm tsx scripts/setUserRole.ts user@example.com salesperson

# Set marketing role
pnpm tsx scripts/setUserRole.ts user@example.com marketing
```

## Step 9: Configure Email Service (Postmark)

1. Sign up for [Postmark](https://postmarkapp.com/)
2. Add and verify your sending domain: `flowdoors.com`
3. Create sender signatures:
   - `info@flowdoors.com`
   - `support@flowdoors.com`
4. Get your Server API Token
5. Add to `.env.local`: `POSTMARK_API_TOKEN=your_token`

## Step 10: Initial Data Setup

### Create Firestore Collections

The app expects these collections:

- `quotes` - Customer quotes
- `leads` - Lead information
- `orders` - Order management
- `salespeople` - Sales rep information
- `settings` - App configuration
  - `notifications` - Email notification settings
  - `marketing` - Marketing attribution settings

### Seed Data (Optional)

If you want to test the dashboard with sample data:

```bash
# Create 2-3 sample quotes through the UI at:
# http://localhost:3000/quote/start
```

## Step 11: Test the Application

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Open browser
open http://localhost:3000
```

### Test Checklist

- [ ] Quote creation flow works
- [ ] PDF generation works
- [ ] Email sending works
- [ ] Admin login works
- [ ] Dashboard displays quotes
- [ ] Lead capture works

## Step 12: Production Deployment

### Vercel Deployment

1. Connect repository to [Vercel](https://vercel.com)
2. Add all environment variables from `.env.local`
3. Deploy

### Firebase Functions (Optional)

If using Cloud Functions:

```bash
# Deploy functions
firebase deploy --only functions
```

## Firestore Indexes

The required indexes are defined in `firestore.indexes.json`. They will be automatically created when you deploy, but you can also create them manually in the Firebase Console under **Firestore → Indexes**.

## Security Considerations

1. **Never commit** service account credentials
2. **Use environment variables** for all sensitive data
3. **Enable App Check** in production (Firebase Console → App Check)
4. **Set up backup** (Firestore → Backup)
5. **Monitor usage** to avoid unexpected bills
6. **Review security rules** regularly

## Troubleshooting

### Authentication Issues

- Verify environment variables are correct
- Check Firebase Console → Authentication for user status
- Ensure custom claims are set correctly

### Database Permission Errors

- Verify Firestore rules are deployed
- Check user has proper role assigned
- Look at Firestore Rules logs in Console

### Email Not Sending

- Verify Postmark domain is verified
- Check sender signatures are created
- Review Postmark activity logs
- Ensure `POSTMARK_API_TOKEN` is set

## Support

For FlowDoors-specific issues, contact: support@flowdoors.com

For Firebase issues, see: https://firebase.google.com/support

## Next Steps

1. Set up custom domain (flowdoors.com)
2. Configure Google Analytics
3. Set up monitoring and alerts
4. Create backup strategy
5. Document operational procedures
