#!/bin/bash

echo "🚀 Starting InternKatta Production Deployment..."

# Navigate to frontend directory
cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔄 Copying assets to public folder..."
node copy-assets.js

echo "🏗️ Building frontend for production..."
npm run build

echo "📁 Checking if assets were copied correctly..."
if [ -d "dist/assets" ]; then
    echo "✅ Assets found in dist/assets/"
    ls -la dist/assets/
else
    echo "❌ Assets not found in dist/assets/"
fi

echo "📋 Deployment Summary:"
echo "Frontend build completed in: dist/"
echo "Assets should be available at: /assets/"
echo ""
echo "🔧 Next steps:"
echo "1. Copy the 'dist' folder contents to your web server"
echo "2. Ensure your web server serves static files from the root"
echo "3. Verify assets are accessible at https://InternKatta.gradezy.in/assets/"
echo ""
echo "🎉 Frontend deployment ready!"
