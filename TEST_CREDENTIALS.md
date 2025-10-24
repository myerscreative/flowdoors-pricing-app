# Test Admin Login Credentials

## Quick Reference

Use these credentials to log into the admin panel after setting up Firebase.

### Default Admin Account

```
Email:    admin@test.com
Password: Admin123!
Role:     admin
```

### Login URL

```
http://localhost:3000/admin/login
```

## Setup Required

Before you can use these credentials, you need to:

1. **Set up Firebase** - See `docs/TEST_LOGIN_SETUP.md` for detailed instructions
2. **Configure `.env.local`** - Add Firebase credentials
3. **Run the creation script**:
   ```bash
   pnpm run create-admin
   ```

## Alternative Test Accounts

You can create additional test accounts with custom credentials:

```bash
# Create custom admin
node_modules/.bin/tsx scripts/create-admin-login.ts user@example.com SecurePass123! "User Name" "555-0000"

# Or use the existing test user script for multiple users
node scripts/create-test-user.js
```

### Predefined Test Users (from create-test-user.js)

```
Salesperson Account:
Email:    sales@scenicdoors.co
Password: TestPass123!
Role:     salesperson

Admin Account:
Email:    admin@scenicdoors.co
Password: TestPass123!
Role:     admin
```

## Password Requirements

All passwords must have:
- At least 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- 1 special character (!@#$%^&* etc.)

## Need Help?

See the complete setup guide: `docs/TEST_LOGIN_SETUP.md`
