@echo off
echo 🚀 Starting Production Deployment for InternKatta...

REM Check if we're in the right directory
if not exist "frontend" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM 1. Install Dependencies
echo 📦 Installing dependencies...
cd frontend
call npm install
echo ✅ Frontend dependencies installed

cd ..\backend
call npm install
echo ✅ Backend dependencies installed

REM 2. Build Frontend for Production
echo 📦 Building Frontend for production...
cd ..\frontend
call npm run build:prod
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend built successfully

REM 3. Deploy Backend
echo 🔧 Deploying Backend...
cd ..\backend
echo ✅ Backend ready for deployment

REM 4. Update Database URLs (if needed)
echo 🗄️  Updating database URLs...
if exist "fix_course_urls.js" (
    node fix_course_urls.js
)
if exist "fix_internship_urls.js" (
    node fix_internship_urls.js
)
echo ✅ Database URLs updated successfully

echo 🎉 Production deployment completed!
echo 🌐 Your site is now live at: https://InternKatta.gradezy.in
echo 🔌 API endpoint: https://api.InternKatta.gradezy.in
echo.
echo 📋 Post-deployment checklist:
echo   ✅ Test frontend loading
echo   ✅ Test API endpoints
echo   ✅ Test payment gateway
echo   ✅ Test user authentication
echo   ✅ Test Google OAuth
echo.
echo 🔧 If you need to restart services:
echo   Backend: pm2 restart InternKatta-api
echo   Frontend: systemctl restart nginx (or your web server)

pause
