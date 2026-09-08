// backend/controllers/recycleBinController.js

const Course = require('../models/courseModel');
const Internship = require('../models/internshipModel');
const fs = require('fs');
const path = require('path');

// @desc    Get all deleted items (courses and internships)
// @route   GET /api/recycle-bin
// @access  Private/Admin
const getDeletedItems = async (req, res) => {
    try {
        const deletedCourses = await Course.find({ deleted: true })
            .populate('createdBy', 'fullName email')
            .sort({ deletedAt: -1 });

        const deletedInternships = await Internship.find({ deleted: true })
            .populate('category', 'name')
            .sort({ deletedAt: -1 });

        res.status(200).json({
            success: true,
            courses: deletedCourses,
            internships: deletedInternships,
            totalCourses: deletedCourses.length,
            totalInternships: deletedInternships.length
        });
    } catch (error) {
        console.error('Error fetching deleted items:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Restore a course
// @route   POST /api/recycle-bin/restore-course/:id
// @access  Private/Admin
const restoreCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        if (!course.deleted) {
            return res.status(400).json({ success: false, message: 'Course is not deleted' });
        }

        course.deleted = false;
        course.deletedAt = null;
        await course.save();

        res.status(200).json({ success: true, message: 'Course restored successfully', course });
    } catch (error) {
        console.error('Error restoring course:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Restore an internship
// @route   POST /api/recycle-bin/restore-internship/:id
// @access  Private/Admin
const restoreInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }
        if (!internship.deleted) {
            return res.status(400).json({ success: false, message: 'Internship is not deleted' });
        }

        internship.deleted = false;
        internship.deletedAt = null;
        await internship.save();

        res.status(200).json({ success: true, message: 'Internship restored successfully', internship });
    } catch (error) {
        console.error('Error restoring internship:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Permanently delete a course
// @route   DELETE /api/recycle-bin/permanent-delete-course/:id
// @access  Private/Admin
const permanentDeleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        if (!course.deleted) {
            return res.status(400).json({ success: false, message: 'Course must be in recycle bin before permanent deletion' });
        }

        // Delete associated files
        const deleteFile = (fileUrl) => {
            if (fileUrl && fileUrl.includes('/uploads/')) {
                const filename = fileUrl.split('/uploads/')[1];
                const filePath = path.join(__dirname, '..', 'uploads', filename);
                fs.unlink(filePath, (err) => {
                    if (err) console.error(`Failed to delete file: ${filePath}`, err);
                });
            }
        };

        deleteFile(course.thumbnailUrl);
        deleteFile(course.introVideoUrl);
        course.sections.forEach(section => {
            section.lectures.forEach(lecture => {
                deleteFile(lecture.videoUrl);
            });
        });

        // Permanently delete from database
        await course.deleteOne();

        res.status(200).json({ success: true, message: 'Course permanently deleted' });
    } catch (error) {
        console.error('Error permanently deleting course:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Permanently delete an internship
// @route   DELETE /api/recycle-bin/permanent-delete-internship/:id
// @access  Private/Admin
const permanentDeleteInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }
        if (!internship.deleted) {
            return res.status(400).json({ success: false, message: 'Internship must be in recycle bin before permanent deletion' });
        }

        // Delete associated thumbnail file
        if (internship.thumbnail && internship.thumbnail.public_id) {
            const thumbnailPath = path.join(__dirname, '..', 'uploads', 'thumbnails', internship.thumbnail.public_id);
            fs.unlink(thumbnailPath, (err) => {
                if (err) console.error("Error deleting thumbnail file:", err);
            });
        }

        // Permanently delete from database
        await internship.deleteOne();

        res.status(200).json({ success: true, message: 'Internship permanently deleted' });
    } catch (error) {
        console.error('Error permanently deleting internship:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getDeletedItems,
    restoreCourse,
    restoreInternship,
    permanentDeleteCourse,
    permanentDeleteInternship
};



