# Production Environment Configuration

## Overview
This project is configured for production deployment with HTTPS API endpoints.

## Environment Files

### Frontend Environment Files

#### `.env.production` (Production)
```
VITE_API_URL=https://api.InternKatta.gradezy.in
NODE_ENV=production
```

### Backend Environment Files

#### `.env.production` (Production)
```
MONGODB_URI=mongodb+srv://fouriseindia1:7UeakpxvP9ZdpIaN@cluster0.gzaimcz.mongodb.net/InternKatta?retryWrites=true&w=majority&appName=Cluster0
PORT=4000
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=https://InternKatta.gradezy.in
```

## How It Works

### Frontend API Configuration
- **File**: `frontend/src/utils/api.js`
- **Logic**: Uses production API URL
- **Production**: Uses `https://api.InternKatta.gradezy.in`

### Backend CORS Configuration
- **File**: `backend/index.js`
- **Allowed Origins**:
  - `https://InternKatta.gradezy.in` (production)
  - `https://www.InternKatta.gradezy.in` (production with www)

## Usage

### Production Deployment
1. **Backend**: Deploy with production environment variables
2. **Frontend**: Build with production environment variables
3. **Access**: `https://InternKatta.gradezy.in`

## API Calls
All API calls use the centralized `api` instance from `frontend/src/utils/api.js`:

```javascript
import api from '../utils/api';

// All API calls go to: https://api.InternKatta.gradezy.in
// Use: api.post('/api/...')
```

## Benefits
- ✅ Production-ready configuration
- ✅ No localhost references
- ✅ HTTPS API endpoints
- ✅ Centralized API configuration
- ✅ Automatic token handling
- ✅ Error handling

## Testing
- **Production**: All API calls will go to `api.InternKatta.gradezy.in`
- **CORS**: Properly configured for production environment

## Troubleshooting

### MongoDB Connection Issues

#### Common Symptoms
- `MongooseError: Operation buffering timed out after 10000ms`
- Login failures on frontend
- API calls returning timeout errors

#### Root Cause Checklist
1. **Check if `connectDB()` is called in `index.js`**
   ```javascript
   // Make sure this line exists and is executed
   connectDB();
   ```

2. **Verify MongoDB connection options**
   ```javascript
   // Remove deprecated options
   const conn = await mongoose.connect(process.env.MONGODB_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
     serverSelectionTimeoutMS: 10000,
     socketTimeoutMS: 45000
     // Remove: bufferCommands: false, bufferMaxEntries: 0
   });
   ```

3. **Check environment variables**
   ```bash
   cat .env
   # Verify MONGODB_URI is correct
   ```

4. **Test direct connection**
   ```bash
   # Create test file
   nano test_mongo.js
   ```
   ```javascript
   const mongoose = require('mongoose');
   require('dotenv').config();
   
   async function test() {
     try {
       await mongoose.connect(process.env.MONGODB_URI);
       console.log('✅ Connected successfully');
       await mongoose.disconnect();
     } catch (error) {
       console.error('❌ Connection failed:', error.message);
     }
   }
   test();
   ```

#### Debugging Steps
1. Check PM2 logs: `pm2 logs InternKatta-api`
2. Verify `.env` file has correct MongoDB URI
3. Ensure `connectDB()` is called in `index.js`
4. Remove deprecated mongoose options
5. Test direct connection with simple script
6. Restart PM2 process: `pm2 restart InternKatta-api`

#### Common Mistakes
- **Missing `connectDB()` call**: Most common cause of timeout errors
- **Deprecated options**: `bufferCommands`, `bufferMaxEntries` cause parse errors
- **Wrong cluster**: Using wrong MongoDB Atlas cluster credentials
- **Network issues**: Usually not the problem if direct connection works



