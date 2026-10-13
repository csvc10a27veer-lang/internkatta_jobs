const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  contact: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  jobType: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    default: 'Manual',
    enum: ['Scraped', 'Manual', 'API Imported']
  },
  sourceUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Inactive']
  },
  postedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
