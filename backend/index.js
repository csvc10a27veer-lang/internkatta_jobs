// backend/index.js

const express = require('express');

// Load production/local environment from .env
require('dotenv').config({ path: '.env' });
const connectDB = require('./config/dbconnection');
const cors = require('cors');
const path = require('path');

// --- Route Imports (All together) ---
const userRoute = require('./routes/userRoute');
const notificationRoute = require('./routes/notificationRoute');
const categoryRoute = require('./routes/categoryRoute');
const courseRoute = require('./routes/courseRoute');
const internshipCategoryRoutes = require('./routes/internshipCategoryRoutes.js');
const internshipRoutes = require('./routes/internshipRoutes.js');
const reviewRoute = require('./routes/reviewRoute');
const adminRoute = require('./routes/adminRoute'); // <-- 1. IMPORT THE NEW ADMIN ROUTE
const dashboardRoute = require('./routes/dashboardRoute');
const trainingRoutes = require('./routes/trainingRoutes');
const trainingProgramRoutes = require('./routes/trainingProgramRoutes');
const paymentRoute = require('./routes/paymentRoute'); // Payment routes
const contactRoute = require('./routes/contactRoute'); // Contact routes
const couponRoute = require('./routes/couponRoute'); // Coupon routes
const googleAuthRoute = require('./routes/googleAuthRoute'); // Google OAuth routes
const recycleBinRoute = require('./routes/recycleBinRoute'); // Recycle bin routes
const discussionRoute = require('./routes/discussionRoute'); // Q&A Discussion routes
const cartRoute = require('./routes/cartRoutes'); // Cart routes
// analytics & visit logging
const visitRoute = require('./routes/visits');
const analyticsRoute = require('./routes/analytics');
const { autoApprovePendingSubmissions } = require('./services/autoApprovalService');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Connect to DB
connectDB();

// --- Middleware Section ---
// CORS configuration
// NOTE: In production, Nginx handles CORS headers, so we disable Express CORS to avoid duplicates
// In development, Express handles CORS for direct backend access
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://192.168.1.3:3000',
  'http://192.168.1.3:5173',
  'https://internkatta.com',
  'https://www.internkatta.com',
  'https://api.internkatta.com'
];

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for dev
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  }
});

const userSockets = new Map();

io.on('connection', (socket) => {
    socket.on('register', (userId) => {
        if (userId) {
            const userIdStr = userId.toString();
            socket.join(userIdStr);
            userSockets.set(userIdStr, socket.id);
        }
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                break;
            }
        }
    });
});

app.set('io', io);
app.set('userSockets', userSockets);

// CORS Configuration
// IMPORTANT: In production, Nginx handles all CORS headers to avoid duplicates
// Only enable Express CORS for development/local access
// Check if we're in production OR if trust proxy is set (indicating behind Nginx)
const isProduction = process.env.NODE_ENV === 'production';
const isBehindProxy = true; // Always assume behind Nginx in production

// DISABLE CORS COMPLETELY - Nginx handles all CORS headers
// This prevents duplicate headers when behind nginx proxy
// Only enable for direct backend access (development without nginx)
if (!isProduction && !isBehindProxy) {
    // Development: Express handles CORS for direct backend access
    app.use(cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                // For local development, allow all origins
                callback(null, true);
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
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
        optionsSuccessStatus: 200,
    }));
    
    // Handle CORS preflight requests for file uploads (development only)
    app.options('*', cors());
} else {
    // Production or behind proxy: Disable Express CORS completely - Nginx handles it
    console.log('CORS disabled in backend (handled by Nginx proxy)');
}

// Set server timeout for large file uploads
app.use((req, res, next) => {
    // Increase timeout to 60 minutes for very large uploads
    req.setTimeout(3600000);
    res.setTimeout(3600000);
    next();
});

// Increase body parser limits for file uploads
// Note: For multipart/form-data (file uploads), multer handles parsing, not these limits
// But we increase them anyway for other endpoints and to be safe
app.use(express.json({ limit: '3gb' }));
app.use(express.urlencoded({ extended: false, limit: '3gb' }));

// Trust proxy to get correct protocol (HTTPS) in production
app.set('trust proxy', 1);

const helmet = require('helmet');

// Security middleware (Helmet sets CSP, X-Frame-Options, HSTS, X-Content-Type-Options, etc.)
// crossOriginResourcePolicy is set to false to allow images in /uploads to be loaded cross-origin
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Serve static files from the 'uploads' directory
// Fix L7: Set correct MIME types and long-lived cache headers for uploaded media.
// Express cannot reliably detect MIME from buffer-less streams, so we map by extension.
const mime = require('mime-types');
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  // 1-year immutable cache for thumbnails / uploaded assets
  maxAge: '1y',
  immutable: true,
  setHeaders(res, filePath) {
    // Derive MIME type from file extension; fall back to octet-stream only for truly unknown types
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    // Override the maxAge header for non-image files (e.g. raw uploads) to a shorter window
    if (!mimeType.startsWith('image/') && !mimeType.startsWith('video/')) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day for non-media
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));


// --- API Routes Section (All grouped together for clarity) ---

// Public Certificate Verification Route
const { verifyCertificate } = require('./controllers/userController');
app.get('/api/verify/:certificateId', verifyCertificate);

// Your existing routes:
app.use('/api/users', userRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/courses', courseRoute);
app.use('/api/discussions', discussionRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/cart', cartRoute); // Add cart routes
app.use('/api/notifications', notificationRoute);

// Your other v1 routes:
app.use('/api/v1/internship-category', internshipCategoryRoutes);
app.use('/api/v1/internships', internshipRoutes);

// Training routes
app.use('/api/training', trainingRoutes);
app.use('/api/training-programs', trainingProgramRoutes);

// Payment routes
app.use('/api/payment', paymentRoute);

// Contact routes
app.use('/api/contact', contactRoute);

// Coupon routes
app.use('/api/coupons', couponRoute);

// Google OAuth routes
app.use('/api/auth/google', googleAuthRoute);

// Recycle bin routes
app.use('/api/recycle-bin', recycleBinRoute);

// visit logging (public)
app.use('/api/visits', visitRoute);

// analytics endpoints (admin/protected if desired)
app.use('/api/analytics', analyticsRoute);

// --- 2. ADD THE NEW ADMIN ROUTE TO THE APP ---
// This handles requests like /api/admin/login and /api/admin/register
app.use('/api/admin', adminRoute);

// Dashboard stats route
app.use('/api/admin/dashboard', dashboardRoute);


// --- Global Error Handler ---
app.use((err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// --- Server Listener ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// --- Auto-Approval Scheduler ---
const AUTO_APPROVAL_INTERVAL = 5 * 60 * 1000; // 5 minutes
setTimeout(() => {
  console.log('[Auto-Approval] Scheduler started. Checking pending submissions every 5 minutes. Items older than 60 minutes will be auto-approved.');
  setInterval(async () => {
    await autoApprovePendingSubmissions();
  }, AUTO_APPROVAL_INTERVAL);
}, 10000); // start after 10 seconds to allow DB to connect