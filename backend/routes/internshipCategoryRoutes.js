// backend/routes/internshipCategoryRoutes.js

const express = require('express');
const router = express.Router();

const { 
    createInternshipCategory, 
    getAllInternshipCategories, 
    deleteInternshipCategory 
} = require('../controllers/internshipCategoryController.js');

// --- THIS IS THE FIX ---
// We now import the correct, existing middleware functions.
const { protectAdmin, isAdmin } = require('../middleware/authMiddleware.js');

// --- Public Route ---
// This route is for anyone to see the categories.
router.get('/all', getAllInternshipCategories);

// --- Admin Routes ---
// These routes are now correctly protected by the admin-specific guards.

// @route POST /api/v1/internship-category/create
router.post('/create', protectAdmin, isAdmin, createInternshipCategory);

// @route DELETE /api/v1/internship-category/:id
router.delete('/:id', protectAdmin, isAdmin, deleteInternshipCategory);

module.exports = router;