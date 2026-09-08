#!/bin/bash

echo "🚀 Deploying InternKatta to VPS..."

# Navigate to project root
cd /var/www/Fourie_InternKatta

echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🔄 Copying assets..."
node copy-assets.js

echo "🏗️ Building frontend..."
npm run build

echo "📁 Checking assets in dist folder..."
if [ -d "dist/assets" ]; then
    echo "✅ Assets found in dist/assets/"
    echo "📋 Asset folders:"
    ls -la dist/assets/
    echo ""
    echo "📋 Welcome images:"
    ls -la dist/assets/Welcome/
    echo ""
    echo "📋 Content images:"
    ls -la dist/assets/content/
    echo ""
    echo "📋 Quiz images:"
    ls -la dist/assets/Quiz/
    echo ""
    echo "📋 Thinking images:"
    ls -la dist/assets/thinking/
else
    echo "❌ Assets not found in dist/assets/"
fi

echo ""
echo "🎉 Frontend deployment completed!"
echo "📋 Next steps:"
echo "1. Copy dist/ folder contents to your web server root"
echo "2. Ensure web server serves static files from root"
echo "3. Test asset URLs:"
echo "   - https://InternKatta.gradezy.in/assets/Welcome/panda.png"
echo "   - https://InternKatta.gradezy.in/assets/content/content 1.png"
echo "   - https://InternKatta.gradezy.in/assets/Quiz/Quiz 1.png"
echo "   - https://InternKatta.gradezy.in/assets/thinking/thinking 1.png"
