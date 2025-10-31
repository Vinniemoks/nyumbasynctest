@echo off
REM Quick Installation Script for NyumbaSync (Windows)

echo Installing NyumbaSync...
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Install from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Create .env if needed
if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo Created .env file - please configure it
    )
)

echo.
echo Installation complete!
echo Run: npm run dev
echo.
pause
