@echo off
echo =====================================================
echo   Deploy Frontend to Vercel
echo =====================================================
echo.

cd frontend

echo Step 1: Checking for Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
) else (
    echo Vercel CLI already installed.
)

echo.
echo Step 2: Creating production environment file...
echo NEXT_PUBLIC_API_URL=https://ecommerce-api-gateway.onrender.com/api/v1 > .env.production
echo Environment file created!

echo.
echo Step 3: Deploying to Vercel...
echo.
vercel --prod

echo.
echo =====================================================
echo   Frontend Deployment Complete!
echo =====================================================
echo.
echo Don't forget to:
echo 1. Update NEXT_PUBLIC_API_URL with your actual API Gateway URL
echo 2. Verify deployment at the URL shown above
echo 3. Test your application
echo.

pause
