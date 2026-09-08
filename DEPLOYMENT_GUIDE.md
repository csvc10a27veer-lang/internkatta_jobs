# InternKatta Production Deployment Guide

## 🚀 Production Configuration

### Frontend Configuration
- **Domain**: https://InternKatta.gradezy.in
- **API URL**: https://api.InternKatta.gradezy.in

### Backend Configuration
- **Domain**: https://api.InternKatta.gradezy.in
- **Port**: 4000
- **Database**: MongoDB Atlas

### Database Configuration
- **MongoDB URI**: mongodb+srv://fouriseindia1:7UeakpxvP9ZdpIaN@cluster0.gzaimcz.mongodb.net/InternKatta?retryWrites=true&w=majority&appName=Cluster0
- **Database Name**: InternKatta

### Payment Gateway (PhonePe)
- **Merchant ID**: SU2508251500285640112856
- **Salt Key**: 006c20b2-0a39-423a-9cd3-8e359879dd15
- **Salt Index**: 1
- **Environment**: PRODUCTION
- **Base URL**: https://api.phonepe.com/apis/pg/checkout

## 📁 Environment Files

### Frontend Environment (.env.production)
```env
VITE_API_URL=https://api.InternKatta.gradezy.in
NODE_ENV=production
```

### Backend Environment (.env.production)
```env
MONGODB_URI=mongodb+srv://fouriseindia1:7UeakpxvP9ZdpIaN@cluster0.gzaimcz.mongodb.net/InternKatta?retryWrites=true&w=majority&appName=Cluster0
PORT=4000
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=https://InternKatta.gradezy.in
NODE_ENV=production

# PhonePe Payment Gateway Configuration
PHONEPE_MERCHANT_ID=SU2508251500285640112856
PHONEPE_SALT_KEY=006c20b2-0a39-423a-9cd3-8e359879dd15
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg/checkout
PHONEPE_ENVIRONMENT=PRODUCTION
```

## 🔧 Deployment Steps

### 1. Frontend Deployment
```bash
cd frontend
npm install
npm run build
# Deploy the 'dist' folder to your hosting provider
```

### 2. Backend Deployment
```bash
cd backend
npm install
# Set environment variables
cp production.env .env
# Start the server
npm start
```

### 3. Database Setup
- MongoDB Atlas cluster is already configured
- Database name: InternKatta
- Connection string is in the environment file

### 4. Domain Configuration
- Frontend: InternKatta.gradezy.in → Frontend build files
- Backend: api.InternKatta.gradezy.in → Backend server (port 4000)

## 🔐 Security Considerations

1. **JWT Secret**: Update `JWT_SECRET` in backend environment
2. **CORS**: Already configured for production domains
3. **HTTPS**: Ensure SSL certificates are installed
4. **Environment Variables**: Never commit .env files to version control

## 📋 API Endpoints

All API endpoints are now configured to use:
- Base URL: https://api.InternKatta.gradezy.in
- Frontend URL: https://InternKatta.gradezy.in

## 🎯 Payment Integration

PhonePe payment gateway is configured for production:
- Callback URL: https://InternKatta.gradezy.in/api/payment/callback
- Redirect URL: https://InternKatta.gradezy.in/payment/callback

## ✅ Verification Checklist

- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] Database connection established
- [ ] CORS configuration allows frontend domain
- [ ] Payment gateway credentials are correct
- [ ] SSL certificates are installed
- [ ] Environment variables are set correctly

## 🚨 Important Notes

1. **JWT Secret**: Generate a strong JWT secret for production
2. **Database**: Ensure MongoDB Atlas allows connections from your server IP
3. **Payment**: Test payment flow in production environment
4. **Monitoring**: Set up error monitoring and logging
5. **Backup**: Regular database backups recommended

## 📞 Support

For deployment issues, check:
1. Server logs for errors
2. Network connectivity
3. Environment variable configuration
4. Database connection status
