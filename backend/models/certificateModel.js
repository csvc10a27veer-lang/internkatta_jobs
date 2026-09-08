const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    certificateId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        default: null
    },
    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        default: null
    },
    type: {
        type: String,
        required: true,
        enum: ['course', 'internship']
    },
    issueDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'revoked'],
        default: 'active'
    },
    verificationCount: {
        type: Number,
        required: true,
        default: 0
    },
    linkedinShareCount: {
        type: Number,
        required: true,
        default: 0
    },
    lastVerifiedAt: {
        type: Date,
        default: null
    },
    shareUrl: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Primary unique index
certificateSchema.index({ certificateId: 1 }, { unique: true });
certificateSchema.index({ userId: 1 });

// Separate unique indexes with partialFilterExpression
certificateSchema.index(
    { userId: 1, courseId: 1 },
    { 
        unique: true, 
        partialFilterExpression: { courseId: { $type: 'objectId' } } 
    }
);

certificateSchema.index(
    { userId: 1, internshipId: 1 },
    { 
        unique: true, 
        partialFilterExpression: { internshipId: { $type: 'objectId' } } 
    }
);

module.exports = mongoose.model('Certificate', certificateSchema);
