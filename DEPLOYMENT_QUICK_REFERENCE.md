# Deployment Quick Reference Card

Quick commands and checklist for deploying NyumbaSync Tenant Portal.

## 🚀 Quick Deploy Commands

### Check Configuration
```bash
npm run check:env
```

### Build for Production
```bash
# Linux/Mac
./scripts/deploy-production.sh

# Windows
scripts\deploy-production.bat

# Or manually
npm run build:production
```

### Test Locally
```bash
npm run preview
```

### Deploy to Hosting
```bash
# AWS S3
aws s3 sync docs/ s3://your-bucket --delete

# Netlify
netlify deploy --prod --dir=docs

# Vercel
vercel --prod
```

## 📋 Pre-Deployment Checklist

### Environment
- [ ] `.env.production` configured
- [ ] All placeholders replaced
- [ ] `npm run check:env` passes

### Testing
- [ ] `npm run test` passes
- [ ] `npm run lint` passes
- [ ] Local preview works

### Services
- [ ] API server running
- [ ] WebSocket server running
- [ ] Payment gateways configured
- [ ] File storage configured
- [ ] Sentry configured (optional)

### Security
- [ ] SSL certificate valid
- [ ] HTTPS enforced
- [ ] Credentials not in git

## 🔧 Required Environment Variables

```env
# Critical
VITE_API_URL=https://api.nyumbasync.com
VITE_SOCKET_URL=https://api.nyumbasync.com

# Payment (at least one)
VITE_MPESA_CONSUMER_KEY=...
VITE_STRIPE_PUBLIC_KEY=...

# Storage
VITE_FILE_STORAGE_URL=...
VITE_CLOUDINARY_CLOUD_NAME=...

# Monitoring (recommended)
VITE_SENTRY_DSN=...
VITE_GOOGLE_ANALYTICS_ID=...
```

## 🔍 Post-Deployment Checks

### Immediate (0-1 hour)
- [ ] Site loads without errors
- [ ] Login works
- [ ] Dashboard displays
- [ ] No console errors
- [ ] Mobile responsive

### First Day (1-24 hours)
- [ ] Payment test successful
- [ ] File upload works
- [ ] WebSocket connects
- [ ] Sentry receiving errors
- [ ] Analytics tracking

### First Week
- [ ] Error rate < 1%
- [ ] Performance good
- [ ] No critical issues
- [ ] User feedback positive

## 🆘 Emergency Commands

### Rollback
```bash
# Redeploy previous version
aws s3 sync s3://backup-bucket/ s3://production-bucket/ --delete
```

### Check Logs
```bash
# Sentry dashboard
https://sentry.io/organizations/your-org/issues/

# Server logs
ssh user@server "tail -f /var/log/app.log"
```

### Clear Cache
```bash
# CloudFront
aws cloudfront create-invalidation --distribution-id ID --paths "/*"

# Browser
Ctrl+Shift+R (hard refresh)
```

## 📞 Support Contacts

- **Technical Issues**: support@nyumbasync.com
- **Sentry**: https://sentry.io/
- **Payment Gateways**: Check respective dashboards
- **Hosting**: Check hosting provider support

## 📚 Documentation Links

- [Quick Start](DEPLOYMENT_QUICKSTART.md) - 2-4 hour guide
- [Full Config](DEPLOYMENT_CONFIGURATION.md) - Complete setup
- [Checklist](PRODUCTION_READINESS_CHECKLIST.md) - Full checklist
- [Monitoring](MONITORING_SETUP.md) - Monitoring setup
- [Integration](INTEGRATION_GUIDE.md) - Sentry & Analytics

## 🐛 Common Issues

### Build Fails
```bash
npm run clean
rm -rf node_modules
npm install
npm run build:production
```

### Env Vars Not Working
- Ensure they start with `VITE_`
- Rebuild after changes
- Check browser console

### Payment Fails
- Use production credentials
- Check callback URLs
- Verify SSL certificate

### WebSocket Fails
- Use wss:// not ws://
- Check CORS config
- Verify server running

## 💡 Pro Tips

1. **Always test in staging first**
2. **Deploy during low-traffic hours**
3. **Have rollback plan ready**
4. **Monitor closely after deploy**
5. **Keep team informed**

## 📊 Key Metrics to Watch

- **Error Rate**: < 1%
- **Page Load**: < 3 seconds
- **API Response**: < 500ms
- **Payment Success**: > 95%
- **Uptime**: > 99.9%

---

**Print this card and keep it handy during deployments!**

Last Updated: 2025-10-30
