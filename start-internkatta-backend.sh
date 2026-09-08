#!/bin/bash

# Start InternKatta Backend with PM2
# This script should be run from /var/www/internkatta.com/backend

echo "🚀 Starting InternKatta Backend..."

# Navigate to backend directory
cd /var/www/internkatta.com/backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Stop and delete old process if it exists
pm2 stop internkatta-backend 2>/dev/null
pm2 delete internkatta-backend 2>/dev/null

# Start the backend with PM2
pm2 start index.js --name internkatta-backend

# Save PM2 configuration
pm2 save

echo "✅ InternKatta Backend started successfully!"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: pm2 logs internkatta-backend"
echo "  - Restart: pm2 restart internkatta-backend"
echo "  - Status: pm2 status internkatta-backend"
echo "  - Stop: pm2 stop internkatta-backend"



