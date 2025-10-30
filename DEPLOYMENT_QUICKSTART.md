# Production Deployment Quick Start Guide

This is a condensed guide to get your NyumbaSync Tenant Portal deployed to production quickly. For detailed instructions, see [DEPLOYMENT_CONFIGURATION.md](DEPLOYMENT_CONFIGURATION.md).

## Prerequisites

- Node.js 18+ installed
- Production API server URL
- Payment gateway accounts
- AWS S3 or file storage service
- Sentry account (optional but recommended)

## Step 1: Configure Environment Variables

1. Copy the production environment template:
   ```bash
   cp .env.production .env.production.local
   ```

2. Edit `.env.production.local` and replace all placeholder values:
   ```env
   # Required - API Configuration
   VITE_API_URL=https://api.nyumbasync.com
   VITE_SOCKET_URL=https://api.nyumbasync.com
   VITE_ENVIRONMENT=production

   # Required - At least one payment gateway
   VITE_MPESA_CONSUMER_KEY=your-actual-key
   VITE_MPESA_CONSUMER_SECRET=your-actual-secret
   # ... or ...
   VITE_STRIPE_PUBLIC_KEY=pk_live_your-actual-key

   # Required - File Storage
   VITE_FILE_STORAGE_URL=https://your-bucket.s3.amazonaws.com
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name

   # Recommended - Error Tracking
   VITE_SENTRY_DSN=https://your-key@sentry.io/project-id
   ```

3. Verify your configuration:
   ```bash
   npm run check:env
   ```

## Step 2: Install Dependencies

```bash
npm ci --production=false
```

## Step 3: Run Tests

```bash
npm run test
```

Fix any failing tests before proceeding.

## Step 4: Build for Production

### Linux/Mac:
```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### Windows:
```bash
scripts\deploy-production.bat
```

Or manually:
```bash
# Copy production env
cp .env.production.local .env

# Build
npm run build:production

# Restore original env
rm .env
```

## Step 5: Test Build Locally

```bash
npm run preview
```

Visit http://localhost:4173 and test:
- [ ] Login works
- [ ] Dashboard loads
- [ ] Payment form displays
- [ ] No console errors

## Step 6: Deploy

The build output is in the `docs` directory. Deploy this to your hosting service:

### Option A: AWS S3 + CloudFront
```bash
# Upload to S3
aws s3 sync docs/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Option B: Netlify
```bash
netlify deploy --prod --dir=docs
```

### Option C: Vercel
```bash
vercel --prod
```

### Option D: Manual Upload
Upload the contents of the `docs` directory to your web server.

## Step 7: Configure DNS and SSL

1. Point your domain to your hosting service
2. Ensure SSL certificate is installed
3. Verify HTTPS is working

## Step 8: Verify Deployment

Visit your production URL and check:

- [ ] Application loads without errors
- [ ] All pages accessible
- [ ] Payment gateway test (small amount)
- [ ] File upload works
- [ ] WebSocket connects (check browser console)
- [ ] Mobile responsive
- [ ] Works in Chrome, Firefox, Safari, Edge

## Step 9: Set Up Monitoring

### Sentry (Error Tracking)
1. Verify errors are being captured:
   - Open browser console
   - Trigger a test error
   - Check Sentry dashboard

### Google Analytics (Optional)
1. Verify tracking:
   - Visit your site
   - Check Real-Time reports in GA dashboard

## Step 10: Monitor for 24 Hours

After deployment, monitor:
- Error rates in Sentry
- User activity in Google Analytics
- Server logs
- Payment transactions
- User feedback

## Common Issues

### Build Fails
```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules
npm install
npm run build:production
```

### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Rebuild after changing environment variables
- Check browser console for undefined values

### Payment Gateway Not Working
- Verify you're using production credentials (not sandbox)
- Check callback URLs are registered
- Verify SSL certificate is valid
- Check CORS configuration on API

### WebSocket Not Connecting
- Verify WebSocket server is running
- Check SSL/TLS is configured (wss:// not ws://)
- Verify CORS allows your domain
- Check browser console for connection errors

### Files Not Uploading
- Verify S3 bucket permissions
- Check CORS configuration on S3
- Verify Cloudinary credentials
- Check file size limits

## Rollback Plan

If issues occur:

1. **Immediate Rollback**
   ```bash
   # Redeploy previous version
   aws s3 sync s3://your-bucket-name-backup/ s3://your-bucket-name/ --delete
   ```

2. **Fix and Redeploy**
   - Fix the issue
   - Test locally
   - Rebuild and redeploy

## Support

- **Documentation**: See DEPLOYMENT_CONFIGURATION.md for detailed setup
- **Monitoring**: See MONITORING_SETUP.md for monitoring configuration
- **Checklist**: See PRODUCTION_READINESS_CHECKLIST.md for complete checklist
- **Issues**: Create an issue on GitHub
- **Email**: support@nyumbasync.com

## Next Steps

After successful deployment:

1. ✅ Complete [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md)
2. 📊 Set up monitoring dashboards
3. 🔔 Configure alerts
4. 📝 Document any custom configurations
5. 👥 Train support team
6. 📢 Announce launch to users

---

**Estimated Time**: 2-4 hours (depending on hosting service)

**Difficulty**: Intermediate

**Prerequisites**: Basic command line knowledge, access to hosting service
