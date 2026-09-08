const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  collegeName: {
    type: String,
    required: true,
    trim: true
  },
  trainingType: {
    type: String,
    required: true,
    enum: ['industrial', 'msbte', 'workshops']
  },
  trainingTitle: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'contacted', 'approved', 'enrolled', 'rejected']
  },
  notes: {
    type: String,
    trim: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
trainingSchema.index({ email: 1, trainingType: 1 });
trainingSchema.index({ status: 1 });
trainingSchema.index({ registrationDate: -1 });

module.exports = mongoose.model('Training', trainingSchema);
