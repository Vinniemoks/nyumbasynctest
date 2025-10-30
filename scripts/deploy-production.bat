@echo off
REM Production Deployment Script for NyumbaSync (Windows)
REM This script builds and deploys the application to production

echo Starting Production Deployment...

REM Check if .env.production exists
if not exist .env.production (
    echo Error: .env.production file not found!
    echo Please create .env.production with production credentials
    exit /b 1
)

REM Backup current .env if it exists
if exist .env (
    echo Backing up current .env file...
    copy .env .env.backup >nul
)

REM Copy production environment variables
echo Setting up production environment...
copy .env.production .env >nul

REM Install dependencies
echo Installing dependencies...
call npm ci --production=false
if errorlevel 1 (
    echo Error: Failed to install dependencies
    exit /b 1
)

REM Run linting
echo Running linter...
call npm run lint
if errorlevel 1 (
    echo Warning: Linting issues found
)

REM Run tests
echo Running tests...
call npm run test
if errorlevel 1 (
    echo Error: Tests failed
    exit /b 1
)

REM Build for production
echo Building for production...
call npm run build
if errorlevel 1 (
    echo Error: Build failed
    exit /b 1
)

REM Verify build output
if not exist docs (
    echo Error: Build failed - docs directory not found!
    exit /b 1
)

echo Build completed successfully!

REM Optional: Deploy to hosting service
REM Uncomment and configure based on your hosting provider

REM Example: Deploy to AWS S3
REM echo Deploying to AWS S3...
REM aws s3 sync docs/ s3://your-bucket-name --delete

REM Example: Deploy to Netlify
REM echo Deploying to Netlify...
REM netlify deploy --prod --dir=docs

REM Example: Deploy to Vercel
REM echo Deploying to Vercel...
REM vercel --prod

REM Restore original .env
if exist .env.backup (
    echo Restoring original .env file...
    move /y .env.backup .env >nul
)

echo Production deployment completed successfully!

echo.
echo Next steps:
echo 1. Test the production build locally: npm run preview
echo 2. Deploy the 'docs' directory to your hosting service
echo 3. Configure your domain and SSL certificate
echo 4. Set up monitoring and alerts

pause
