# FlowDoors Pricing App - Vercel Deployment Guide

This guide walks you through deploying the FlowDoors pricing application to Vercel.

## Prerequisites

- GitHub repository with your code
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Firebase project with credentials
- Postmark account for email services

## Quick Start

### 1. Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Select your `flowdoors-pricing-app` repository
4. Click "Import"

### 2. Configure Project Settings

Vercel will auto-detect Next.js. Ensure these settings:

- **Framework Preset**: Next.js
- **Build Command**: `pnpm run build`
- **Install Command**: `pnpm install`
- **Output Directory**: `.next`
- **Node Version**: 18.x or higher

### 3. Set Up PostgreSQL Database

#### Option A: Vercel Postgres (Recommended)

1. In your Vercel project dashboard, go to the **Storage** tab
2. Click **Create Database** > **Postgres**
3. Select a database name (e.g., `flowdoors-db`)
4. Choose your region (preferably same as deployment region)
5. Click **Create**

Vercel will automatically add `POSTGRES_PRISMA_URL` to your environment variables.

#### Option B: External PostgreSQL (Neon, Supabase, etc.)

If using an external provider:
1. Create a PostgreSQL database
2. Get the connection string
3. Add as `POSTGRES_PRISMA_URL` in environment variables

### 4. Configure Environment Variables

In your Vercel project dashboard, go to **Settings** > **Environment Variables**.

Add these variables for **Production**, **Preview**, and **Development**:

#### Required Variables

```
POSTGRES_PRISMA_URL=postgresql://[your-connection-string]
```

#### Optional (Data Mode)

```
NEXT_PUBLIC_DATA_MODE=live
```
Leave empty or set to `mock` for mock data mode.

#### Firebase Configuration

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important**: For `FIREBASE_PRIVATE_KEY`, ensure the value includes literal `\n` characters, wrapped in quotes.

#### Email Configuration

```
MARKETING_EMAIL=marketing@scenicdoors.co
MANAGER_EMAIL=manager@scenicdoors.co
DEFAULT_QUOTE_RECIPIENTS=zach@scenicdoors.co,brody@scenicdoors.co
```

#### Postmark Configuration

```
POSTMARK_API_TOKEN=your-postmark-server-token
POSTMARK_WEBHOOK_SECRET=your-webhook-secret
```

### 5. Initialize Database

After the first deployment, you need to run Prisma migrations:

#### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link your project
vercel link

# Run migration in production
vercel env pull .env.production
pnpm prisma migrate deploy
```

#### Using Prisma Data Platform (Alternative)

1. Go to [cloud.prisma.io](https://cloud.prisma.io)
2. Connect your database
3. Run migrations through the dashboard

### 6. Deploy

1. Push your code to GitHub
2. Vercel will automatically deploy on every push to `main` branch
3. Preview deployments are created for pull requests

## Post-Deployment

### Verify Deployment

1. Check your deployment URL (e.g., `flowdoors-pricing-app.vercel.app`)
2. Test authentication flows
3. Verify database connectivity
4. Test email sending functionality

### Custom Domain (Optional)

1. Go to **Settings** > **Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel

### Monitoring

- View logs: **Deployments** > Select deployment > **Logs**
- Check analytics: **Analytics** tab
- Monitor performance: **Speed Insights** tab

## Database Migrations

When you make schema changes:

```bash
# 1. Update schema.prisma locally
# 2. Create migration
pnpm prisma migrate dev --name your_migration_name

# 3. Push to GitHub (Vercel auto-deploys)
git add prisma/migrations
git commit -m "Add migration: your_migration_name"
git push

# 4. Apply migration to production
vercel env pull .env.production
pnpm prisma migrate deploy
```

## Troubleshooting

### Build Failures

**Out of Memory Errors:**
- Already configured with `NODE_OPTIONS=--max-old-space-size=8192` in `vercel.json`

**pnpm Issues:**
- Vercel supports pnpm natively, version specified in `package.json`

### Database Connection Issues

**Prisma Client Not Generated:**
```bash
# The postinstall script should handle this automatically
# If issues persist, ensure prisma:generate runs during build
```

**Connection Timeout:**
- Check `POSTGRES_PRISMA_URL` is correctly set
- Verify database is accessible from Vercel's region

### Environment Variable Issues

**Variables Not Loading:**
- Ensure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding new environment variables

### Firebase Issues

**Authentication Failing:**
- Verify `FIREBASE_PRIVATE_KEY` has proper `\n` escape sequences
- Check Firebase project settings allow your domain

## Performance Optimization

Already configured:
- Edge regions for low latency
- Automatic CDN caching
- Optimized Next.js builds
- Image optimization via Next.js

## Security Considerations

- Never commit `.env` files
- Use Vercel environment variables for secrets
- Enable Vercel firewall in project settings (optional)
- Set up allowed domains in Firebase console

## GitHub Integration

Vercel automatically:
- Deploys production on pushes to `main`
- Creates preview deployments for pull requests
- Adds deployment status to PRs

## Continuous Integration

The project includes:
- Pre-commit hooks (typecheck)
- Build verification on deploy
- Automatic Prisma client generation

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

## Rollback

If a deployment has issues:

1. Go to **Deployments**
2. Find a working deployment
3. Click **...** > **Promote to Production**

---

**Need Help?** Check the Vercel dashboard logs or contact your team administrator.
