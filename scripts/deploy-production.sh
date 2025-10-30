#!/bin/bash

# Production Deployment Script for NyumbaSync
# This script builds and deploys the application to production

set -e  # Exit on error

echo "🚀 Starting Production Deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with production credentials"
    exit 1
fi

# Backup current .env if it exists
if [ -f .env ]; then
    echo "📦 Backing up current .env file..."
    cp .env .env.backup
fi

# Copy production environment variables
echo "🔧 Setting up production environment..."
cp .env.production .env

# Install dependencies
echo "📥 Installing dependencies..."
npm ci --production=false

# Run linting
echo "🔍 Running linter..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test

# Build for production
echo "🏗️  Building for production..."
npm run build

# Verify build output
if [ ! -d "docs" ]; then
    echo "❌ Error: Build failed - docs directory not found!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Optional: Deploy to hosting service
# Uncomment and configure based on your hosting provider

# Example: Deploy to AWS S3
# echo "☁️  Deploying to AWS S3..."
# aws s3 sync docs/ s3://your-bucket-name --delete

# Example: Deploy to Netlify
# echo "☁️  Deploying to Netlify..."
# netlify deploy --prod --dir=docs

# Example: Deploy to Vercel
# echo "☁️  Deploying to Vercel..."
# vercel --prod

# Restore original .env
if [ -f .env.backup ]; then
    echo "🔄 Restoring original .env file..."
    mv .env.backup .env
fi

echo "✨ Production deployment completed successfully!"
echo "📊 Build size:"
du -sh docs/

echo ""
echo "Next steps:"
echo "1. Test the production build locally: npm run preview"
echo "2. Deploy the 'docs' directory to your hosting service"
echo "3. Configure your domain and SSL certificate"
echo "4. Set up monitoring and alerts"
