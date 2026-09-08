const mongoose = require('mongoose');

const trainingProgramSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  badge: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: { type: String, default: '' },
  mode: { type: String, default: '' },
  idealFor: { type: String, default: '' },
  category: { type: String, default: '' },
  difficulty: { type: String, default: '' },
  language: { type: String, default: 'English' },
  keyFeatures: [{ type: String }],
  technologies: [{ type: String }],
  longDescription: { type: String },
  stats: [{
    value: { type: String, required: true },
    label: { type: String, required: true }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TrainingProgram', trainingProgramSchema);
