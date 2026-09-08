const mongoose = require('mongoose');

const internshipCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    unique: true,
    trim: true,
  },
}, { timestamps: true });

// --- THIS IS THE CRITICAL LINE ---
// This exports the compiled model named "InternshipCategory".
module.exports = mongoose.model('InternshipCategory', internshipCategorySchema);