# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for both users and admins in your Fourie InternKatta application.

## 🚀 **Features Implemented**

✅ **User Google Login**: Users can sign in with their Google account
✅ **Admin Google Login**: Admins can sign in with their Google account  
✅ **Automatic Account Creation**: New users are automatically created when they sign in with Google
✅ **Profile Picture Integration**: Google profile pictures are automatically imported
✅ **Seamless Integration**: Works alongside existing email/password authentication

## 📋 **Prerequisites**

1. Google Cloud Console account
2. Access to your domain (for production setup)

## 🔧 **Step 1: Google Cloud Console Setup**

### 1.1 Create a New Project (or use existing)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

### 1.2 Enable Google+ API
1. Navigate to "APIs & Services" > "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google Identity" API

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized JavaScript origins:
   - **Local Development**: `http://localhost:5173`, `http://localhost:3000`
   - **Production**: `https://yourdomain.com`, `https://api.yourdomain.com`
5. Add authorized redirect URIs:
   - **Local Development**: `http://localhost:5173`, `http://localhost:3000`
   - **Production**: `https://yourdomain.com`, `https://api.yourdomain.com`
6. Click "Create" and copy the **Client ID**

## 🔑 **Step 2: Environment Variables Setup**

### 2.1 Backend Environment Variables
Add to your `backend/.env` or `backend/production.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 2.2 Frontend Environment Variables
Add to your `frontend/.env` or `frontend/production.env`:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## 📦 **Step 3: Install Dependencies**

### 3.1 Backend Dependencies
```bash
cd backend
npm install google-auth-library
```

### 3.2 Frontend Dependencies
No additional dependencies needed - using Google's CDN script.

## 🚀 **Step 4: Deploy to Production**

### 4.1 Update Production Environment Variables
On your VPS, update the environment files:

```bash
# Backend
nano /var/www/Fourie_InternKatta/backend/production.env
# Add: GOOGLE_CLIENT_ID=your_google_client_id_here

# Frontend  
nano /var/www/Fourie_InternKatta/frontend/production.env
# Add: VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 4.2 Restart Services
```bash
# Restart backend
pm2 restart InternKatta-api

# Rebuild and restart frontend
cd /var/www/Fourie_InternKatta/frontend
npm run build
```

## 🎯 **Step 5: Google Cloud Console Production Setup**

### 5.1 Update Authorized Origins
1. Go back to your Google Cloud Console
2. Edit your OAuth 2.0 Client ID
3. Add your production domains:
   - `https://InternKatta.gradezy.in`
   - `https://api.InternKatta.gradezy.in`

### 5.2 Update Authorized Redirect URIs
Add your production URLs:
- `https://InternKatta.gradezy.in`
- `https://api.InternKatta.gradezy.in`

## 🧪 **Step 6: Testing**

### 6.1 Test User Login
1. Go to `/login`
2. Click the "Sign in with Google" button
3. Complete Google authentication
4. Verify you're redirected to `/user/mycourse`

### 6.2 Test Admin Login
1. Go to `/admin/login`
2. Click the "Sign in with Google" button
3. Complete Google authentication
4. Verify you're redirected to `/admin/managecourse`

## 🔍 **Troubleshooting**

### Common Issues:

**1. "Invalid Client ID" Error**
- Verify `GOOGLE_CLIENT_ID` is set correctly in both backend and frontend
- Check that the Client ID matches exactly in Google Cloud Console

**2. "Redirect URI Mismatch" Error**
- Ensure your domain is added to authorized origins in Google Cloud Console
- Check that HTTP/HTTPS protocol matches

**3. "Access Denied" for Admin**
- Admin accounts must exist in your database first
- Google OAuth will only work for existing admin emails

**4. Button Not Appearing**
- Check browser console for JavaScript errors
- Verify Google script is loading correctly
- Ensure `VITE_GOOGLE_CLIENT_ID` is set in frontend

### Debug Commands:
```bash
# Check backend logs
pm2 logs InternKatta-api

# Check if environment variables are loaded
pm2 show InternKatta-api
```

## 📱 **User Experience**

### For Users:
- Click "Sign in with Google" on login page
- Choose Google account
- Automatically redirected to dashboard
- Profile picture imported from Google

### For Admins:
- Click "Sign in with Google" on admin login page
- Choose Google account (must be registered admin)
- Automatically redirected to admin dashboard
- Profile picture imported from Google

## 🔒 **Security Features**

- ✅ JWT tokens for session management
- ✅ Google token verification on backend
- ✅ Automatic account creation for new users
- ✅ Admin email validation
- ✅ Secure token storage in localStorage
- ✅ Automatic logout on token expiration

## 📊 **Database Changes**

The following fields have been added to User and Admin models:
- `googleId`: Unique Google user ID
- `profilePicture`: URL from Google profile
- `loginMethod`: 'email' or 'google'

## 🎉 **You're All Set!**

Your Google OAuth integration is now complete! Users and admins can sign in with their Google accounts seamlessly.

For any issues, check the troubleshooting section or review the console logs for detailed error messages.
