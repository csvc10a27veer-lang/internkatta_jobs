const TrainingProgram = require('../models/trainingProgramModel');

// @desc    Get all training programs
// @route   GET /api/training-programs
// @access  Public
const getAllTrainingPrograms = async (req, res) => {
  try {
    const programs = await TrainingProgram.find({ status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single training program
// @route   GET /api/training-programs/:id
// @access  Public
const getTrainingProgramById = async (req, res) => {
  try {
    const program = await TrainingProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create a training program
// @route   POST /api/training-programs
// @access  Private (Admin)
const createTrainingProgram = async (req, res) => {
  try {
    const program = await TrainingProgram.create(req.body);

    res.status(201).json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create training program',
      error: error.message
    });
  }
};

// @desc    Update a training program
// @route   PUT /api/training-programs/:id
// @access  Private (Admin)
const updateTrainingProgram = async (req, res) => {
  try {
    let program = await TrainingProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    program = await TrainingProgram.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update training program',
      error: error.message
    });
  }
};

// @desc    Delete a training program
// @route   DELETE /api/training-programs/:id
// @access  Private (Admin)
const deleteTrainingProgram = async (req, res) => {
  try {
    const program = await TrainingProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    await program.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete training program',
      error: error.message
    });
  }
};

module.exports = {
  getAllTrainingPrograms,
  getTrainingProgramById,
  createTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram
};
