const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    reviewText: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Prevent a user from submitting more than one review per course
reviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });

// Static method to calculate and update average rating for a course
reviewSchema.statics.calculateAverageRating = async function(courseId) {
    const obj = await this.aggregate([
        {
            $match: { courseId: new mongoose.Types.ObjectId(courseId) } // Ensure courseId is an ObjectId
        },
        {
            $group: {
                _id: '$courseId',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    try {
        if (obj.length > 0) {
            await this.model('Course').findByIdAndUpdate(courseId, {
                averageRating: obj[0].averageRating,
                totalReviews: obj[0].totalReviews
            });
        } else {
            // If no reviews exist, reset to 0
            await this.model('Course').findByIdAndUpdate(courseId, {
                averageRating: 0,
                totalReviews: 0
            });
        }
    } catch (error) {
        console.error('Error calculating average rating:', error);
    }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function() {
    this.constructor.calculateAverageRating(this.courseId);
});

// Call calculateAverageRating after remove/deleteOne
reviewSchema.post('deleteOne', { document: true, query: false }, function() {
    this.constructor.calculateAverageRating(this.courseId);
});

module.exports = mongoose.model('Review', reviewSchema);
