const express = require('express');
const router = express.Router();
const {
  getAllTrainingPrograms,
  getTrainingProgramById,
  createTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram
} = require('../controllers/trainingProgramController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public routes
router.route('/')
  .get(getAllTrainingPrograms)
  .post(protectAdmin, createTrainingProgram);

router.route('/:id')
  .get(getTrainingProgramById)
  .put(protectAdmin, updateTrainingProgram)
  .delete(protectAdmin, deleteTrainingProgram);

module.exports = router;
