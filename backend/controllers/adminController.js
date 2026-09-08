// backend/controllers/adminController.js

const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Internship = require('../models/internshipModel');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const generateToken = (id) => {
    // Use JWT_EXPIRE from env if available, otherwise default to 30d to match user tokens
    const expiresIn = process.env.JWT_EXPIRE || '30d';
    return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn });
};

const registerAdmin = async (req, res) => {
    try {
        const { fullName, email, phone, password, securityAnswer } = req.body; // phone & securityAnswer are included for compatibility
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Please enter name, email, and password' });
        }
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const admin = await Admin.create({ fullName, email, password });
        if (admin) {
            res.status(201).json({
                _id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                role: 'admin',
                token: generateToken(admin._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid admin data' });
        }
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (admin && (await admin.matchPassword(password))) {
            res.json({
                _id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                role: 'admin',
                token: generateToken(admin._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all users with their course and internship enrollments
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        
        // Build filter object
        const filter = { role: 'user' };
        if (status && status !== 'All') {
            filter.status = status;
        }
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;
        
        // Get users with populated enrollments
        const users = await User.find(filter)
            .select('-password -securityAnswer')
            .populate('enrolledCourses', 'title')
            .populate('enrolledInternships', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await User.countDocuments(filter);

        // Transform data for frontend
        const transformedUsers = users.map(user => ({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            registrationDate: user.createdAt,
            status: user.status || 'Active',
            coursesPurchased: user.enrolledCourses || [],
            internshipsPurchased: user.enrolledInternships || [],
            totalCourses: user.enrolledCourses ? user.enrolledCourses.length : 0,
            totalInternships: user.enrolledInternships ? user.enrolledInternships.length : 0
        }));

        res.json({
            success: true,
            users: transformedUsers,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};

// Get user details by ID
const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id)
            .select('-password -securityAnswer')
            .populate('enrolledCourses', 'title description thumbnail')
            .populate('enrolledInternships', 'title description thumbnail')
            .populate('courseProgress.courseId', 'title')
            .populate('internshipProgress.internshipId', 'title');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                registrationDate: user.createdAt,
                status: user.status || 'Active',
                enrolledCourses: user.enrolledCourses || [],
                enrolledInternships: user.enrolledInternships || [],
                courseProgress: user.courseProgress || [],
                internshipProgress: user.internshipProgress || []
            }
        });

    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user details'
        });
    }
};

// Suspend user
const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.status = 'Suspended';
        user.suspensionReason = reason;
        user.suspendedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'User suspended successfully',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({
            success: false,
            message: 'Error suspending user'
        });
    }
};

// Activate user
const activateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.status = 'Active';
        user.suspensionReason = undefined;
        user.suspendedAt = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'User activated successfully',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Error activating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error activating user'
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has any enrollments
        if (user.enrolledCourses.length > 0 || user.enrolledInternships.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete user with active enrollments. Please handle enrollments first.'
            });
        }

        await User.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
};

// Get list of category folders from assets/Categories
const getCategoryFolders = async (req, res) => {
    try {
        // Path to Categories folder (relative to backend directory)
        const categoriesPath = path.join(__dirname, '../../frontend/public/assets/Categories');
        
        // Check if directory exists
        if (!fs.existsSync(categoriesPath)) {
            return res.status(200).json({
                success: true,
                categories: []
            });
        }

        // Read directory contents
        const items = fs.readdirSync(categoriesPath, { withFileTypes: true });
        
        // Filter only directories (folders)
        const folders = items
            .filter(item => item.isDirectory())
            .map(item => item.name)
            .sort(); // Sort alphabetically

        res.status(200).json({
            success: true,
            categories: folders
        });
    } catch (error) {
        console.error('Error reading category folders:', error);
        res.status(500).json({
            success: false,
            message: 'Error reading category folders',
            categories: []
        });
    }
};

