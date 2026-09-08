const express = require('express');
const router = express.Router();
const {
  registerTraining,
  getAllTrainingRegistrations,
  getTrainingRegistrationById,
  updateTrainingStatus,
  deleteTrainingRegistration,
  getTrainingStats
} = require('../controllers/trainingController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public route - anyone can register for training
router.post('/register', registerTraining);

// Admin routes - protected by admin authentication
router.get('/admin/registrations', protectAdmin, getAllTrainingRegistrations);
router.get('/admin/registrations/:id', protectAdmin, getTrainingRegistrationById);
router.put('/admin/registrations/:id/status', protectAdmin, updateTrainingStatus);
router.delete('/admin/registrations/:id', protectAdmin, deleteTrainingRegistration);
router.get('/admin/stats', protectAdmin, getTrainingStats);

module.exports = router;
