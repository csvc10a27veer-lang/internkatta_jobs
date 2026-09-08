const InternshipCategory = require('../models/internshipCategoryModel.js');
const asyncHandler = require('express-async-handler');

// @desc    Create a new internship category
// @route   POST /api/v1/internship-category/create
// @access  Private/Admin
const createInternshipCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Category name is required');
    }

    const categoryExists = await InternshipCategory.findOne({ name });

    if (categoryExists) {
        res.status(400);
        throw new Error('Category with this name already exists');
    }

    const category = await InternshipCategory.create({ name });

    if (category) {
        res.status(201).json({
            _id: category._id,
            name: category.name,
            message: "Category created successfully"
        });
    } else {
        res.status(400);
        throw new Error('Invalid category data');
    }
});

// @desc    Get all internship categories
// @route   GET /api/v1/internship-category/all
// @access  Public
const getAllInternshipCategories = asyncHandler(async (req, res) => {
    const categories = await InternshipCategory.find({}).sort({ createdAt: -1 });
    res.status(200).json(categories);
});

// @desc    Delete an internship category
// @route   DELETE /api/v1/internship-category/:id
// @access  Private/Admin
const deleteInternshipCategory = asyncHandler(async (req, res) => {
    const category = await InternshipCategory.findById(req.params.id);

    if (category) {
        await category.deleteOne();
        res.json({ message: 'Internship category removed' });
    } else {
        res.status(404);
        throw new Error('Internship category not found');
    }
});

// ** THIS IS THE MOST IMPORTANT PART **
// We are exporting an object that holds our functions.
module.exports = {
    createInternshipCategory,
    getAllInternshipCategories,
    deleteInternshipCategory
};