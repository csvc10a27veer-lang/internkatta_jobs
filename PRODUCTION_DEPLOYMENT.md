# 🚀 Production Deployment Guide

## Overview
This guide will help you deploy your InternKatta application to production.

## 🌐 Production URLs
- **Frontend**: `https://InternKatta.gradezy.in`
- **Backend API**: `https://api.InternKatta.gradezy.in`
- **Database**: MongoDB Atlas (Cloud)

## 📋 Prerequisites
1. **Domain**: `InternKatta.gradezy.in` configured
2. **SSL Certificate**: HTTPS enabled
3. **Server**: VPS or cloud server running
4. **Database**: MongoDB Atlas cluster
5. **PM2**: For process management

## 🔧 Environment Configuration

### Frontend (`.env.production`)
```env
VITE_API_URL=https://api.InternKatta.gradezy.in
NODE_ENV=production
```

### Backend (`.env.production`)
```env
MONGODB_URI=mongodb+srv://fouriseindia1:7UeakpxvP9ZdpIaN@cluster0.gzaimcz.mongodb.net/InternKatta?retryWrites=true&w=majority&appName=Cluster0
PORT=4000
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=https://InternKatta.gradezy.in
```

## 🚀 Deployment Steps

### 1. Build Frontend
```bash
cd frontend
npm run build:prod
```

### 2. Deploy Frontend
Upload the `dist/` folder to your web server at `InternKatta.gradezy.in`

### 3. Deploy Backend
```bash
cd backend
pm2 start index.js --name InternKatta-api
pm2 save
pm2 startup
```

### 4. Update Database URLs
```bash
cd backend
node fix_course_urls.js
node fix_internship_urls.js
```

## 🔒 Security Checklist
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] CORS configured for production domains
- [ ] JWT secret updated
- [ ] Database connection secured
- [ ] PM2 process management enabled

## 📊 Monitoring
- **PM2 Status**: `pm2 status`
- **PM2 Logs**: `pm2 logs InternKatta-api`
- **PM2 Monitor**: `pm2 monit`

## 🆘 Troubleshooting
- **Check PM2 logs**: `pm2 logs InternKatta-api`
- **Verify environment variables**: `pm2 env InternKatta-api`
- **Restart service**: `pm2 restart InternKatta-api`
- **Check CORS**: Verify allowed origins in backend

## 🎉 Success Indicators
- Frontend loads at `https://InternKatta.gradezy.in`
- API responds at `https://api.InternKatta.gradezy.in`
- Authentication works
- Payments process correctly
- Database connections stable

## 📞 Support
If you encounter issues, check:
1. PM2 logs
2. Environment variables
3. CORS configuration
4. Database connectivity
5. SSL certificate validity
