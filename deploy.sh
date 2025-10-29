#!/bin/bash

# Deployment script for mokuavinnie.tech

echo "🚀 Starting deployment process..."

# Clean old build
echo "🧹 Cleaning old build..."
rm -rf dist

# Build the project
echo "📦 Building React app..."
npm run build

# Copy necessary files
echo "📋 Copying deployment files..."
cp public/404.html dist/404.html
cp CNAME dist/CNAME

# Verify build
echo "✅ Verifying build..."
if [ -f "dist/index.html" ] && [ -f "dist/404.html" ] && [ -f "dist/CNAME" ]; then
    echo "✅ Build successful!"
    echo "📁 Dist folder contents:"
    ls -la dist/
    echo ""
    echo "🎉 Ready to deploy!"
    echo ""
    echo "Next steps:"
    echo "1. git add dist"
    echo "2. git commit -m 'Deploy React app'"
    echo "3. git push origin main"
    echo ""
    echo "Or use GitHub Actions (already configured)"
else
    echo "❌ Build verification failed!"
    exit 1
fi
