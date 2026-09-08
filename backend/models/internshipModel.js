// backend/models/internshipModel.js

// Change 'import' to 'require'
const mongoose = require('mongoose');

// --- NEW: Schema for a single MCQ question ---
const mcqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String],
        required: true,
        // This validation ensures there are always exactly 4 options
        validate: [
            (val) => val.length === 4,
            'There must be exactly 4 options for an MCQ.'
        ]
    },
    correctAnswer: {
        type: Number, // This will be the index (0, 1, 2, or 3) of the correct option
        required: true,
        min: 0,
        max: 3
    }
// --- THIS IS THE FIX ---
// Change `{ _id: false }` to `{ _id: true }`.
// This forces Mongoose to generate a unique ObjectId for each MCQ,
// which is required by the frontend to submit the quiz answers correctly.
}, { _id: true });

// Content section schema for alternating layout
const contentSectionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'image', 'code'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false // Optional for backward compatibility
    },
    alignment: {
        type: String,
        enum: ['left', 'right'],
        default: 'left'
    },
    language: {
        type: String,
        required: false // Optional, only for code sections
    }
}, { _id: true });

// The schemas are perfectly fine, no changes needed here
const lectureSchema = new mongoose.Schema({
    lectureTitle: {
        type: String,
        required: true,
    },
    lectureDescription: {
        type: String,
    },
    lectureContent: {
        type: String,
    },
    contentSections: [contentSectionSchema], // New field for section-wise content
    codeSnippet: {
        type: String,
    },
    taskPrompt: {
        type: String,
        required: true,
    },
    // This field includes the updated mcqSchema
    mcqs: [mcqSchema]
});

const internshipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Internship title is required"],
    },
    description: {
        type: String,
        required: [true, "A main description for the internship is required."],
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InternshipCategory',
        required: [true, "Internship category is required"],
    },
    tutor: {
        type: String,
        required: [true, "Tutor/Guide name is required"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        default: 0,
    },
    discountedPrice: {
        type: Number,
        default: null,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    duration: {
        type: String,
        required: [true, "Duration is required"],
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate',
    },
    smallDescription: { type: String },
    whatYouWillLearn: { type: [String], default: [] },
    toolsAndTechnologies: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    hasCertificate: { type: Boolean, default: true },
    projectsCount: { type: Number, default: 0 },
    seats: { type: String, default: 'Unlimited' },
    mode: { type: String, default: 'Online' },
    thumbnail: {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
    },
    bannerImage: {
        public_id: { type: String },
        url: { type: String },
    },
    lectures: [lectureSchema],
    // Soft delete fields
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });


// Instead of creating a variable and then exporting it,
// we compile and export the model in one direct line.
module.exports = mongoose.model("Internship", internshipSchema);