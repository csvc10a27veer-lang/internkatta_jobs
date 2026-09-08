// backend/routes/googleAuthRoute.js

const express = require('express');
const router = express.Router();
const { googleUserAuth, googleAdminAuth } = require('../controllers/googleAuthController');

// @route   POST /api/auth/google/user
// @desc    Google OAuth for users
// @access  Public
router.post('/user', googleUserAuth);

// @route   POST /api/auth/google/admin
// @desc    Google OAuth for admins
// @access  Public
router.post('/admin', googleAdminAuth);

module.exports = router;
