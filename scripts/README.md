# Firebase User Role Management Scripts

This directory contains scripts for managing Firebase user roles and permissions.

## Prerequisites

1. **Firebase Service Account**: You need a Firebase service account with Admin SDK permissions
2. **Environment Variables**: The scripts use the existing `FIREBASE_SERVICE_ACCOUNT_KEY` variable in your `.env.local` file.

Your `.env.local` should contain:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"flowdoors-pricing-app","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"firebase-adminsdk-xxxxx@flowdoors-pricing-app.iam.gserviceaccount.com",...}
```

### Getting Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Copy the entire JSON content as a single line string to `FIREBASE_SERVICE_ACCOUNT_KEY`

## Scripts

### 1. Fix User Authentication (`fixUserAuth.ts`)

**NEW!** Fixes login and password reset issues by syncing Firestore and Firebase Auth.

**Usage:**

```bash
# Generate a random password for the user
pnpm tsx scripts/fixUserAuth.ts robert@scenicdoors.com

# Set a specific password
pnpm tsx scripts/fixUserAuth.ts robert@scenicdoors.com "SecurePass123!"
```

**What it does:**

1. Checks if user exists in Firestore (`salespeople` collection)
2. Checks if user exists in Firebase Authentication
3. Creates or updates the Firebase Auth user
4. Sets correct role claims for access control
5. Activates the account and enables email verification
6. Updates Firestore with the correct status

**When to use:**

- User can't log in (even with correct password)
- Password reset not working
- "Role claims are not set yet" error
- User exists in Firestore but not in Firebase Auth
- Account was created but never activated properly

**Note:** Requires `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env.local`

### 2. Set User Role (`setUserRole.ts`)

Assigns a role to a Firebase user via custom claims.

**Usage:**

```bash
# Using pnpm script (recommended)
pnpm set-role user@example.com marketing

# Or directly with tsx
pnpm tsx scripts/setUserRole.ts user@example.com marketing
```

**Arguments:**

- `email` (required): User's email address
- `role` (optional): Role to assign (defaults to "marketing")

**Valid Roles:**

- `marketing` - Access to marketing dashboard only
- `manager` - Access to admin dashboard and user management
- `administrator` - Full admin access
- `salesperson` - Access to sales dashboard and own quotes

**Examples:**

```bash
# Assign marketing role
pnpm set-role john@example.com marketing

# Assign manager role
pnpm set-role jane@example.com manager

# Assign administrator role
pnpm set-role admin@example.com administrator
```

### 3. List Users with Roles (`listUsersWithRoles.ts`)

Audits all Firebase users and their assigned roles.

**Usage:**

```bash
# Using pnpm script (recommended)
pnpm list-users

# Or directly with tsx
pnpm tsx scripts/listUsersWithRoles.ts
```

**Output:**

- Total user count
- Role summary (count per role)
- Detailed user list grouped by role
- Users without roles (with instructions to assign roles)

### 4. Diagnose User Status (API Endpoint)

Check user authentication status via HTTP endpoint:

```bash
# Start dev server first
pnpm dev

# In another terminal, diagnose a user
curl "http://localhost:3000/api/users/diagnose?email=robert@scenicdoors.com"

# Or visit in browser
http://localhost:3000/api/users/diagnose?email=robert@scenicdoors.com
```

**Output:**

- Firestore status and data
- Firebase Auth status and data
- Specific recommendations to fix issues
- Summary of what needs to be done

### 5. Clean Up Incomplete Leads (`cleanupIncompleteLeads.js`)

Removes incomplete lead records from Firestore that are missing required fields (name, email, and phone).

**Usage:**

```bash
# Run directly
node scripts/cleanupIncompleteLeads.js
```

**What it does:**

1. Fetches all leads from Firestore
2. Identifies leads missing name, email, or phone
3. Displays a list of incomplete leads to be removed
4. Waits 5 seconds for confirmation (Ctrl+C to cancel)
5. Deletes incomplete leads in batches

**Output:**

- Total leads count
- List of incomplete leads with missing fields
- Deletion confirmation with 5-second countdown
- Progress updates during deletion
- Final summary of deleted and remaining leads

**Note:** This script is safe to run multiple times. It only removes leads that don't have all three required fields (name, email, phone).

## Role-Based Access Control (RBAC)

### Marketing Dashboard (`/marketing`)

- **Access**: `marketing`, `manager`, `administrator`
- **Features**: View aggregated attribution data, no PII access

### Admin Dashboard (`/admin`)

- **Access**: `manager`, `administrator`
- **Features**: Full admin access, user management, all quotes

### Sales Dashboard (`/sales`)

- **Access**: `salesperson`, `manager`, `administrator`
- **Features**: View own quotes, limited admin access

## Troubleshooting

### Common Issues

1. **"User not found" error**
   - Ensure the user has signed up at least once through the app
   - Check the email address is correct

2. **"Missing environment variables" error**
   - Verify `.env.local` file exists and contains all required variables
   - Check that the private key is properly formatted with `\n` for newlines

3. **"Invalid role" error**
   - Use one of the valid roles: `marketing`, `manager`, `administrator`, `salesperson`

4. **Firebase Admin SDK initialization error**
   - Verify your service account credentials are correct
   - Ensure the service account has the necessary permissions

### Testing the Setup

1. **Test environment variables:**

   ```bash
   pnpm list-users
   ```

   This should show all users without errors.

2. **Test role assignment:**

   ```bash
   pnpm set-role test@example.com marketing
   ```

3. **Test marketing dashboard:**
   - Log in as the user with marketing role
   - Visit `/marketing` - should show the dashboard
   - Visit `/admin` - should redirect to `/sales` or `/admin/login`

## Security Notes

- Keep your `.env.local` file secure and never commit it to version control
- The service account has admin privileges - protect the credentials
- Only assign roles to trusted users
- Regularly audit user roles using the `list-users` script
