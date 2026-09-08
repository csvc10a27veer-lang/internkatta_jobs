// backend/routes/categoryRoute.js

const express = require('express');
const router = express.Router();
const {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protectAdmin } = require('../middleware/authMiddleware');

// GET /api/categories - Public route (no auth required)
router.get('/', getCategories);

// POST /api/categories - Admin only
router.post('/', protectAdmin, addCategory);

// PUT /api/categories/:id - Admin only
router.put('/:id', protectAdmin, updateCategory);

// DELETE /api/categories/:id - Admin only
router.delete('/:id', protectAdmin, deleteCategory);

module.exports = router;