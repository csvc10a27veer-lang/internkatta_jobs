# 🔧 CORS Fix Guide - 413 + CORS Errors

## 🎯 **Issues Fixed:**

1. ✅ **413 Content Too Large Error** - File upload size limits
2. ✅ **CORS Policy Error** - Missing Access-Control-Allow-Origin headers

## 🔧 **Changes Made:**

### **1. Backend Express.js Limits (backend/index.js):**
```javascript
// Increased body parser limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
```

### **2. Backend Multer Limits (backend/middleware/uploadMiddleware.js):**
```javascript
const uploadSubmission = multer({ 
    storage: submissionStorage, 
    fileFilter: anyFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit for task submissions
    }
});
```

### **3. Enhanced CORS Configuration (backend/index.js):**
```javascript
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            if (process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type", 
        "Authorization", 
        "admin-authorization", 
        "user-authorization",
        "X-Requested-With",
        "Accept",
        "Origin"
    ],
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser support
}));

// Handle CORS preflight requests for file uploads
app.options('*', cors());
```

### **4. Route-Specific CORS Handler (backend/routes/userRoute.js):**
```javascript
// Handle CORS preflight for file uploads
router.options('/submit-task', cors());
router.post('/submit-task', protectUser, uploadSubmission.single('submissionFile'), submitTask);
```

### **5. Frontend File Size Validation (frontend/src/userDashboard/InternshipView.jsx):**
```javascript
const handleFileChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        
        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (file.size > maxSize) {
            toast.error('File size too large! Please select a file smaller than 50MB.');
            return;
        }
        
        setIsUploading(true);
        await handleTaskSubmit(activeLecture._id, file);
        setIsUploading(false);
    }
};
```

## 🚀 **Deploy the Fix:**

```bash
# Deploy the changes
git add .
git commit -m "Fix CORS and 413 errors: Enhanced CORS config, file size limits, and client-side validation"
git push origin main

# On your VPS
cd /var/www/Fourie_InternKatta
git pull origin main
cd backend
pm2 restart backend
cd ../frontend
npm run build
```

## 🧪 **Test the Fix:**

### **Test 1: File Upload Size**
1. Try uploading a file smaller than 50MB ✅ Should work
2. Try uploading a file larger than 50MB ✅ Should show client-side error

### **Test 2: CORS Headers**
1. Open browser dev tools → Network tab
2. Submit a task with an image
3. Check the request headers:
   - ✅ Should see `Access-Control-Allow-Origin: https://InternKatta.gradezy.in`
   - ✅ Should see `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
   - ✅ Should see `Access-Control-Allow-Headers: Content-Type, Authorization, ...`

### **Test 3: Preflight Requests**
1. Check for OPTIONS requests in Network tab
2. ✅ Should see successful OPTIONS request before POST request
3. ✅ No CORS errors in console

## 📋 **What This Fixes:**

### **413 Content Too Large:**
- ✅ Express.js body parser now accepts up to 50MB
- ✅ Multer file upload limit set to 50MB
- ✅ Client-side validation prevents oversized uploads

### **CORS Policy Errors:**
- ✅ Added OPTIONS method to allowed methods
- ✅ Enhanced allowed headers for file uploads
- ✅ Added preflight request handler
- ✅ Route-specific CORS handler for submit-task
- ✅ Legacy browser support with optionsSuccessStatus

## 🔍 **Debugging:**

If you still see CORS errors:

1. **Check Network Tab:**
   - Look for OPTIONS request (preflight)
   - Check response headers for CORS headers

2. **Check Console:**
   - Should see no CORS errors
   - Should see successful API calls

3. **Check Backend Logs:**
   - Should see successful file uploads
   - No 413 errors

## 🎉 **Expected Results:**

- ✅ **No more 413 errors** when uploading files
- ✅ **No more CORS errors** in browser console
- ✅ **Successful task submissions** with images
- ✅ **Better user experience** with clear error messages

The combination of these fixes should resolve both the 413 Content Too Large error and the CORS policy error! 🚀
