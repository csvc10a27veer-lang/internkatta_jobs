// backend/routes/internshipRoutes.js

const express = require('express');
const router = express.Router();

const {
    createInternship,
    getAllInternships,
    deleteInternship,
    getInternshipById,
    updateInternship,
    getAllSubmissions,
    updateSubmissionStatus,
    // --- Add the new controller function here ---
    getInternshipDataForUser 
} = require('../controllers/internshipController.js');

// --- THIS IS THE CORRECTED IMPORT ---
// We import all necessary middleware functions in a single line.
const { protectUser, protectAdmin, isAdmin } = require('../middleware/authMiddleware.js');
const { uploadThumbnail, processThumbnail } = require('../middleware/uploadMiddleware.js');

// THE DUPLICATE IMPORT HAS BEEN REMOVED.

// ===================================================================
// --- PUBLIC ROUTES ---
// ===================================================================
router.get('/public/all', getAllInternships);
router.get('/public/:id', getInternshipById);

// ===================================================================
// --- PROTECTED USER ROUTES ---
// ===================================================================
// This is the efficient route that gets both details and progress
router.get('/user-data/:id', protectUser, getInternshipDataForUser);

// This is the old route, which you can keep for other purposes or remove
router.get('/user-view/:id', protectUser, getInternshipById);


// ===================================================================
// --- PROTECTED ADMIN ROUTES ---
// ===================================================================
router.post('/create', protectAdmin, isAdmin, uploadThumbnail.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }]), processThumbnail, createInternship);
router.get('/all', protectAdmin, isAdmin, getAllInternships);
router.get('/admin-view/:id', protectAdmin, isAdmin, getInternshipById);
router.put('/:id', protectAdmin, isAdmin, uploadThumbnail.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }]), processThumbnail, updateInternship);
router.delete('/:id', protectAdmin, isAdmin, deleteInternship);
router.get('/submissions/all', protectAdmin, isAdmin, getAllSubmissions);
router.put('/submissions/update-status', protectAdmin, isAdmin, updateSubmissionStatus);

// --- Export the router ---
module.exports = router;