// Get list of image files from a specific category folder
const getCategoryImages = async (req, res) => {
    try {
        const { category } = req.params;
        
        if (!category || category.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
                images: []
            });
        }

        // Path to specific category folder (relative to backend directory)
        const categoryPath = path.join(__dirname, '../../frontend/public/assets/Categories', category);
        
        // Check if directory exists
        if (!fs.existsSync(categoryPath)) {
            return res.status(200).json({
                success: true,
                images: []
            });
        }

        // Read directory contents
        const items = fs.readdirSync(categoryPath, { withFileTypes: true });
        
        // Filter only image files (png, jpg, jpeg, gif, webp)
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
        const images = items
            .filter(item => {
                if (!item.isFile()) return false;
                const ext = path.extname(item.name).toLowerCase();
                return imageExtensions.includes(ext);
            })
            .map(item => ({
                name: item.name,
                path: `/assets/Categories/${category}/${item.name}`
            }))
            .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

        res.status(200).json({
            success: true,
            images: images
        });
    } catch (error) {
        console.error('Error reading category images:', error);
        res.status(500).json({
            success: false,
            message: 'Error reading category images',
            images: []
        });
    }
};

// Upload image to a category folder
const uploadCategoryImage = async (req, res) => {
    try {
        const { category } = req.body;
        
        if (!category || category.trim() === '') {
            // Clean up temp file if exists
            if (req.file && req.file.path) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (err) {
                    console.error('Error cleaning up temp file:', err);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Path to specific category folder
        const categoryPath = path.join(__dirname, '../../frontend/public/assets/Categories', category);
        
        // Create folder if it doesn't exist
        if (!fs.existsSync(categoryPath)) {
            fs.mkdirSync(categoryPath, { recursive: true });
        }

        // Get original filename and convert to WebP
        const originalName = req.file.originalname;
        const nameWithoutExt = path.parse(originalName).name;
        const webpFileName = `${nameWithoutExt}.webp`;
        const targetPath = path.join(categoryPath, webpFileName);

        // Check if file already exists
        if (fs.existsSync(targetPath)) {
            // Clean up temp file
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Error cleaning up temp file:', err);
            }
            return res.status(400).json({
                success: false,
                message: 'Image with this name already exists'
            });
        }

        // Convert image to WebP format and save
        try {
            await sharp(req.file.path)
                .webp({ quality: 90 }) // High quality WebP conversion
                .toFile(targetPath);
            
            // Clean up the temporary uploaded file
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Error cleaning up temp file:', err);
            }
        } catch (conversionError) {
            console.error('Error converting image to WebP:', conversionError);
            // Clean up temp file on error
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Error cleaning up temp file:', err);
            }
            return res.status(500).json({
                success: false,
                message: 'Error converting image to WebP format'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Image uploaded and converted to WebP successfully',
            image: {
                name: webpFileName,
                path: `/assets/Categories/${category}/${webpFileName}`
            }
        });
    } catch (error) {
        console.error('Error uploading category image:', error);
        // Clean up temp file on error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Error cleaning up temp file:', err);
            }
        }
        res.status(500).json({
            success: false,
            message: 'Error uploading category image'
        });
    }
};

// Delete image from a category folder
const deleteCategoryImage = async (req, res) => {
    try {
        const { category, imageName } = req.params;
        
        if (!category || category.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        if (!imageName || imageName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Image name is required'
            });
        }

        // Path to image file
        const imagePath = path.join(__dirname, '../../frontend/public/assets/Categories', category, imageName);
        
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Delete the file
        fs.unlinkSync(imagePath);

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category image:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting category image'
        });
    }
};

// Create a new category folder
const createCategoryFolder = async (req, res) => {
    try {
        const { folderName } = req.body;
        
        if (!folderName || folderName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Folder name is required'
            });
        }

        // Sanitize folder name (remove invalid characters)
        const sanitizedFolderName = folderName.trim().replace(/[^a-zA-Z0-9-_]/g, '');
        
        if (sanitizedFolderName === '') {
            return res.status(400).json({
                success: false,
                message: 'Invalid folder name'
            });
        }

        // Path to Categories folder
        const categoriesPath = path.join(__dirname, '../../frontend/public/assets/Categories');
        const folderPath = path.join(categoriesPath, sanitizedFolderName);
        
        // Check if folder already exists
        if (fs.existsSync(folderPath)) {
            return res.status(400).json({
                success: false,
                message: 'Folder already exists'
            });
        }

        // Create the folder
        fs.mkdirSync(folderPath, { recursive: true });

        res.status(200).json({
            success: true,
            message: 'Folder created successfully',
            folderName: sanitizedFolderName
        });
    } catch (error) {
        console.error('Error creating category folder:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating category folder'
        });
    }
};

