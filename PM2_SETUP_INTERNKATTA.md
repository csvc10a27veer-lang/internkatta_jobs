# PM2 Setup for InternKatta Backend

## Quick Setup

Run these commands on your production server:

```bash
# 1. Navigate to the backend directory
cd /var/www/internkatta.com/backend

# 2. Install dependencies (if not already installed)
npm install

# 3. Stop and delete old process (if exists)
pm2 stop internkatta-backend 2>/dev/null
pm2 delete internkatta-backend 2>/dev/null

# 4. Start the new backend process
pm2 start index.js --name internkatta-backend

# 5. Save PM2 configuration
pm2 save

# 6. Verify it's running
pm2 status internkatta-backend
pm2 logs internkatta-backend --lines 20
```

## Verify the Route is Working

After starting, test the recycle bin endpoint:

```bash
# Test with curl (replace YOUR_TOKEN with actual admin token)
curl -H "admin-authorization: Bearer YOUR_TOKEN" https://api.internkatta.com/api/recycle-bin
```

## PM2 Management Commands

```bash
# View logs
pm2 logs internkatta-backend

# Restart
pm2 restart internkatta-backend

# Stop
pm2 stop internkatta-backend

# Start
pm2 start internkatta-backend

# Delete
pm2 delete internkatta-backend

# Monitor
pm2 monit
```

## Important Notes

- The backend should run on port 4000
- Make sure your nginx configuration points to `http://localhost:4000`
- The process name is `internkatta-backend` (different from the old `skillup-backend`)



