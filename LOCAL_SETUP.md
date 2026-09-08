# Local Development Setup Guide

This guide will help you set up and run the Fourie InternKatta project locally on your machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **MongoDB** (running locally or accessible)
- **Git** (for cloning the repository)

## Quick Start

### 1. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration

#### Backend Environment
1. Copy `backend/env.local` to `backend/.env`
2. Update the following variables in `backend/.env`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT tokens
   - `SMTP_USER` & `SMTP_PASS`: Your email credentials (if using email features)

#### Frontend Environment
1. Copy `frontend/env.local` to `frontend/.env.local`
2. The default configuration should work for local development

### 3. Database Setup

Make sure MongoDB is running and accessible. The default connection string is:
```
mongodb://localhost:27017/fourie_InternKatta
```

If you're using a different MongoDB setup, update the `MONGODB_URI` in your backend `.env` file.

### 4. Start the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:4000`

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:3000`

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **Uploads**: http://localhost:4000/uploads

## Development Scripts

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run build` - Build the application

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database and configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── uploads/           # File uploads
│   └── index.js           # Main server file
├── frontend/               # React frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── dist/              # Build output
└── LOCAL_SETUP.md         # This file
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Backend: Change `PORT` in `backend/.env`
   - Frontend: Change port in `frontend/vite.config.js`

2. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in `backend/.env`
   - Verify MongoDB service status

3. **CORS Errors**
   - Backend CORS is configured for local development
   - Check that frontend is running on allowed ports

4. **Module Not Found Errors**
   - Run `npm install` in both backend and frontend directories
   - Clear `node_modules` and reinstall if needed

### Database Issues

If you encounter database-related errors:
1. Check MongoDB connection
2. Verify database exists: `fourie_InternKatta`
3. Check if collections are properly initialized

## Development Workflow

1. **Backend Changes**: The server will automatically restart with nodemon
2. **Frontend Changes**: Vite provides hot module replacement
3. **API Testing**: Use tools like Postman or Thunder Client
4. **Database**: Use MongoDB Compass for database management

## Production Build

To build for production:

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Support

If you encounter any issues not covered in this guide:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that MongoDB is accessible

Happy coding! 🚀

