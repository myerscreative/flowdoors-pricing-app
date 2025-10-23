# Quick Password Reset Test

Since the automated server start is having issues, here's how to test manually:

## Step 1: Start the Dev Server

In your terminal, run:

```bash
cd "/Users/robertmyers/Documents/Apps/ScenicDoors Pricing App/ScenicPricingApp-working"
pnpm dev
```

Wait for the message: `✓ Ready in X ms` and `○ Local: http://localhost:3000`

## Step 2: Test the API

Once the server is running, in a **new terminal** tab/window, run:

```bash
# Test 1: Health check
curl http://localhost:3000/api/users/password-reset

# Expected: {"ok":true,"hint":"POST { email }"}
```

## Step 3: Test Password Reset with Real Email

Replace `your-email@example.com` with a real email that exists in your Firebase Auth:

```bash
cd "/Users/robertmyers/Documents/Apps/ScenicDoors Pricing App/ScenicPricingApp-working"
node test-password-reset.js your-email@example.com
```

Or use curl:

```bash
curl -X POST http://localhost:3000/api/users/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

## Step 4: Test via Browser UI

1. Open: http://localhost:3000/forgot-password
2. Enter email address
3. Click "Send Reset Link"
4. Check email inbox
5. Click the reset link
6. Enter new password

## Expected Results

### Success Response:

```json
{
  "message": "Password reset email sent successfully. Check your inbox."
}
```

### If email doesn't exist (security response):

```json
{
  "message": "If an account with this email exists, a password reset email has been sent."
}
```

## Troubleshooting

If you get "Connection refused":

- Make sure `pnpm dev` is running
- Check that you see `Ready` in the console
- Verify port 3000 is free: `lsof -i :3000`

If you get "Firebase API key not configured":

- Check `.env.local` exists
- Restart the dev server after adding env vars
