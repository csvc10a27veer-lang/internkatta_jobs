const express = require('express');
const router = express.Router();
const {
    createOrUpdateReview,
    getCourseReviews,
    getUserReview,
    deleteReview
} = require('../controllers/reviewController');
const { protectUser } = require('../middleware/authMiddleware');

// Public route to get all reviews for a course
router.get('/course/:courseId', getCourseReviews);

// Protected routes (requires user login)
router.get('/course/:courseId/my-review', protectUser, getUserReview);
router.post('/course/:courseId', protectUser, createOrUpdateReview);
router.delete('/:reviewId', protectUser, deleteReview);

module.exports = router;
