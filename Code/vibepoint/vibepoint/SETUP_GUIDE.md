# VibePoint Supabase Setup Guide

Follow these steps to set up your Supabase database for VibePoint.

## Step 1: Run the Database Migration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `supabase-migration.sql` in this directory
6. Copy the **entire contents** of the file
7. Paste it into the SQL Editor
8. Click **Run** (or press Cmd/Ctrl + Enter)

✅ You should see "Success. No rows returned" - this means it worked!

## Step 2: Verify Tables Were Created

1. In Supabase Dashboard, click **Table Editor** in the left sidebar
2. You should see these tables:
   - `mood_entries`
   - `patterns`
   - `user_profiles`

If you see all three tables, you're good to go! ✅

## Step 3: Get Your API Keys

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long JWT token)

## Step 4: Set Up Environment Variables

1. In your project root (`/vibepoint`), create or edit `.env.local`
2. Add these lines (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

## Step 5: Create a Dev User Account

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Fill in:
   - **Email**: `dev@vibepoint.local`
   - **Password**: `dev123456`
   - **Auto-confirm**: ✅ **ON** (important!)
4. Click **Create user**

## Step 6: Test It Out

1. Make sure your dev server is running:
   ```bash
   cd vibepoint
   npm run dev
   ```

2. Go to `http://localhost:3000/auth/login`
3. Click the **🚀 Dev Sign-In** button
4. You should be logged in and redirected to `/home`

## Troubleshooting

### "Tables already exist" error
- This is fine! The migration uses `IF NOT EXISTS` so it's safe to run multiple times.

### "Policy already exists" error
- The migration drops existing policies first, so this shouldn't happen. If it does, you can ignore it.

### Can't log in with dev account
- Make sure you set **Auto-confirm: ON** when creating the user
- Check that the email is exactly: `dev@vibepoint.local`

### Environment variables not working
- Make sure the file is named `.env.local` (not `.env`)
- Restart your dev server after adding/changing env vars
- Check that there are no spaces around the `=` sign

## What Gets Created

### Tables
- **mood_entries**: Stores all mood log entries
- **patterns**: Caches pattern analysis results
- **user_profiles**: Optional user profile data

### Security
- **Row Level Security (RLS)**: Enabled on all tables
- **Policies**: Users can only access their own data

### Indexes
- Optimized queries for user_id and timestamp lookups

## Next Steps

Once everything is set up:
- ✅ You can log in with the dev account
- ✅ You can create mood entries
- ✅ You can view your entries history
- ✅ The heat map will work once you have entries

Happy coding! 🎉


