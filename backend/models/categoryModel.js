// backend/models/categoryModel.js

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        unique: true, // No two categories can have the same name
        trim: true,   // Remove leading/trailing whitespace
    },
    slug: {
        type: String,
        unique: true,
        sparse: true, // This allows multiple null values but ensures uniqueness for non-null values
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
// Mongoose will create a collection named 'categories' for this model