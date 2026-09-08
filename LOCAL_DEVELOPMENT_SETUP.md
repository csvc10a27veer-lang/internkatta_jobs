# Local Development Setup Guide

This guide will help you set up the Fourie InternKatta application for local development while keeping production credentials secure.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **Git**

## Quick Start

### Option 1: Using Startup Scripts (Recommended)

#### Windows (Command Prompt)
```bash
start-local-dev.bat
```

#### Windows (PowerShell)
```powershell
.\start-local-dev.ps1
```

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
cd backend
npm install
npm run dev:local
```

#### 2. Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev:local
```

## Environment Configuration

### Backend Environment Variables

1. Copy the environment template:
   ```bash
   cd backend
   copy env.example .env
   ```

2. Edit `.env` file with your local development values:
   ```env
   NODE_ENV=development
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/fourie_InternKatta
   FRONTEND_URL=http://localhost:5173
   
   # JWT Configuration
   JWT_SECRET=your_secure_jwt_secret_key_here
   JWT_EXPIRE=30d
   
   # Email Configuration (Gmail SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   
   # PhonePe Configuration (Test Environment)
   PHONEPE_MERCHANT_ID=your_test_merchant_id
   PHONEPE_SALT_KEY=your_test_salt_key
   PHONEPE_SALT_INDEX=1
   PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg/checkout
   PHONEPE_ENVIRONMENT=UAT
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

### Frontend Environment Variables

1. Copy the environment template:
   ```bash
   cd frontend
   copy env.example .env
   ```

2. Edit `.env` file with your local development values:
   ```env
   VITE_API_BASE_URL=http://localhost:4000
   VITE_APP_NAME=Fourie InternKatta
   VITE_APP_ENV=development
   
   # Google OAuth Configuration
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

## Required Services Setup

### 1. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Create database: `fourie_InternKatta`

#### Option B: MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in your `.env` file

### 2. Gmail SMTP Setup (for email functionality)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use your Gmail address and the app password in the `.env` file

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173` (for frontend)
   - `http://localhost:4000` (for backend)
6. Copy Client ID and Client Secret to your `.env` files

### 4. PhonePe Test Setup (for payment testing)

1. Sign up for PhonePe test merchant account
2. Get test credentials from PhonePe dashboard
3. Use test credentials in your `.env` file

## Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api-docs (if available)

## Production Credentials Security

Production credentials are stored in separate files:
- `backend/production.env` - Production backend configuration
- `frontend/production.env` - Production frontend configuration

**Important**: Never commit production credentials to version control. These files should be:
- Added to `.gitignore`
- Stored securely on production servers
- Not shared in development environments

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change PORT in backend `.env` file
   - Update frontend `VITE_API_BASE_URL` accordingly

2. **MongoDB connection failed**
   - Ensure MongoDB is running
   - Check connection string in `.env` file
   - Verify database name

3. **CORS errors**
   - Check `allowedOrigins` in backend `index.js`
   - Ensure frontend URL is included

4. **Google OAuth not working**
   - Verify Client ID in both frontend and backend `.env` files
   - Check authorized redirect URIs in Google Console

### Development Scripts

- `npm run dev:local` - Start development server with local environment
- `npm run dev` - Start development server (default)
- `npm run build` - Build for production
- `npm run build:prod` - Build with production environment

## Next Steps

1. Set up your environment variables
2. Install dependencies: `npm install` in both backend and frontend
3. Start the development servers
4. Begin development!

For production deployment, refer to `PRODUCTION_DEPLOYMENT.md`.
