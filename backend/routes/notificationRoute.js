const express = require('express');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protectUser, protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// User notification routes
router.get('/', protectUser, getNotifications);
router.put('/:id/read', protectUser, markAsRead);
router.put('/read-all', protectUser, markAllAsRead);

// Admin notification routes
router.get('/admin', protectAdmin, getNotifications);
router.put('/admin/:id/read', protectAdmin, markAsRead);
router.put('/admin/read-all', protectAdmin, markAllAsRead);

module.exports = router;
