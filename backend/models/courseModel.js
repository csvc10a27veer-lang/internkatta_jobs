// backend/models/courseModel.js

const mongoose = require('mongoose');

// --- NEW: Define a schema for a single lecture ---
const lectureSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    videoUrl: {
        type: String, // We'll store the URL of the uploaded video here
    },
});

// --- NEW: Define a schema for a course section, which contains lectures ---
const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false, // Made optional to handle empty titles
        default: 'Untitled Section', // Provide a default value
    },
    lectures: [lectureSchema], // Each section has an array of lectures
});

// --- Main Course Schema (Upgraded) ---
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true }, // Added subtitle
    description: { type: String, required: true },
    smallDescription: { type: String }, // Summary for the hero banner
    category: { type: String, required: true },
    level: { type: String, required: true },
    tutor: { type: String, required: true },
    price: { type: Number, required: true },
    discountedPrice: { type: Number }, // Added discountedPrice
    thumbnailUrl: { type: String, required: true }, // Renamed from imageUrl for clarity
    bannerImageUrl: { type: String }, // Used on the Course Details page
    introVideoUrl: { type: String }, // Added introVideoUrl
    totalSizeBytes: { type: Number, default: 0 }, // Total size of media assets
    duration: { type: String, default: '1 Month' }, // e.g. "1 Month", "Self-paced"
    mode: { type: String, default: 'Online' }, // e.g. "Online", "Offline"
    projectsCount: { type: Number, default: 0 },
    seats: { type: String, default: 'Unlimited' }, // e.g. "Limited", "Unlimited", "100"
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    hasCertificate: { type: Boolean, default: true },
    whatYouWillLearn: { type: [String], default: [] },
    toolsAndTechnologies: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] },
    skills: { type: [String], default: [] },

    // --- ADD THE NEW SECTIONS ARRAY ---
    sections: [sectionSchema],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    // Soft delete fields
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Course', courseSchema);