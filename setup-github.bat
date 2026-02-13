@echo off
echo =====================================================
echo   Setup GitHub Repository
echo =====================================================
echo.

echo Step 1: Checking Git status...
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo Initializing Git repository...
    git init
) else (
    echo Git repository already initialized.
)

echo.
echo Step 2: Creating .gitignore...
(
echo node_modules/
echo .env*
echo **/__pycache__/
echo **/*.pyc
echo .venv/
echo venv/
echo .next/
echo .DS_Store
echo *.log
echo dist/
echo build/
echo .vercel
) > .gitignore
echo .gitignore created!

echo.
echo Step 3: Adding all files to Git...
git add .

echo.
echo Step 4: Creating initial commit...
git commit -m "Initial commit for deployment"

echo.
echo Step 5: Setting main branch...
git branch -M main

echo.
echo =====================================================
echo   Git Setup Complete!
echo =====================================================
echo.
echo Next steps:
echo 1. Create a repository on GitHub: https://github.com/new
echo 2. Run these commands:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/ecommerce-app.git
echo    git push -u origin main
echo.

pause
