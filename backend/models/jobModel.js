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
    enum: ['Scraped', 'Manual', 'API Imported', 'LinkedIn', 'Naukri', 'Glassdoor', 'Internshala', 'Indeed', 'Automated']
  },
  platform: {
    type: String,
    default: ''
  },
  domain: {
    type: String,
    default: 'Software & Web Development',
    enum: [
      'Software & Web Development',
      'Data Science & Analytics',
      'AI & Machine Learning',
      'Cloud & DevOps',
      'Mobile App Development',
      'Robotic Process Automation (RPA)',
      'Enterprise Systems (ERP)',
      'Cyber Security',
      'Marketing & Business'
    ],
    index: true
  },
  sourceUrl: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
    index: true
  },
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Inactive']
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual getters and setters for seamless compatibility across Admin and Candidate frontends
jobSchema.virtual('title')
  .get(function() { return this.jobTitle; })
  .set(function(v) { this.jobTitle = v; });

jobSchema.virtual('company')
  .get(function() { return this.companyName; })
  .set(function(v) { this.companyName = v; });

jobSchema.virtual('package')
  .get(function() { return this.salary; })
  .set(function(v) { this.salary = v; });

jobSchema.virtual('description')
  .get(function() { return this.jobDescription; })
  .set(function(v) { this.jobDescription = v; });

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
