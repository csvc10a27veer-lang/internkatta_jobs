const express = require('express');
const router = express.Router();
const {
    getDiscussions,
    createDiscussion,
    addReply,
    editDiscussion,
    deleteDiscussion,
    editReply,
    deleteReply,
    getAllDiscussionsAdmin,
    deleteDiscussionAdmin,
    deleteReplyAdmin,
    getUnansweredCountAdmin,
    addAdminReply
} = require('../controllers/discussionController');
const { protectUser, protectAdmin } = require('../middleware/authMiddleware');

// Admin routes
router.get('/admin/all', protectAdmin, getAllDiscussionsAdmin);
router.get('/admin/unanswered-count', protectAdmin, getUnansweredCountAdmin);
router.post('/admin/:discussionId/reply', protectAdmin, addAdminReply);
router.delete('/admin/:discussionId', protectAdmin, deleteDiscussionAdmin);
router.delete('/admin/:discussionId/reply/:replyId', protectAdmin, deleteReplyAdmin);

// User routes
router.get('/:courseId/:lectureId', protectUser, getDiscussions);
router.post('/', protectUser, createDiscussion);
router.post('/:discussionId/reply', protectUser, addReply);
router.put('/:discussionId', protectUser, editDiscussion);
router.delete('/:discussionId', protectUser, deleteDiscussion);
router.put('/:discussionId/reply/:replyId', protectUser, editReply);
router.delete('/:discussionId/reply/:replyId', protectUser, deleteReply);

module.exports = router;
