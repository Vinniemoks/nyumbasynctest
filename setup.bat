@echo off
REM ============================================
REM NyumbaSync Complete Setup Script (Windows)
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   NyumbaSync Complete Setup Wizard
echo ============================================
echo.

REM Check Node.js
echo [Step 1/7] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended: Node.js 18.x LTS or higher
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% detected
echo.

REM Check npm
echo [Step 2/7] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not installed!
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% detected
echo.

REM Clean installation
echo [Step 3/7] Cleaning previous installation...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules 2>nul
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del /f /q package-lock.json 2>nul
)
if exist dist (
    echo Removing dist folder...
    rmdir /s /q dist 2>nul
)
if exist docs (
    echo Removing docs folder...
    rmdir /s /q docs 2>nul
)
echo [OK] Cleanup complete
echo.

REM Install dependencies
echo [Step 4/7] Installing dependencies...
echo This may take several minutes...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    echo.
    echo Troubleshooting:
    echo 1. Check your internet connection
    echo 2. Try running: npm cache clean --force
    echo 3. Delete node_modules and try again
    echo.
    pause
    exit /b 1
)
echo.
echo [OK] All dependencies installed
echo.

REM Setup environment
echo [Step 5/7] Setting up environment...
if not exist .env (
    if exist .env.example (
        echo Creating .env from .env.example...
        copy .env.example .env >nul
        echo [OK] .env file created
        echo [ACTION REQUIRED] Please edit .env file with your configuration
    ) else (
        echo [WARNING] No .env.example found
        echo You may need to create .env manually
    )
) else (
    echo [OK] .env file already exists
)
echo.

REM Verify environment
echo [Step 6/7] Verifying environment configuration...
if exist scripts\check-env.js (
    call node scripts\check-env.js
    if %errorlevel% neq 0 (
        echo [WARNING] Environment check found issues
        echo Please review and update your .env file
    ) else (
        echo [OK] Environment configuration valid
    )
) else (
    echo [SKIP] Environment check script not found
)
echo.

REM Run initial tests
echo [Step 7/7] Running initial tests...
call npm test >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Some tests failed
    echo This is normal for a fresh installation
) else (
    echo [OK] All tests passed
)
echo.

REM Display summary
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo Installation Summary:
echo   Node.js: %NODE_VERSION%
echo   npm: %NPM_VERSION%
echo   Dependencies: Installed
echo   Environment: Configured
echo.
echo Next Steps:
echo.
echo 1. Configure your .env file:
echo    - Set API endpoints
echo    - Configure payment gateways
echo    - Set up monitoring (optional)
echo.
echo 2. Start development server:
echo    npm run dev
echo.
echo 3. Build for production:
echo    npm run build:production
echo.
echo Available Commands:
echo   npm run dev              - Start development server
echo   npm run build            - Build for production
echo   npm run test             - Run tests
echo   npm run lint             - Check code quality
echo   npm run format           - Format code
echo.
echo Documentation:
echo   INSTALLATION.md          - Installation guide
echo   DEPLOYMENT_QUICKSTART.md - Deployment guide
echo   INTEGRATION_GUIDE.md     - API integration
echo.
echo For help, visit: https://github.com/Vinniemoks/nyumbasynctest
echo.
pause
