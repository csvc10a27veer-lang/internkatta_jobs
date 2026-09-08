# Fix 502 Bad Gateway Error

## Problem
The backend server is returning 502 errors because:
1. The `qrcode` package is not installed on production
2. The server crashed when trying to load the new code

## Solution

### Step 1: Fix Backend (CRITICAL - Do this first)

SSH into your production server and run:

```bash
# Navigate to backend directory
cd /var/www/internkatta.com/backend
# OR if different path:
# cd /path/to/your/backend

# Install the qrcode package
npm install qrcode

# Restart the backend server
pm2 restart internkatta-backend
# OR check what process name you're using:
# pm2 list

# Check if it's running
pm2 status
pm2 logs internkatta-backend --lines 50
```

### Step 2: Fix Frontend Domain (If still showing skillup)

If your production frontend is still using `api.skillup.gradezy.in`, you need to rebuild it:

```bash
# Navigate to frontend directory
cd /path/to/frontend

# Make sure production.env has the correct URL
cat production.env
# Should show: VITE_API_URL=https://api.internkatta.com

# Rebuild the frontend with production environment
npm run build:prod
# OR if that doesn't exist:
# VITE_API_URL=https://api.internkatta.com npm run build

# Deploy the new dist/ folder to your web server
```

### Step 3: Verify

After fixing both:

1. **Test Backend API:**
   ```bash
   curl https://api.internkatta.com/api/courses
   # OR
   curl https://api.InternKatta.gradezy.in/api/courses
   ```

2. **Test Frontend:**
   - Open browser console
   - Check that API calls go to `api.internkatta.com` or `api.InternKatta.gradezy.in`
   - Not `api.skillup.gradezy.in`

## Quick Fix Script

You can also use the deployment script:

```bash
cd Fourie_Skillup
chmod +x deploy-qrcode-fix.sh
./deploy-qrcode-fix.sh
```

## Common Issues

### If PM2 process name is different:
```bash
pm2 list  # See all processes
pm2 restart <your-process-name>
```

### If backend path is different:
Update the path in `deploy-qrcode-fix.sh` or run commands manually.

### If frontend still shows old domain:
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check that production build was done with correct environment variables

