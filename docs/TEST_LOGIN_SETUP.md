# Test Admin Login Setup Guide

This guide explains how to create a test admin login for the Flowdoors Pricing App.

## Prerequisites

The application uses **Firebase Authentication** and **Firestore** for user management. You need to set up Firebase before creating test users.

## Step 1: Firebase Project Setup

### 1.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enable Firestore Database:
   - Go to **Build > Firestore Database**
   - Click "Create database"
   - Start in **test mode** for development
   - Choose a location close to you

### 1.2 Enable Firebase Authentication

1. Go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Click "Enable" and save

### 1.3 Get Firebase Credentials

#### For Client SDK (Frontend):

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app (name: "Flowdoors Pricing App")
5. Copy the Firebase configuration object

#### For Admin SDK (Backend):

1. Go to **Project Settings** > **Service accounts**
2. Click **Generate new private key**
3. Save the JSON file securely (DO NOT commit to git!)

## Step 2: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Firebase Client SDK (from Firebase Console > Project Settings > General)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123:web:abc123"

# Firebase Admin SDK (entire service account JSON as a single line)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email Configuration (optional for testing)
MARKETING_EMAIL=marketing@test.com
MANAGER_EMAIL=manager@test.com
DEFAULT_QUOTE_RECIPIENTS=admin@test.com

# Postmark Configuration (optional for testing)
POSTMARK_API_TOKEN=your-token-here
POSTMARK_WEBHOOK_SECRET=your-secret-here
```

**Note:** The `FIREBASE_SERVICE_ACCOUNT_KEY` should be the entire JSON file contents on a single line.

## Step 3: Create Test Admin User

Once Firebase is configured, run the admin creation script:

```bash
# Install dependencies (if not already installed)
pnpm install

# Create test admin with default credentials
pnpm run create-admin

# Or create with custom credentials
node_modules/.bin/tsx scripts/create-admin-login.ts admin@example.com MyPassword123! "Admin Name" "555-1234"
```

### Default Test Credentials

The script creates an admin user with these default credentials:

- **Email:** `admin@test.com`
- **Password:** `Admin123!`
- **Role:** `admin`
- **Name:** `Test Admin`

## Step 4: Login

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the admin login page:
   ```
   http://localhost:3000/admin/login
   ```

3. Login with the credentials:
   - Email: `admin@test.com`
   - Password: `Admin123!`

## Password Requirements

Passwords must meet these requirements:
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*(),.?":{}|<>)

## Troubleshooting

### "Firebase Admin not available" Error

**Cause:** Firebase service account credentials are not properly configured.

**Solution:**
1. Verify `.env.local` exists and contains `FIREBASE_SERVICE_ACCOUNT_KEY`
2. Ensure the JSON is properly formatted (use single quotes around the entire value)
3. Check that newlines in the private key are escaped as `\n`

### "User already exists" Error

**Cause:** A user with that email already exists in Firestore or Firebase Auth.

**Solution:**
1. Use a different email address
2. Or delete the existing user from Firebase Console:
   - Go to **Authentication > Users**
   - Find and delete the user
   - Go to **Firestore Database**
   - Delete the user document from `salespeople` collection

### Login Failed - "Invalid Credentials"

**Cause:**
- Password doesn't match
- User not properly activated
- Firebase Auth user not created

**Solution:**
1. Run the script again to ensure user is created in both Firestore and Firebase Auth
2. Check Firebase Console > Authentication to verify the user exists
3. Try resetting the password using the forgot password link

### "Cannot connect to Firebase"

**Cause:** Network issues or incorrect project configuration.

**Solution:**
1. Verify Firebase project ID matches in `.env.local`
2. Check Firebase project status in console
3. Ensure authentication is enabled

## Alternative: Using Existing Scripts

The repository includes other user management scripts:

### Fix Existing User Authentication
```bash
node_modules/.bin/tsx scripts/fixUserAuth.ts <email> [password]
```

### List All Users with Roles
```bash
node_modules/.bin/tsx scripts/listUsersWithRoles.ts
```

### Set User Role
```bash
node_modules/.bin/tsx scripts/setUserRole.ts <email> <role>
```

Available roles: `admin`, `manager`, `salesperson`, `marketing`

## Security Notes

1. **Never commit `.env.local` to git** - it contains sensitive credentials
2. **Use strong passwords** in production
3. **Enable Firebase security rules** for Firestore in production
4. **Rotate service account keys** periodically
5. **Use environment-specific credentials** (dev, staging, production)

## Next Steps

After creating your test admin:

1. Test the login flow
2. Verify admin dashboard access at `/admin`
3. Create additional test users with different roles
4. Set up proper Firebase security rules
5. Configure production environment variables

## Support

For issues or questions:
- Check Firebase Console for error messages
- Review browser console for client-side errors
- Check server logs for backend errors
- Refer to Firebase Authentication documentation: https://firebase.google.com/docs/auth
