# Deployment Guide: Vibepoint on Vercel

This guide walks you through deploying Vibepoint to Vercel with Supabase and Anthropic AI integration.

## Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account with this repository
- ✅ Vercel account ([sign up free](https://vercel.com/signup))
- ✅ Supabase project ([create free](https://supabase.com))
- ✅ Anthropic API key ([get key](https://console.anthropic.com/))
- ✅ App icons created (see `ICONS.md`)

## Step 1: Prepare Supabase

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New project"
3. Fill in:
   - **Name**: vibepoint
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Click "Create new project" (takes ~2 minutes)

### 1.2 Set Up Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Run the SQL files in this order:
   - `vibepoint/supabase-migration.sql` (Base schema)
   - `vibepoint/recipes-migration.sql` (Recipes Pro tier)

### 1.3 Configure Email Authentication
1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates (optional)

### 1.4 Get API Credentials
Go to Settings → API
Copy these values (you'll need them for Vercel):
- Project URL (e.g., `https://abcdefg.supabase.co`)
- Anon public key (starts with `eyJ...`)

## Step 2: Get Anthropic API Key
1. Go to console.anthropic.com
2. Sign up or log in
3. Go to API Keys
4. Click Create Key
5. Name it "vibepoint-production"
6. Copy the key (starts with `sk-ant-...`)

## Step 3: Deploy to Vercel

### 3.1 Import Repository
1. Go to vercel.com/new
2. Click Import Git Repository
3. Select your Vibepoint GitHub repository
4. Click Import

### 3.2 Configure Project
- **Framework Preset**: Next.js (should auto-detect)
- **Root Directory**: `vibepoint` (IMPORTANT: since your app is in a subdirectory)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

### 3.3 Add Environment Variables
Click Add Environment Variables and add these:

| Name | Value | Where to Get It |
|------|-------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase → Settings → API |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Anthropic Console → API Keys |

### 3.4 Deploy
Click Deploy. Wait 2-3 minutes for build to complete.

## Step 4: Post-Deployment Setup

### 4.1 Configure Supabase Redirect URLs
1. Go to Supabase → Authentication → URL Configuration
2. Add these URLs:
   - `https://your-app-name.vercel.app/*`
   - `https://your-app-name.vercel.app/auth/callback`

### 4.2 Test Core Functionality
Visit your deployed app and test:
- ✅ Landing page loads
- ✅ Sign up works
- ✅ Email confirmation
- ✅ Log mood entry
- ✅ View history
- ✅ View patterns
- ✅ AI insights
- ✅ Recipe generation

### 4.3 Test PWA Functionality
- **Mobile (iOS)**: Open in Safari, Tap Share → "Add to Home Screen"
- **Mobile (Android)**: Open in Chrome, Tap menu → "Add to Home Screen"

## Step 5: Monitoring & Maintenance

### 5.1 Monitor Anthropic Usage
- Go to Anthropic Console → Usage
- Monitor API calls and costs

### 5.2 Monitor Supabase
- Go to Supabase → Database → Usage
- Monitor database size and API requests

## Troubleshooting

### Issue: "Supabase client error: Invalid API key"
**Solution**: Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel settings.

### Issue: AI insights fail
**Solution**: Verify `ANTHROPIC_API_KEY` is set (no NEXT_PUBLIC prefix).

### Issue: Auth redirect fails
**Solution**: Add your Vercel URL to Supabase Redirect URLs.
