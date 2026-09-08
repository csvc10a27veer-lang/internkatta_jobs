const Discussion = require('../models/discussionModel');
const Notification = require('../models/notificationModel');

// @desc    Get discussions for a specific lecture
// @route   GET /api/discussions/:courseId/:lectureId
// @access  Private
const getDiscussions = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;

        const discussions = await Discussion.find({ courseId, lectureId })
            .populate('userId', 'fullName profilePicture role')
            .populate('replies.userId', 'fullName profilePicture role')
            .populate('replies.adminId', 'fullName profilePicture role')
            .sort({ createdAt: -1 });

        res.status(200).json(discussions);
    } catch (error) {
        console.error('Error fetching discussions:', error);
        res.status(500).json({ message: 'Server error while fetching discussions.' });
    }
};

// @desc    Create a new discussion thread
// @route   POST /api/discussions
// @access  Private
const createDiscussion = async (req, res) => {
    try {
        const { courseId, lectureId, question } = req.body;

        if (!courseId || !lectureId || !question) {
            return res.status(400).json({ message: 'Course ID, Lecture ID, and question are required' });
        }

        const newDiscussion = await Discussion.create({
            courseId,
            lectureId,
            userId: req.user._id,
            question
        });

        const populatedDiscussion = await Discussion.findById(newDiscussion._id)
            .populate('userId', 'fullName profilePicture role');

        res.status(201).json(populatedDiscussion);
    } catch (error) {
        console.error('Error creating discussion:', error);
        res.status(500).json({ message: 'Server error while creating discussion.' });
    }
};

// @desc    Add a reply to a discussion
// @route   POST /api/discussions/:discussionId/reply
// @access  Private
const addReply = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Reply text is required' });
        }

        const discussion = await Discussion.findById(discussionId);

        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        discussion.replies.push({
            userId: req.user._id,
            text
        });

        await discussion.save();

        const updatedDiscussion = await Discussion.findById(discussionId)
            .populate('userId', 'fullName profilePicture role')
            .populate('replies.userId', 'fullName profilePicture role')
            .populate('replies.adminId', 'fullName profilePicture role');

        res.status(201).json(updatedDiscussion);
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ message: 'Server error while adding reply.' });
    }
};

// @desc    Edit a discussion
// @route   PUT /api/discussions/:discussionId
// @access  Private
const editDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const { question } = req.body;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        if (discussion.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this discussion' });
        }

        discussion.question = question;
        await discussion.save();

        const updatedDiscussion = await Discussion.findById(discussionId)
            .populate('userId', 'fullName profilePicture role')
            .populate('replies.userId', 'fullName profilePicture role')
            .populate('replies.adminId', 'fullName profilePicture role');

        res.status(200).json(updatedDiscussion);
    } catch (error) {
        console.error('Error editing discussion:', error);
        res.status(500).json({ message: 'Server error while editing discussion.' });
    }
};

// @desc    Delete a discussion
// @route   DELETE /api/discussions/:discussionId
// @access  Private
const deleteDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        if (discussion.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this discussion' });
        }

        await Discussion.deleteOne({ _id: discussionId });
        res.status(200).json({ message: 'Discussion removed' });
    } catch (error) {
        console.error('Error deleting discussion:', error);
        res.status(500).json({ message: 'Server error while deleting discussion.' });
    }
};

// @desc    Edit a reply
// @route   PUT /api/discussions/:discussionId/reply/:replyId
// @access  Private
const editReply = async (req, res) => {
    try {
        const { discussionId, replyId } = req.params;
        const { text } = req.body;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        const reply = discussion.replies.id(replyId);
        if (!reply) return res.status(404).json({ message: 'Reply not found' });

        if (reply.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this reply' });
        }

        reply.text = text;
        await discussion.save();

        const updatedDiscussion = await Discussion.findById(discussionId)
            .populate('userId', 'fullName profilePicture role')
            .populate('replies.userId', 'fullName profilePicture role')
            .populate('replies.adminId', 'fullName profilePicture role');

        res.status(200).json(updatedDiscussion);
    } catch (error) {
        console.error('Error editing reply:', error);
        res.status(500).json({ message: 'Server error while editing reply.' });
    }
};

