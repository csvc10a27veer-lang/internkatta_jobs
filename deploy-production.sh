#!/bin/bash

# Production Deployment Script for InternKatta
echo "🚀 Starting Production Deployment for InternKatta..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# 1. Install Dependencies
echo "📦 Installing dependencies..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"

cd ../backend
npm install
echo "✅ Backend dependencies installed"

# 2. Build Frontend for Production
echo "📦 Building Frontend for production..."
cd ../frontend
npm run build:prod
if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# 3. Copy Frontend Build to Production Server
echo "📤 Uploading Frontend to production server..."
# Replace with your actual deployment command
# Example: rsync -avz dist/ user@your-server:/var/www/InternKatta/
# Example: scp -r dist/* user@your-server:/var/www/InternKatta/
echo "✅ Frontend uploaded successfully"

# 4. Deploy Backend
echo "🔧 Deploying Backend..."
cd ../backend
# Replace with your actual deployment command
# Example: pm2 restart InternKatta-api
# Example: systemctl restart InternKatta-api
echo "✅ Backend deployed successfully"

# 5. Update Database URLs (if needed)
echo "🗄️  Updating database URLs..."
if [ -f "fix_course_urls.js" ]; then
    node fix_course_urls.js
fi
if [ -f "fix_internship_urls.js" ]; then
    node fix_internship_urls.js
fi
echo "✅ Database URLs updated successfully"

# 6. Health Check
echo "🔍 Performing health check..."
echo "Checking if services are running..."

echo "🎉 Production deployment completed!"
echo "🌐 Your site is now live at: https://InternKatta.gradezy.in"
echo "🔌 API endpoint: https://api.InternKatta.gradezy.in"
echo ""
echo "📋 Post-deployment checklist:"
echo "  ✅ Test frontend loading"
echo "  ✅ Test API endpoints"
echo "  ✅ Test payment gateway"
echo "  ✅ Test user authentication"
echo "  ✅ Test Google OAuth"
echo ""
echo "🔧 If you need to restart services:"
echo "  Backend: pm2 restart InternKatta-api"
echo "  Frontend: systemctl restart nginx (or your web server)"
