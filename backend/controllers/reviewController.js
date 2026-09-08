const Review = require('../models/reviewModel');
const Course = require('../models/courseModel');

// @desc    Create or update a review
// @route   POST /api/reviews/:courseId
// @access  Private (Logged in users only)
const createOrUpdateReview = async (req, res) => {
    try {
        const { rating, reviewText } = req.body;
        const { courseId } = req.params;
        const userId = req.user._id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5.' });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // Check if review already exists for this user and course
        let review = await Review.findOne({ courseId, userId });

        if (review) {
            // Update existing review
            review.rating = rating;
            review.reviewText = reviewText;
            await review.save();
            return res.status(200).json(review);
        } else {
            // Create new review
            review = await Review.create({
                courseId,
                userId,
                rating,
                reviewText
            });
            return res.status(201).json(review);
        }
    } catch (error) {
        console.error('Error creating/updating review:', error);
        res.status(500).json({ message: 'Server error while processing your review.' });
    }
};

// @desc    Get all reviews for a course
// @route   GET /api/reviews/:courseId
// @access  Public
const getCourseReviews = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Optionally, add pagination later
        const reviews = await Review.find({ courseId })
            .populate('userId', 'fullName profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error while fetching reviews.' });
    }
};

// @desc    Get the logged-in user's review for a course
// @route   GET /api/reviews/:courseId/my-review
// @access  Private
const getUserReview = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const review = await Review.findOne({ courseId, userId });
        
        if (review) {
            res.status(200).json(review);
        } else {
            res.status(200).json(null); // No review yet
        }
    } catch (error) {
        console.error('Error fetching user review:', error);
        res.status(500).json({ message: 'Server error while fetching user review.' });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        // Only the user who created it, or an admin can delete it
        if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this review.' });
        }

        // We use deleteOne so the post hook runs and recalculates average
        await review.deleteOne();
        res.status(200).json({ message: 'Review removed successfully.' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Server error while deleting review.' });
    }
};

module.exports = {
    createOrUpdateReview,
    getCourseReviews,
    getUserReview,
    deleteReview
};
