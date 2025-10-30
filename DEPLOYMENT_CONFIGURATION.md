# Production Deployment Configuration Guide

This guide provides comprehensive instructions for deploying NyumbaSync Tenant Portal to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Payment Gateway Setup](#payment-gateway-setup)
4. [File Storage Configuration](#file-storage-configuration)
5. [WebSocket Server Setup](#websocket-server-setup)
6. [Monitoring and Error Tracking](#monitoring-and-error-tracking)
7. [Deployment Process](#deployment-process)
8. [Post-Deployment Checklist](#post-deployment-checklist)

## Prerequisites

Before deploying to production, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Production API server deployed and accessible
- [ ] Domain name configured with SSL certificate
- [ ] Payment gateway accounts (M-Pesa, Airtel, Telkom, Stripe/Flutterwave)
- [ ] AWS S3 bucket or alternative file storage
- [ ] Sentry account for error tracking
- [ ] Google Analytics account (optional)

## Environment Configuration

### 1. Create Production Environment File

Copy `.env.production` and fill in your production credentials:

```bash
cp .env.production .env.production.local
```

### 2. Required Environment Variables

#### API Configuration
```env
VITE_API_URL=https://api.nyumbasync.com
VITE_SOCKET_URL=https://api.nyumbasync.com
VITE_ENVIRONMENT=production
```

#### Payment Gateways
See [Payment Gateway Setup](#payment-gateway-setup) section below.

#### File Storage
See [File Storage Configuration](#file-storage-configuration) section below.

#### Monitoring
See [Monitoring and Error Tracking](#monitoring-and-error-tracking) section below.

## Payment Gateway Setup

### M-Pesa (Daraja API)

1. **Register for M-Pesa Daraja API**
   - Visit: https://developer.safaricom.co.ke/
   - Create an account and register your app
   - Get production credentials

2. **Configure M-Pesa Environment Variables**
   ```env
   VITE_MPESA_CONSUMER_KEY=your-production-consumer-key
   VITE_MPESA_CONSUMER_SECRET=your-production-consumer-secret
   VITE_MPESA_SHORTCODE=your-production-shortcode
   VITE_MPESA_PASSKEY=your-production-passkey
   VITE_MPESA_ENVIRONMENT=production
   ```

3. **Configure Callback URLs**
   - Set callback URL in Daraja portal: `https://api.nyumbasync.com/api/payments/mpesa/callback`
   - Ensure your backend handles the callback

### Airtel Money

1. **Register for Airtel Money API**
   - Contact Airtel Business for API access
   - Get production credentials

2. **Configure Airtel Environment Variables**
   ```env
   VITE_AIRTEL_CLIENT_ID=your-production-client-id
   VITE_AIRTEL_CLIENT_SECRET=your-production-client-secret
   VITE_AIRTEL_ENVIRONMENT=production
   ```

### Telkom Money (T-Kash)

1. **Register for Telkom Money API**
   - Contact Telkom Business for API access
   - Get production credentials

2. **Configure Telkom Environment Variables**
   ```env
   VITE_TELKOM_API_KEY=your-production-api-key
   VITE_TELKOM_MERCHANT_ID=your-production-merchant-id
   VITE_TELKOM_ENVIRONMENT=production
   ```

### Stripe (Card Payments)

1. **Create Stripe Account**
   - Visit: https://stripe.com/
   - Complete business verification
   - Get production API keys

2. **Configure Stripe Environment Variables**
   ```env
   VITE_STRIPE_PUBLIC_KEY=pk_live_your-production-public-key
   VITE_PAYMENT_GATEWAY=stripe
   ```

3. **Configure Webhooks**
   - Add webhook endpoint: `https://api.nyumbasync.com/api/payments/stripe/webhook`
   - Subscribe to events: `payment_intent.succeeded`, `payment_intent.failed`

### Flutterwave (Alternative Card Payments)

1. **Create Flutterwave Account**
   - Visit: https://flutterwave.com/
   - Complete business verification
   - Get production API keys

2. **Configure Flutterwave Environment Variables**
   ```env
   VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-your-production-public-key
   VITE_PAYMENT_GATEWAY=flutterwave
   ```

## File Storage Configuration

### AWS S3 Setup

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://nyumbasync-production --region us-east-1
   ```

2. **Configure Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::nyumbasync-production/*"
       }
     ]
   }
   ```

3. **Enable CORS**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://nyumbasync.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

4. **Configure Environment Variables**
   ```env
   VITE_FILE_STORAGE_URL=https://nyumbasync-production.s3.amazonaws.com
   VITE_FILE_STORAGE_REGION=us-east-1
   VITE_FILE_STORAGE_BUCKET=nyumbasync-production
   ```

### Cloudinary Setup (Image Optimization)

1. **Create Cloudinary Account**
   - Visit: https://cloudinary.com/
   - Create production environment

2. **Configure Upload Preset**
   - Go to Settings > Upload
   - Create unsigned upload preset: `nyumbasync-production`
   - Set folder: `tenant-portal`

3. **Configure Environment Variables**
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your-production-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=nyumbasync-production
   VITE_CLOUDINARY_API_KEY=your-production-api-key
   ```

## WebSocket Server Setup

### Backend WebSocket Configuration

1. **Install Socket.io on Backend**
   ```bash
   npm install socket.io
   ```

2. **Configure Socket.io Server**
   ```javascript
   const io = require('socket.io')(server, {
     cors: {
       origin: 'https://nyumbasync.com',
       methods: ['GET', 'POST'],
       credentials: true
     },
     transports: ['websocket', 'polling']
   });

   io.on('connection', (socket) => {
     console.log('Client connected:', socket.id);
     
     // Authenticate socket connection
     socket.on('authenticate', (token) => {
       // Verify JWT token
       // Join user-specific room
     });

     socket.on('disconnect', () => {
       console.log('Client disconnected:', socket.id);
     });
   });
   ```

3. **Configure Environment Variables**
   ```env
   VITE_SOCKET_URL=https://api.nyumbasync.com
   VITE_SOCKET_RECONNECTION_ATTEMPTS=5
   VITE_SOCKET_RECONNECTION_DELAY=3000
   VITE_SOCKET_TIMEOUT=20000
   ```

### SSL/TLS Configuration

Ensure your WebSocket server supports secure connections (wss://) in production.

## Monitoring and Error Tracking

### Sentry Setup

1. **Create Sentry Project**
   - Visit: https://sentry.io/
   - Create new project for React
   - Get DSN

2. **Install Sentry**
   ```bash
   npm install @sentry/react
   ```

3. **Configure Environment Variables**
   ```env
   VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
   VITE_SENTRY_ENVIRONMENT=production
   VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
   VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
   VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0
   ```

4. **Initialize Sentry in Application**
   
   The Sentry configuration is already set up in `src/config/sentry.js`. 
   
   Update `src/main.jsx` to initialize Sentry:
   ```javascript
   import { initSentry } from './config/sentry';
   
   // Initialize Sentry before rendering
   initSentry().then(() => {
     ReactDOM.createRoot(document.getElementById('root')).render(
       <React.StrictMode>
         <App />
       </React.StrictMode>
     );
   });
   ```

### Google Analytics Setup

1. **Create Google Analytics Property**
   - Visit: https://analytics.google.com/
   - Create new GA4 property
   - Get Measurement ID

2. **Configure Environment Variables**
   ```env
   VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   VITE_ENABLE_ANALYTICS=true
   ```

3. **Initialize Analytics**
   
   The analytics configuration is already set up in `src/config/analytics.js`.
   
   Update `src/main.jsx` to initialize analytics:
   ```javascript
   import { initAnalytics } from './config/analytics';
   
   // Initialize analytics
   initAnalytics();
   ```

## Deployment Process

### Option 1: Manual Deployment

1. **Build for Production**
   ```bash
   # Linux/Mac
   chmod +x scripts/deploy-production.sh
   ./scripts/deploy-production.sh

   # Windows
   scripts\deploy-production.bat
   ```

2. **Deploy to Hosting Service**
   
   The build output is in the `docs` directory. Deploy this directory to your hosting service.

### Option 2: AWS S3 + CloudFront

1. **Deploy to S3**
   ```bash
   aws s3 sync docs/ s3://nyumbasync-production --delete
   ```

2. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Enable HTTPS
   - Configure custom domain
   - Set default root object: `index.html`
   - Configure error pages: 404 -> /index.html (for SPA routing)

3. **Invalidate CloudFront Cache**
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

### Option 3: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod --dir=docs
   ```

### Option 4: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

## Post-Deployment Checklist

### Security

- [ ] SSL certificate configured and valid
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Content Security Policy (CSP) headers configured
- [ ] CORS properly configured on API
- [ ] Rate limiting enabled on API endpoints
- [ ] API keys and secrets not exposed in frontend code

### Performance

- [ ] CDN configured for static assets
- [ ] Gzip/Brotli compression enabled
- [ ] Browser caching headers configured
- [ ] Images optimized and lazy-loaded
- [ ] Code splitting working correctly
- [ ] Bundle size analyzed and optimized

### Functionality

- [ ] All payment gateways tested with real transactions
- [ ] WebSocket connections working
- [ ] File uploads working to S3/Cloudinary
- [ ] Email/SMS notifications sending
- [ ] All API endpoints responding correctly
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested

### Monitoring

- [ ] Sentry receiving error reports
- [ ] Google Analytics tracking page views
- [ ] Server monitoring configured
- [ ] Uptime monitoring configured
- [ ] Log aggregation configured
- [ ] Alert notifications configured

### Documentation

- [ ] API documentation updated
- [ ] User documentation available
- [ ] Admin documentation available
- [ ] Deployment runbook created
- [ ] Incident response plan documented

### Compliance

- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent implemented
- [ ] GDPR compliance verified (if applicable)
- [ ] PCI DSS compliance verified (for card payments)
- [ ] Data backup strategy implemented

## Troubleshooting

### Build Fails

- Check Node.js version (18+ required)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`
- Check for linting errors: `npm run lint`

### Payment Gateway Issues

- Verify credentials are for production environment
- Check callback URLs are correctly configured
- Verify SSL certificate is valid
- Check API endpoint CORS configuration

### WebSocket Connection Issues

- Verify WebSocket server is running
- Check SSL/TLS configuration (wss:// required in production)
- Verify CORS configuration on WebSocket server
- Check firewall rules allow WebSocket connections

### File Upload Issues

- Verify S3 bucket permissions
- Check CORS configuration on S3 bucket
- Verify Cloudinary upload preset is unsigned
- Check file size limits

### Monitoring Not Working

- Verify Sentry DSN is correct
- Check Sentry project settings
- Verify Google Analytics ID is correct
- Check browser ad blockers aren't blocking analytics

## Support

For deployment support:
- Email: support@nyumbasync.com
- Documentation: https://docs.nyumbasync.com
- GitHub Issues: https://github.com/Vinniemoks/nyumbasynctest/issues

## Version History

- v1.0.0 - Initial production deployment configuration
