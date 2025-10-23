# FlowDoors Deployment Guide

## Overview

This guide covers deploying the FlowDoors Pricing App to production. The app is designed to be deployed on Vercel with Firebase backend services.

## Prerequisites

- [x] Firebase project created and configured (see `FLOWDOORS_FIREBASE_SETUP.md`)
- [x] Vercel account with appropriate permissions
- [x] Custom domain `flowdoors.com` configured
- [x] Postmark account for email services
- [x] Environment variables documented

## Deployment Platforms

### Primary: Vercel (Recommended)

#### Initial Setup

1. **Connect Repository**

   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Login
   vercel login

   # Link project
   vercel link
   ```

2. **Configure Environment Variables**

   Add all variables from `.env.local` in Vercel Dashboard:
   - Project Settings → Environment Variables
   - Add production, preview, and development values

   Required variables:
   - `NEXT_PUBLIC_FIREBASE_*` (all Firebase config)
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
   - `POSTMARK_API_TOKEN`
   - `EMAIL_FROM`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - `NEXT_PUBLIC_GTM_ID`

3. **Deploy**

   ```bash
   # Deploy to preview
   vercel

   # Deploy to production
   vercel --prod
   ```

#### Custom Domain Setup

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add `flowdoors.com` and `www.flowdoors.com`
3. Configure DNS records as instructed by Vercel
4. Wait for SSL certificate provisioning (automatic)

### Alternative: Firebase Hosting

```bash
# Build the app
pnpm build

# Deploy to Firebase
firebase deploy --only hosting
```

## Environment Configuration

### Production Environment Variables

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=production_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flowdoors-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=flowdoors-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flowdoors-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=production_id
NEXT_PUBLIC_FIREBASE_APP_ID=production_app_id

# Firebase Admin
FIREBASE_PROJECT_ID=flowdoors-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@flowdoors-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Application
NEXT_PUBLIC_APP_URL=https://flowdoors.com
NEXT_PUBLIC_SITE_URL=https://flowdoors.com

# Email
POSTMARK_API_TOKEN=production_token
EMAIL_FROM=info@flowdoors.com

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-PRODUCTION
NEXT_PUBLIC_GTM_ID=GTM-PRODUCTION
```

### Staging Environment

Create a staging Firebase project and Vercel preview deployment for testing.

## Post-Deployment Checklist

### Immediate (Day 1)

- [ ] Verify homepage loads (`https://flowdoors.com`)
- [ ] Test quote flow end-to-end
- [ ] Verify PDF generation works
- [ ] Test email delivery (quotes, notifications)
- [ ] Confirm admin login works
- [ ] Check analytics tracking
- [ ] Verify all API endpoints respond
- [ ] Test mobile responsiveness

### Week 1

- [ ] Monitor error logs (Vercel Dashboard → Logs)
- [ ] Check Firestore usage and performance
- [ ] Review email delivery metrics (Postmark)
- [ ] Test all user roles (admin, salesperson, marketing)
- [ ] Verify backups are running
- [ ] Check SSL certificate is active
- [ ] Test form submissions
- [ ] Review Google Analytics data

### Ongoing

- [ ] Monitor Firebase billing
- [ ] Review Vercel usage
- [ ] Check uptime (use UptimeRobot or similar)
- [ ] Review security rules
- [ ] Update dependencies monthly
- [ ] Backup Firestore data weekly

## Firebase Services Deployment

### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

### Deploy Cloud Functions (if applicable)

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## DNS Configuration

### Vercel DNS Setup

If using Vercel for domain management:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### If using external DNS:

```
Type    Name    Value
CNAME   @       cname.vercel-dns.com
CNAME   www     cname.vercel-dns.com
```

## SSL/TLS Configuration

Vercel handles SSL automatically:

- Automatic certificate provisioning
- Auto-renewal
- HTTP to HTTPS redirect (configure in vercel.json)

## Performance Optimization

### Vercel Settings

1. Enable Edge Functions for API routes
2. Configure caching headers
3. Enable Image Optimization
4. Set up Analytics

### Firebase Optimization

1. Create composite indexes for frequent queries
2. Enable Firestore caching
3. Optimize security rules for read performance
4. Use Cloud CDN for static assets

## Monitoring & Alerts

### Vercel Monitoring

1. Enable Vercel Analytics
2. Set up deployment notifications (Slack, email)
3. Configure error alerts

### Firebase Monitoring

1. Enable Firebase Performance Monitoring
2. Set up budget alerts in Google Cloud Console
3. Configure Crashlytics (if using native apps)

### External Monitoring

Recommended tools:

- **Uptime**: UptimeRobot, Pingdom
- **Performance**: Google Lighthouse, WebPageTest
- **Errors**: Sentry (optional)
- **Analytics**: Google Analytics 4, Mixpanel

## Rollback Procedure

### Vercel Rollback

1. Go to Vercel Dashboard → Deployments
2. Find previous stable deployment
3. Click three dots → Promote to Production

```bash
# Or via CLI
vercel rollback
```

### Firebase Rollback

```bash
# Rollback Firestore rules
firebase deploy --only firestore:rules --version previous

# Rollback functions
firebase deploy --only functions --version previous
```

## Backup Strategy

### Firestore Backup

1. Set up automated backups in Firebase Console
2. Export to Cloud Storage weekly
3. Test restore procedure quarterly

```bash
# Manual export
gcloud firestore export gs://flowdoors-backups/$(date +%Y%m%d)
```

### Code Backup

- Primary: GitHub repository
- Automated deployments via CI/CD

## Security Considerations

1. **Environment Variables**: Never commit to repository
2. **API Keys**: Rotate quarterly
3. **Firebase Rules**: Review monthly
4. **Dependencies**: Update security patches immediately
5. **Admin Access**: Use MFA for all admin accounts
6. **Logs**: Monitor for suspicious activity

## Troubleshooting

### Build Failures

```bash
# Check build logs
vercel logs

# Test build locally
pnpm build

# Clear cache and rebuild
vercel --force
```

### Runtime Errors

1. Check Vercel function logs
2. Review Firebase usage limits
3. Verify environment variables
4. Check API rate limits (Postmark, etc.)

### Performance Issues

1. Review Vercel Analytics
2. Check Firebase query performance
3. Optimize images and assets
4. Enable caching where appropriate

## Cost Estimates

### Vercel

- **Free tier**: $0/month (hobby projects)
- **Pro tier**: $20/month (recommended for production)

### Firebase

- **Spark Plan (Free)**:
  - 50K reads/day
  - 20K writes/day
  - 20K deletes/day
- **Blaze Plan (Pay as you go)**:
  - $0.06 per 100K reads
  - $0.18 per 100K writes
  - ~$25-100/month estimated for moderate traffic

### Postmark

- **Free tier**: 100 emails/month
- **Paid**: $15/month for 10,000 emails

### Total Estimated Cost

- **Development**: $0/month (using free tiers)
- **Production (low traffic)**: $50-100/month
- **Production (moderate traffic)**: $100-300/month

## Support & Resources

- **FlowDoors Support**: support@flowdoors.com
- **Vercel Docs**: https://vercel.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## Next Steps

1. Set up staging environment
2. Configure CI/CD pipeline
3. Implement monitoring dashboards
4. Document incident response procedures
5. Schedule regular security audits
