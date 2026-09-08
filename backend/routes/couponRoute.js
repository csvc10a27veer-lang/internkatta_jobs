// backend/routes/couponRoute.js

const express = require('express');
const router = express.Router();
const { protectUser, protectAdmin, isAdmin, optionalUser } = require('../middleware/authMiddleware');

const {
    createCoupon,
    getCoupons,
    getCouponsByItem,
    validateCoupon,
    applyCoupon,
    deleteCoupon,
    updateCoupon
} = require('../controllers/couponController');

// --- ADMIN ROUTES ---
// Create a new coupon
router.post('/', protectAdmin, isAdmin, createCoupon);

// Get all coupons
router.get('/', protectAdmin, isAdmin, getCoupons);

// Get coupons for a specific course or internship
router.get('/item/:itemType/:itemId', protectAdmin, isAdmin, getCouponsByItem);

// Update coupon
router.put('/:id', protectAdmin, isAdmin, updateCoupon);

// Delete coupon
router.delete('/:id', protectAdmin, isAdmin, deleteCoupon);

// --- USER ROUTES ---
// Validate coupon (check if valid without applying)
router.post('/validate', optionalUser, validateCoupon);

// Apply coupon (validate and mark as used)
router.post('/apply', protectUser, applyCoupon);

module.exports = router;
