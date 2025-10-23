# Environment Setup for Postmark Email Configuration

## Overview

The app now supports separate Postmark configurations for development and production environments to protect your production email reputation during testing.

## Environment Variables Setup

### Development (.env.local)

Create a `.env.local` file in the project root with these variables:

```bash
# Development Environment Variables
# This file is for local development only and should not be committed to git

# Postmark Configuration (Development)
# Use your development/sandbox Postmark server token here
POSTMARK_API_TOKEN_DEV=your_dev_postmark_token_here

# Postmark Webhook Secret for development
POSTMARK_WEBHOOK_SECRET=your_webhook_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Firebase Configuration (Development)
FIREBASE_SERVICE_ACCOUNT_KEY=your_dev_firebase_service_account_key_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-dev-firebase-project-id

# Other development-specific variables
NODE_ENV=development
```

### Production Environment

Configure these variables in your production environment (Vercel, Netlify, etc.):

```bash
# Production Environment Variables

# Postmark Configuration (Production)
# Use your production Postmark server token here
POSTMARK_API_TOKEN=your_prod_postmark_token_here

# Postmark Webhook Secret for production
POSTMARK_WEBHOOK_SECRET=your_webhook_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=https://app.scenicdoors.co
NEXT_PUBLIC_BASE_URL=https://app.scenicdoors.co

# Firebase Configuration (Production)
FIREBASE_SERVICE_ACCOUNT_KEY=your_prod_firebase_service_account_key_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=scenic-doors-quoter

# Production environment
NODE_ENV=production
```

## How It Works

### Environment Detection

The system automatically detects the environment using `process.env.NODE_ENV`:

- **Development**: `NODE_ENV !== 'production'` → uses `POSTMARK_API_TOKEN_DEV`
- **Production**: `NODE_ENV === 'production'` → uses `POSTMARK_API_TOKEN`

### Email Service Behavior

- **Development Mode**:
  - Uses `POSTMARK_API_TOKEN_DEV`
  - Shows warning: "⚠️ Using DEV Postmark server — all emails are test only"
  - Emails include "DEVELOPMENT ENVIRONMENT" badge
  - Safe for testing without affecting production reputation

- **Production Mode**:
  - Uses `POSTMARK_API_TOKEN`
  - Sends to real email addresses
  - No development warnings
  - Maintains production email reputation

### Test Email Page

The test email page at `/test-email` now shows:

- Current environment (DEVELOPMENT/PRODUCTION)
- Which token type is expected
- Token configuration status
- Environment-specific warnings

## Setup Steps

1. **Get Postmark Tokens**:
   - Production: Use your main Postmark server token
   - Development: Create a separate Postmark server for testing or use sandbox mode

2. **Configure Development**:

   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your development values
   ```

3. **Configure Production**:
   - Add `POSTMARK_API_TOKEN` to your production environment
   - Ensure `NODE_ENV=production` is set

4. **Test Configuration**:
   - Development: `pnpm dev` → visit http://localhost:3000/test-email
   - Production: Visit https://app.scenicdoors.co/test-email

## Benefits

✅ **Protected Production Reputation**: Development testing won't affect production email deliverability
✅ **Clear Environment Indication**: Easy to see which environment you're using
✅ **Automatic Token Selection**: No manual switching needed
✅ **Comprehensive Logging**: Detailed environment info in logs
✅ **Fail-Safe Design**: Missing tokens show clear error messages

## Troubleshooting

### "Postmark token not configured" Error

- Check that the correct environment variable is set:
  - Development: `POSTMARK_API_TOKEN_DEV`
  - Production: `POSTMARK_API_TOKEN`
- Verify the token is valid and not a placeholder value

### Environment Not Detected Correctly

- Check `NODE_ENV` is set correctly in your environment
- Development should be `development` or undefined
- Production must be exactly `production`

### Emails Not Sending in Development

- Verify `POSTMARK_API_TOKEN_DEV` is set in `.env.local`
- Check that your development Postmark server is active
- Ensure sender signature `sales@scenicdoors.co` is verified in Postmark
