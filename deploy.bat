@echo off
REM Deployment script for mokuavinnie.tech (Windows)

echo 🚀 Starting deployment process...

REM Clean old build
echo 🧹 Cleaning old build...
if exist dist rmdir /s /q dist

REM Build the project
echo 📦 Building React app...
call npm run build

REM Copy necessary files
echo 📋 Copying deployment files...
copy public\404.html dist\404.html
copy CNAME dist\CNAME

REM Verify build
echo ✅ Verifying build...
if exist dist\index.html (
    if exist dist\404.html (
        if exist dist\CNAME (
            echo ✅ Build successful!
            echo 📁 Dist folder contents:
            dir dist
            echo.
            echo 🎉 Ready to deploy!
            echo.
            echo Next steps:
            echo 1. git add dist
            echo 2. git commit -m "Deploy React app"
            echo 3. git push origin main
            echo.
            echo Or use GitHub Actions (already configured)
        ) else (
            echo ❌ CNAME file missing!
            exit /b 1
        )
    ) else (
        echo ❌ 404.html file missing!
        exit /b 1
    )
) else (
    echo ❌ index.html file missing!
    exit /b 1
)