// Internship learning analytics for admin dashboard
const getInternshipLearningAnalytics = async (req, res) => {
    try {
        const internshipBuyerFilter = {
            role: 'user',
            'enrolledInternships.0': { $exists: true }
        };

        const totalUsers = await User.countDocuments({ role: 'user' });
        const usersWithInternshipPurchases = await User.countDocuments(internshipBuyerFilter);

        const users = await User.find(internshipBuyerFilter)
            .select('fullName email createdAt enrolledInternships internshipProgress')
            .populate('enrolledInternships', 'title lectures')
            .populate('internshipProgress.internshipId', 'title lectures');

        const progressRows = [];

        users.forEach((user) => {
            const enrolledInternships = user.enrolledInternships || [];
            const progressByInternship = new Map(
                (user.internshipProgress || []).map((progress) => [
                    progress.internshipId?._id?.toString() || progress.internshipId?.toString(),
                    progress
                ])
            );

            enrolledInternships.forEach((internship) => {
                const internshipId = internship._id.toString();
                const progress = progressByInternship.get(internshipId);
                const totalLectures = internship.lectures?.length || 0;
                const lectureStatuses = progress?.completedLectures || [];

                const completedCount = lectureStatuses.filter((lecture) => lecture.status === 'Completed').length;
                const approvedCount = lectureStatuses.filter((lecture) => lecture.status === 'Approved').length;
                const pendingCount = lectureStatuses.filter((lecture) => lecture.status === 'Pending').length;
                const rejectedCount = lectureStatuses.filter((lecture) => lecture.status === 'Rejected').length;
                const startedCount = lectureStatuses.filter((lecture) => lecture.status && lecture.status !== 'Not Started').length;
                const progressPercent = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;
                const lastActivity = lectureStatuses
                    .map((lecture) => lecture.submittedAt)
                    .filter(Boolean)
                    .sort((a, b) => new Date(b) - new Date(a))[0] || null;

                progressRows.push({
                    userId: user._id,
                    userName: user.fullName,
                    userEmail: user.email,
                    joinedAt: user.createdAt,
                    internshipId: internship._id,
                    internshipTitle: internship.title,
                    totalLectures,
                    startedCount,
                    completedCount,
                    approvedCount,
                    pendingCount,
                    rejectedCount,
                    progressPercent,
                    isCompleted: totalLectures > 0 && completedCount === totalLectures,
                    lastActivity,
                });
            });
        });

        const totalEnrollments = progressRows.length;
        const totalLearners = new Set(progressRows.map((row) => row.userId.toString())).size;
        const completedEnrollments = progressRows.filter((row) => row.isCompleted).length;
        const activeEnrollments = progressRows.filter((row) => row.startedCount > 0 && !row.isCompleted).length;
        const averageProgress = totalEnrollments > 0
            ? Math.round(progressRows.reduce((sum, row) => sum + row.progressPercent, 0) / totalEnrollments)
            : 0;

        const topInternships = Object.values(progressRows.reduce((acc, row) => {
            if (!acc[row.internshipId]) {
                acc[row.internshipId] = {
                    internshipId: row.internshipId,
                    internshipTitle: row.internshipTitle,
                    learners: 0,
                    averageProgress: 0,
                    completedEnrollments: 0,
                    totalProgress: 0,
                };
            }

            acc[row.internshipId].learners += 1;
            acc[row.internshipId].totalProgress += row.progressPercent;
            if (row.isCompleted) {
                acc[row.internshipId].completedEnrollments += 1;
            }

            return acc;
        }, {})).map((item) => ({
            ...item,
            averageProgress: item.learners > 0 ? Math.round(item.totalProgress / item.learners) : 0,
        })).sort((a, b) => b.learners - a.learners || b.averageProgress - a.averageProgress);

        res.json({
            success: true,
            data: {
                summary: {
                    totalUsers,
                    usersWithInternshipPurchases,
                    totalLearners,
                    totalEnrollments,
                    completedEnrollments,
                    activeEnrollments,
                    averageProgress,
                },
                topInternships,
                rows: progressRows.sort((a, b) => b.progressPercent - a.progressPercent || new Date(b.joinedAt) - new Date(a.joinedAt)),
            }
        });
    } catch (error) {
        console.error('Error fetching internship learning analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching internship learning analytics'
        });
    }
};

module.exports = { 
    registerAdmin, 
    loginAdmin, 
    getAllUsers, 
    getUserDetails, 
    suspendUser, 
    activateUser, 
    deleteUser,
    getCategoryFolders,
    getCategoryImages,
    uploadCategoryImage,
    deleteCategoryImage,
    createCategoryFolder,
    getInternshipLearningAnalytics
};
