#!/bin/bash

# Deployment script to fix QR code generation issue
# This script installs the qrcode package and restarts the backend server

echo "🔧 Fixing QR Code Generation Issue..."
echo ""

# Navigate to backend directory
cd /var/www/internkatta.com/backend || {
    echo "❌ Error: Could not find backend directory"
    echo "Please run this script from the project root or update the path"
    exit 1
}

echo "📦 Installing qrcode package..."
npm install qrcode

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install qrcode package"
    exit 1
fi

echo ""
echo "🔄 Restarting backend server..."

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    # Try to find the process name
    if pm2 list | grep -q "internkatta-backend"; then
        echo "Restarting internkatta-backend..."
        pm2 restart internkatta-backend
    else
        echo "⚠️  No PM2 process found. Starting new process..."
        pm2 start index.js --name internkatta-backend
        pm2 save
    fi
    
    echo ""
    echo "📋 Checking server status..."
    pm2 status
    echo ""
    echo "📝 Recent logs:"
    pm2 logs --lines 20 --nostream
else
    echo "⚠️  PM2 not found. Please restart the server manually:"
    echo "   - If using systemd: sudo systemctl restart your-backend-service"
    echo "   - If using node directly: kill the process and restart with 'node index.js'"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Test the API:"
echo "   curl https://api.internkatta.com/api/courses"
echo "   OR"
echo "   curl https://api.InternKatta.gradezy.in/api/courses"

