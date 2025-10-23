# Scenic Doors Sales Portal - User Creation Flow Setup

## Overview

This implementation provides a complete user creation flow with email verification and password setup for the Scenic Doors Sales Portal.

## Features Implemented

### 1. User Creation API (`/api/users/create`)

- Creates new users with temporary status
- Generates secure activation tokens
- Sends welcome emails automatically
- Integrates with Firebase Authentication

### 2. Email Notification System

- Professional welcome emails with Scenic Doors branding
- Secure activation links with 48-hour expiration
- Support contact information included
- Uses Resend email service (easily configurable)

### 3. Account Activation Flow

- Secure activation page (`/activate-account`)
- Password strength validation with real-time feedback
- Token expiration handling
- Automatic redirect to login after activation

### 4. Security Features

- Secure token generation using crypto
- Password strength requirements
- Input sanitization
- Token expiration (48 hours)
- Email verification required

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Email Service (Resend)
RESEND_API_KEY="your-resend-api-key"

# Application Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Firebase Configuration (if not already set)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

### 2. Email Service Setup

The system uses Resend for email delivery. To set up:

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add `RESEND_API_KEY` to your environment variables
4. Verify your domain (optional but recommended)

### 3. Firebase Configuration

Ensure your Firebase project has:

- Authentication enabled
- Firestore database configured
- Proper security rules

## How It Works

### 1. User Creation Process

1. Admin creates user in `/admin/users`
2. System generates temporary password and activation token
3. User account created with `pending_activation` status
4. Welcome email sent with activation link
5. User cannot login until account is activated

### 2. Account Activation Process

1. User clicks activation link in email
2. Redirected to `/activate-account` page
3. User sets new password (with strength validation)
4. Account status updated to `active`
5. User can now login with new credentials

### 3. Security Measures

- Activation tokens expire after 48 hours
- Passwords must meet strength requirements
- Email verification required before login
- Input sanitization prevents injection attacks

## API Endpoints

### POST `/api/users/create`

Creates a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "salesperson",
  "phone": "555-123-4567",
  "location_code": "SD",
  "prefix": "JD",
  "referralCodes": ["REF001", "REF002"],
  "zipcodes": ["12345", "67890"],
  "homeZip": "12345"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully. Welcome email sent.",
  "userId": "firebase-doc-id",
  "salesperson_id": "SP-ABC123",
  "status": "pending_activation"
}
```

### POST `/api/users/activate`

Activates a user account and sets password.

**Request Body:**

```json
{
  "token": "activation-token",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

## Database Schema Updates

The system adds these fields to the existing `salespeople` collection:

- `email_verified`: Boolean - Email verification status
- `activation_token`: String - Secure activation token
- `token_expires_at`: Date - Token expiration timestamp
- `account_status`: String - Account status (pending_activation, active, inactive)
- `temp_password`: String - Temporary password for initial setup

## Customization Options

### Email Templates

- Modify `src/lib/emailService.ts` to customize email content
- Update branding, colors, and messaging
- Add company logo and styling

### Password Requirements

- Adjust password strength rules in `src/lib/authUtils.ts`
- Modify `validatePasswordStrength` function
- Add or remove password criteria

### Token Expiration

- Change token expiration time in user creation API
- Default is 48 hours, can be adjusted as needed

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check RESEND_API_KEY is set correctly
   - Verify Resend account is active
   - Check email service logs

2. **Activation link not working**
   - Verify token hasn't expired
   - Check Firebase security rules
   - Ensure proper environment variables

3. **Password update failing**
   - Check Firebase Auth configuration
   - Verify user permissions
   - Check authentication state

### Support

For technical support or questions:

- Email: support@scenicdoors.co
- Check Firebase console for errors
- Review browser console for client-side issues

## Security Considerations

- All tokens are cryptographically secure
- Passwords are validated for strength
- Input is sanitized to prevent injection
- Tokens expire automatically
- Email verification required for access
- HTTPS recommended for production

## Future Enhancements

- Password reset functionality
- Two-factor authentication
- Audit logging for user actions
- Bulk user import
- Advanced role-based permissions
- Integration with SSO providers
