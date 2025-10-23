# FlowDoors Deployment Checklist

## Pre-Deployment

### Code & Configuration

- [ ] All tests passing (`pnpm test`)
- [ ] TypeScript checks clean (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Production build succeeds (`pnpm build`)
- [ ] Environment variables documented
- [ ] `.env.example` updated with all required vars
- [ ] Git repository clean (no uncommitted changes)
- [ ] All Scenic references updated to FlowDoors
- [ ] Logo updated to FlowDoors branding

### Firebase Setup

- [ ] New Firebase project created
- [ ] Firestore database enabled (production mode)
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] Service account created and keys secured
- [ ] Initial admin user created
- [ ] User roles configured (custom claims)

### Email Configuration

- [ ] Postmark account created
- [ ] Domain verified (`flowdoors.com`)
- [ ] Sender signatures created:
  - [ ] info@flowdoors.com
  - [ ] support@flowdoors.com
- [ ] API token generated and stored securely
- [ ] Test email sent successfully

### Domain & Hosting

- [ ] Domain registered: `flowdoors.com`
- [ ] DNS configured
- [ ] SSL certificate provisioned
- [ ] Vercel project created
- [ ] Repository connected to Vercel
- [ ] Environment variables added to Vercel

## Deployment

### Initial Deploy

- [ ] Deploy to staging/preview first
- [ ] Smoke test staging environment
- [ ] Deploy to production
- [ ] Verify production deployment

### Post-Deploy Verification

- [ ] Homepage loads correctly
- [ ] All pages accessible
- [ ] Quote flow works end-to-end
- [ ] PDF generation works
- [ ] Emails send successfully
- [ ] Admin login functional
- [ ] Dashboard displays correctly
- [ ] Mobile responsiveness verified

## Week 1 Monitoring

### Functionality

- [ ] Monitor error rates
- [ ] Check email delivery metrics
- [ ] Review user feedback
- [ ] Test all user roles
- [ ] Verify analytics tracking

### Performance

- [ ] Check page load times
- [ ] Monitor API response times
- [ ] Review Firestore query performance
- [ ] Verify CDN/caching effectiveness

### Security

- [ ] Review access logs
- [ ] Check authentication flows
- [ ] Verify Firestore security rules
- [ ] Test authorization for different roles

## Ongoing Maintenance

### Weekly

- [ ] Review error logs
- [ ] Check email delivery rates
- [ ] Monitor Firebase usage
- [ ] Review analytics data

### Monthly

- [ ] Update dependencies
- [ ] Review security rules
- [ ] Check backup completion
- [ ] Audit user access
- [ ] Review costs vs budget

### Quarterly

- [ ] Rotate API keys
- [ ] Security audit
- [ ] Performance review
- [ ] Test disaster recovery
- [ ] Review and update documentation

## Rollback Plan

If issues arise:

1. **Identify Issue**
   - Check Vercel logs
   - Review Firebase logs
   - Check error monitoring

2. **Quick Fix or Rollback?**
   - If quick fix possible: deploy hotfix
   - If critical issue: rollback immediately

3. **Rollback Steps**

   ```bash
   # Vercel rollback
   vercel rollback

   # Or via dashboard: Deployments → Previous → Promote
   ```

4. **Post-Rollback**
   - Verify app functionality restored
   - Communicate status to stakeholders
   - Create incident report
   - Plan proper fix

## Emergency Contacts

- **Firebase Issues**: Firebase Support Console
- **Vercel Issues**: Vercel Support
- **Email Issues**: Postmark Support
- **Domain Issues**: Domain registrar support

## Success Criteria

Deployment is considered successful when:

- [ ] Zero critical errors in first 24 hours
- [ ] 99.9%+ uptime
- [ ] All user flows functional
- [ ] Email delivery rate >95%
- [ ] Response times <2s for 95th percentile
- [ ] No security incidents
- [ ] Positive user feedback

## Notes

- Keep this checklist updated as processes evolve
- Document any issues encountered for future reference
- Share lessons learned with team
- Celebrate successful deployment! 🎉
