const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/submit', contactController.submitContact);

// Admin routes (authentication required)
router.get('/admin/all', protectAdmin, contactController.getAllContacts);
router.get('/admin/stats', protectAdmin, contactController.getContactStats);
router.get('/admin/:id', protectAdmin, contactController.getContactById);
router.put('/admin/:id', protectAdmin, contactController.updateContactStatus);
router.delete('/admin/:id', protectAdmin, contactController.deleteContact);

module.exports = router;
