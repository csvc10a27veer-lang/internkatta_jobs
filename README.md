# Fourie InternKatta Learning Platform

A comprehensive learning platform for courses, internships, and training programs.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v16+)
- MongoDB running locally
- Git

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Environment Setup
1. Copy `backend/env.local` to `backend/.env`
2. Copy `frontend/env.local` to `frontend/.env.local`
3. Update MongoDB connection in `backend/.env`

### 3. Start Development Servers
```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend    # Backend on http://localhost:4000
npm run dev:frontend   # Frontend on http://localhost:3000
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **Uploads**: http://localhost:4000/uploads

## 📁 Project Structure
- `backend/` - Node.js/Express API server
- `frontend/` - React frontend application
- `uploads/` - File uploads and media

## 🔧 Available Scripts
- `npm run dev` - Start both services
- `npm run build` - Build frontend for production
- `npm run start` - Start backend in production mode
- `npm run clean` - Clean all node_modules

## 📚 Documentation
- [Local Setup Guide](LOCAL_SETUP.md) - Detailed local development setup
- [Production Deployment](PRODUCTION_DEPLOYMENT.md) - Production deployment guide

## 🆘 Need Help?
Check the [Local Setup Guide](LOCAL_SETUP.md) for detailed troubleshooting and configuration options.














