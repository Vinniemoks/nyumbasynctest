# Deployment Scripts

This directory contains scripts for deploying the NyumbaSync Tenant Portal to various environments.

## Installation Scripts

Before deploying, you need to install the application. Use these scripts located in the project root:

### Quick Installation

**Windows:**
```bash
quick-install.bat
```

**Linux/Mac:**
```bash
chmod +x quick-install.sh
./quick-install.sh
```

### Full Installation (Recommended)

**Windows:**
```bash
install.bat
```

**Linux/Mac:**
```bash
chmod +x install.sh
./install.sh
```

The full installation script:
- Checks system requirements
- Cleans previous installations
- Installs all dependencies
- Configures environment files
- Verifies the installation
- Displays available commands

For detailed installation instructions, see [INSTALLATION.md](../INSTALLATION.md)

## Available Scripts

### `check-env.js`

Validates environment configuration before deployment.

**Usage:**
```bash
npm run check:env
```

**What it checks:**
- Required environment variables are set
- Production credentials are not placeholders
- Payment gateway configuration
- File storage configuration
- Monitoring configuration

**Exit codes:**
- `0`: All checks passed
- `1`: Missing or invalid configuration

### `deploy-production.sh` (Linux/Mac)

Automated production deployment script.

**Usage:**
```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

**What it does:**
1. Checks for `.env.production` file
2. Backs up current `.env` file
3. Copies production environment variables
4. Installs dependencies
5. Runs linter
6. Runs tests
7. Builds for production
8. Verifies build output
9. Restores original `.env` file

**Requirements:**
- Bash shell
- Node.js 18+
- `.env.production` file with production credentials

### `deploy-production.bat` (Windows)

Windows version of the production deployment script.

**Usage:**
```bash
scripts\deploy-production.bat
```

**What it does:**
Same as `deploy-production.sh` but for Windows Command Prompt.

**Requirements:**
- Windows Command Prompt or PowerShell
- Node.js 18+
- `.env.production` file with production credentials

## Creating Custom Deployment Scripts

### Example: Deploy to AWS S3

Create `scripts/deploy-aws.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying to AWS S3..."

# Run production build
./scripts/deploy-production.sh

# Upload to S3
aws s3 sync docs/ s3://your-bucket-name \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --exclude "*.json"

# Upload HTML files with no-cache
aws s3 sync docs/ s3://your-bucket-name \
  --delete \
  --cache-control "no-cache" \
  --exclude "*" \
  --include "*.html" \
  --include "*.json"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

echo "✅ Deployment to AWS S3 completed!"
```

### Example: Deploy to Netlify

Create `scripts/deploy-netlify.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying to Netlify..."

# Run production build
./scripts/deploy-production.sh

# Deploy to Netlify
netlify deploy --prod --dir=docs

echo "✅ Deployment to Netlify completed!"
```

### Example: Deploy to Vercel

Create `scripts/deploy-vercel.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying to Vercel..."

# Run production build
./scripts/deploy-production.sh

# Deploy to Vercel
vercel --prod

echo "✅ Deployment to Vercel completed!"
```

## Environment-Specific Deployments

### Staging Deployment

Create `scripts/deploy-staging.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting Staging Deployment..."

# Check if .env.staging exists
if [ ! -f .env.staging ]; then
    echo "❌ Error: .env.staging file not found!"
    exit 1
fi

# Backup and copy staging environment
if [ -f .env ]; then
    cp .env .env.backup
fi
cp .env.staging .env

# Install dependencies
npm ci --production=false

# Run tests
npm run test

# Build for staging
npm run build:staging

# Restore original .env
if [ -f .env.backup ]; then
    mv .env.backup .env
fi

echo "✅ Staging build completed!"
echo "Deploy the 'docs' directory to your staging server"
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test
        
      - name: Build
        run: npm run build:production
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_SOCKET_URL: ${{ secrets.VITE_SOCKET_URL }}
          VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
          # Add other environment variables from GitHub Secrets
          
      - name: Deploy to S3
        run: |
          aws s3 sync docs/ s3://your-bucket-name --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: us-east-1
```

### GitLab CI Example

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run test
  only:
    - main

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build:production
  artifacts:
    paths:
      - docs/
  only:
    - main

deploy:
  stage: deploy
  image: amazon/aws-cli
  script:
    - aws s3 sync docs/ s3://your-bucket-name --delete
  only:
    - main
```

## Troubleshooting

### Script Permission Denied (Linux/Mac)

```bash
chmod +x scripts/deploy-production.sh
```

### Script Not Found (Windows)

Use full path:
```bash
.\scripts\deploy-production.bat
```

### Environment Variables Not Loading

Ensure `.env.production` exists and contains valid values:
```bash
cat .env.production  # Linux/Mac
type .env.production  # Windows
```

### Build Fails

Clear cache and try again:
```bash
npm run clean
rm -rf node_modules
npm install
./scripts/deploy-production.sh
```

## Best Practices

1. **Always test locally first**
   ```bash
   npm run build:production
   npm run preview
   ```

2. **Use environment-specific scripts**
   - `deploy-staging.sh` for staging
   - `deploy-production.sh` for production

3. **Keep credentials secure**
   - Never commit `.env.production` to git
   - Use CI/CD secrets for automated deployments

4. **Backup before deploying**
   - Keep previous build artifacts
   - Have a rollback plan

5. **Monitor after deployment**
   - Check error rates
   - Verify functionality
   - Monitor performance

## Additional Resources

- [DEPLOYMENT_QUICKSTART.md](../DEPLOYMENT_QUICKSTART.md) - Quick start guide
- [DEPLOYMENT_CONFIGURATION.md](../DEPLOYMENT_CONFIGURATION.md) - Detailed configuration
- [PRODUCTION_READINESS_CHECKLIST.md](../PRODUCTION_READINESS_CHECKLIST.md) - Pre-deployment checklist
- [MONITORING_SETUP.md](../MONITORING_SETUP.md) - Monitoring configuration

## Support

For script issues or questions:
- Create an issue on GitHub
- Email: support@nyumbasync.com
- Documentation: https://docs.nyumbasync.com
