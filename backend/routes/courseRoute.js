// backend/routes/courseRoute.js

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

// --- 1. UPDATE THIS IMPORT ---
// We now import the specific protection middlewares we created.
const { protectUser, protectAdmin, isAdmin } = require('../middleware/authMiddleware');

const {
    getCourses,
    addCourse,
    deleteCourse,
    getCourseById,
    updateCourse,
    getCourseForEnrolledUser,
    getCourseDataForUser // <-- 1. IMPORT THE NEW FUNCTION
} = require('../controllers/courseController');


// Multer Configuration for handling file uploads (No changes here)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 * 1024, // 2GB per file
        fieldSize: 100 * 1024 * 1024, // 100MB for form fields
        files: 101 // Allow up to 101 files (1 thumbnail + 1 intro + 99 lecture videos)
    }
});

const courseUploads = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 },
    { name: 'introVideo', maxCount: 1 },
    { name: 'lectureVideos', maxCount: 100 }
]);


// --- PUBLIC ROUTES (No changes here) ---
// These routes can be accessed by anyone.
router.get('/', getCourses);
router.get('/:id', getCourseById);


// --- PRIVATE ADMIN-ONLY ROUTES ---
// These routes now require a valid ADMIN token.

// POST a new course
router.post('/', protectAdmin, isAdmin, courseUploads, addCourse);

// PUT (update) an existing course by its ID
router.put('/:id', protectAdmin, isAdmin, courseUploads, updateCourse);

// DELETE a course by its ID
router.delete('/:id', protectAdmin, isAdmin, deleteCourse);


// --- PRIVATE USER-ONLY ROUTES ---
// These routes now require a valid USER token.
router.get('/player/:id', protectUser, getCourseForEnrolledUser);

// --- 2. ADD THE NEW PROTECTED ROUTE ---
// This route is for the course player to get all data at once.
router.get('/user-data/:id', protectUser, getCourseDataForUser);


module.exports = router;