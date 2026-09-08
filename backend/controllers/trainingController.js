const Training = require('../models/trainingModel');

// Register for training
const registerTraining = async (req, res) => {
  try {
    const { name, email, mobileNumber, collegeName, trainingType, trainingTitle } = req.body;

    // Validate required fields
    if (!name || !email || !mobileNumber || !collegeName || !trainingType || !trainingTitle) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate mobile number (basic validation)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Check if user already registered for this specific training type
    const existingRegistration = await Training.findOne({
      email: email,
      trainingType: trainingType,
      trainingTitle: trainingTitle
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this specific training program'
      });
    }

    // Create new training registration
    const trainingRegistration = new Training({
      name,
      email,
      mobileNumber,
      collegeName,
      trainingType,
      trainingTitle
    });

    await trainingRegistration.save();

    res.status(201).json({
      success: true,
      message: 'Training registration successful! We will contact you soon.',
      data: trainingRegistration
    });

  } catch (error) {
    console.error('Training registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all training registrations (admin only)
const getAllTrainingRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { collegeName: { $regex: search, $options: 'i' } },
        { trainingTitle: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const registrations = await Training.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Training.countDocuments(query);

    res.status(200).json({
      success: true,
      data: registrations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get training registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get training registration by ID
const getTrainingRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Training.findById(id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Training registration not found'
      });
    }

    res.status(200).json({
      success: true,
      data: registration
    });

  } catch (error) {
    console.error('Get training registration by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update training registration status (admin only)
const updateTrainingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'contacted', 'approved', 'enrolled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const registration = await Training.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true, runValidators: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Training registration not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Training registration status updated successfully',
      data: registration
    });

  } catch (error) {
    console.error('Update training status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete training registration (admin only)
const deleteTrainingRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Training.findByIdAndDelete(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Training registration not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Training registration deleted successfully'
    });

  } catch (error) {
    console.error('Delete training registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get training statistics (admin only)
const getTrainingStats = async (req, res) => {
  try {
    const stats = await Training.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRegistrations = await Training.countDocuments();
    
    const trainingTypeStats = await Training.aggregate([
      {
        $group: {
          _id: '$trainingType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        totalRegistrations,
        trainingTypeStats
      }
    });

  } catch (error) {
    console.error('Get training stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  registerTraining,
  getAllTrainingRegistrations,
  getTrainingRegistrationById,
  updateTrainingStatus,
  deleteTrainingRegistration,
  getTrainingStats
};
