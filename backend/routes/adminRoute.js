// backend/routes/adminRoute.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protectAdmin, isAdmin } = require('../middleware/authMiddleware');
const { 
    registerAdmin, 
    loginAdmin, 
    getAllUsers, 
    getUserDetails, 
    suspendUser, 
    activateUser, 
    deleteUser,
    getCategoryFolders,
    getCategoryImages,
    uploadCategoryImage,
    deleteCategoryImage,
    createCategoryFolder,
    getInternshipLearningAnalytics,
    getLearnerProgressDetail
} = require('../controllers/adminController');

const { getCourseAnalysis, getInternshipAnalysis } = require('../controllers/adminAnalyticsController');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Get category folders (public endpoint - no auth required)
router.get('/category-folders', getCategoryFolders);
// Get images from a specific category folder (public endpoint - no auth required)
router.get('/category-images/:category', getCategoryImages);

// Multer configuration for category image uploads
const categoryImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Temporary upload location - will be moved to category folder in controller
        const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const uploadCategoryImageMulter = multer({ 
    storage: categoryImageStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Category image management routes (admin only)
router.post('/category-images/upload', protectAdmin, isAdmin, uploadCategoryImageMulter.single('image'), uploadCategoryImage);
router.delete('/category-images/:category/:imageName', protectAdmin, isAdmin, deleteCategoryImage);
router.post('/category-folders/create', protectAdmin, isAdmin, createCategoryFolder);

// User management routes (admin only)
router.get('/users', protectAdmin, isAdmin, getAllUsers);
router.get('/users/:id', protectAdmin, isAdmin, getUserDetails);
router.get('/internship-learning-analytics', protectAdmin, isAdmin, getInternshipLearningAnalytics);
router.get('/internship-learner-detail/:userId/:internshipId', protectAdmin, isAdmin, getLearnerProgressDetail);
router.put('/users/:id/suspend', protectAdmin, isAdmin, suspendUser);
router.put('/users/:id/activate', protectAdmin, isAdmin, activateUser);
router.delete('/users/:id', protectAdmin, isAdmin, deleteUser);

// Analytics routes
router.get('/analytics/courses', protectAdmin, isAdmin, getCourseAnalysis);
router.get('/analytics/internships', protectAdmin, isAdmin, getInternshipAnalysis);

module.exports = router;
