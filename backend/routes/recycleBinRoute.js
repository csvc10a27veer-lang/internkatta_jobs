// backend/routes/recycleBinRoute.js

const express = require('express');
const router = express.Router();
const {
    getDeletedItems,
    restoreCourse,
    restoreInternship,
    permanentDeleteCourse,
    permanentDeleteInternship
} = require('../controllers/recycleBinController');
const { protectAdmin, isAdmin } = require('../middleware/authMiddleware');

// Get all deleted items
router.get('/', protectAdmin, isAdmin, getDeletedItems);

// Restore course
router.post('/restore-course/:id', protectAdmin, isAdmin, restoreCourse);

// Restore internship
router.post('/restore-internship/:id', protectAdmin, isAdmin, restoreInternship);

// Permanently delete course
router.delete('/permanent-delete-course/:id', protectAdmin, isAdmin, permanentDeleteCourse);

// Permanently delete internship
router.delete('/permanent-delete-internship/:id', protectAdmin, isAdmin, permanentDeleteInternship);

module.exports = router;