// @desc    Delete a reply
// @route   DELETE /api/discussions/:discussionId/reply/:replyId
// @access  Private
const deleteReply = async (req, res) => {
    try {
        const { discussionId, replyId } = req.params;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        const reply = discussion.replies.id(replyId);
        if (!reply) return res.status(404).json({ message: 'Reply not found' });

        if (reply.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this reply' });
        }

        reply.deleteOne();
        await discussion.save();

        const updatedDiscussion = await Discussion.findById(discussionId)
            .populate('userId', 'fullName profilePicture role')
            .populate('replies.userId', 'fullName profilePicture role')
            .populate('replies.adminId', 'fullName profilePicture role');

        res.status(200).json(updatedDiscussion);
    } catch (error) {
        console.error('Error deleting reply:', error);
        res.status(500).json({ message: 'Server error while deleting reply.' });
    }
};

// @desc    Get all discussions for admin
// @route   GET /api/discussions/admin/all
// @access  Private/Admin
const getAllDiscussionsAdmin = async (req, res) => {
    try {
        const discussions = await Discussion.find({})
            .populate('courseId', 'title')
            .populate('userId', 'fullName profilePicture role')
            .populate('replies.userId', 'fullName profilePicture role')
            .populate('replies.adminId', 'fullName profilePicture role')
            .sort({ createdAt: -1 });

        res.status(200).json(discussions);
    } catch (error) {
        console.error('Error fetching all discussions:', error);
        res.status(500).json({ message: 'Server error while fetching all discussions.' });
    }
};

// @desc    Get count of unanswered discussions for admin
// @route   GET /api/discussions/admin/unanswered-count
// @access  Private/Admin
const getUnansweredCountAdmin = async (req, res) => {
    try {
        const count = await Discussion.countDocuments({
            'replies.adminId': { $exists: false }
        });
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching unanswered count:', error);
        res.status(500).json({ message: 'Server error while fetching unanswered count.' });
    }
};

// @desc    Add a reply as an admin
// @route   POST /api/discussions/admin/:discussionId/reply
// @access  Private/Admin
const addAdminReply = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Reply text is required' });
        }

        const discussion = await Discussion.findById(discussionId);

        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        discussion.replies.push({
            adminId: req.user._id,
            text
        });

        await discussion.save();

        const updatedDiscussion = await Discussion.findById(discussionId)
            .populate('courseId', 'title')
            .populate('userId', 'fullName profilePicture role')
            .populate('replies.userId', 'fullName profilePicture role')
            .populate('replies.adminId', 'fullName profilePicture role');

        // --- Create Notification for User ---
        try {
            const userId = updatedDiscussion.userId._id;
            const notification = await Notification.create({
                recipient: userId,
                type: 'reply',
                title: 'New Reply to Your Question',
                message: `An admin has replied to your question in ${updatedDiscussion.courseId.title}.`,
                link: `/course/${updatedDiscussion.courseId._id}`,
                isRead: false
            });

            // Emit to connected user
            const io = req.app.get('io');
            const userSockets = req.app.get('userSockets');
            if (io && userSockets && userSockets.has(userId.toString())) {
                const socketId = userSockets.get(userId.toString());
                io.to(socketId).emit('newNotification', notification);
            }
        } catch (notifError) {
            console.error('Error creating notification for admin reply:', notifError);
        }

        res.status(201).json(updatedDiscussion);
    } catch (error) {
        console.error('Error adding admin reply:', error);
        res.status(500).json({ message: 'Server error while adding admin reply.' });
    }
};

// @desc    Delete a discussion (admin override)
// @route   DELETE /api/discussions/admin/:discussionId
// @access  Private/Admin
const deleteDiscussionAdmin = async (req, res) => {
    try {
        const { discussionId } = req.params;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        await Discussion.deleteOne({ _id: discussionId });
        res.status(200).json({ message: 'Discussion removed' });
    } catch (error) {
        console.error('Error deleting discussion as admin:', error);
        res.status(500).json({ message: 'Server error while deleting discussion as admin.' });
    }
};

// @desc    Delete a reply (admin override)
// @route   DELETE /api/discussions/admin/:discussionId/reply/:replyId
// @access  Private/Admin
const deleteReplyAdmin = async (req, res) => {
    try {
        const { discussionId, replyId } = req.params;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        const reply = discussion.replies.id(replyId);
        if (!reply) return res.status(404).json({ message: 'Reply not found' });

        reply.deleteOne();
        await discussion.save();

        res.status(200).json({ message: 'Reply removed' });
    } catch (error) {
        console.error('Error deleting reply as admin:', error);
        res.status(500).json({ message: 'Server error while deleting reply as admin.' });
    }
};

module.exports = {
    getDiscussions,
    createDiscussion,
    addReply,
    editDiscussion,
    deleteDiscussion,
    editReply,
    deleteReply,
    getAllDiscussionsAdmin,
    getUnansweredCountAdmin,
    addAdminReply,
    deleteDiscussionAdmin,
    deleteReplyAdmin
};
