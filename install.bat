@echo off
REM ============================================
REM NyumbaSync Installation Script (Windows)
REM ============================================

echo.
echo ========================================
echo   NyumbaSync Installation Script
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Recommended version: Node.js 18.x or higher
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Check if npm is installed
echo [2/6] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [OK] npm is installed
npm --version
echo.

REM Clean previous installations
echo [3/6] Cleaning previous installations...
if exist node_modules (
    echo Removing old node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing old package-lock.json...
    del /f /q package-lock.json
)
if exist dist (
    echo Removing old build files...
    rmdir /s /q dist
)
echo [OK] Cleanup complete
echo.

REM Install dependencies
echo [4/6] Installing project dependencies...
echo This may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)
echo [OK] Dependencies installed successfully
echo.

REM Check environment configuration
echo [5/6] Checking environment configuration...
if not exist .env (
    if exist .env.example (
        echo Creating .env file from .env.example...
        copy .env.example .env
        echo [WARNING] Please configure your .env file with appropriate values
    ) else (
        echo [WARNING] No .env file found. You may need to create one.
    )
) else (
    echo [OK] .env file exists
)
echo.

REM Verify installation
echo [6/6] Verifying installation...
call node scripts/check-env.js
if %errorlevel% neq 0 (
    echo [WARNING] Environment check completed with warnings
) else (
    echo [OK] Environment check passed
)
echo.

echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Available commands:
echo   npm run dev              - Start development server
echo   npm run build            - Build for production
echo   npm run build:staging    - Build for staging
echo   npm run build:production - Build for production
echo   npm test                 - Run tests
echo   npm run lint             - Check code quality
echo.
echo To start the development server, run:
echo   npm run dev
echo.
pause
