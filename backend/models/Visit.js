const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  page: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  deviceType: { type: String },
  browser: { type: String },
  os: { type: String },
  referrer: { type: String },
  country: { type: String },
  city: { type: String },
  timeSpent: { type: Number },
  pageViews: [{ type: Object }],
  productClicks: [{ type: Object }],
  internshipClicks: [{ type: Object }],
  navLinkClicks: [{ type: Object }],
  interactions: [{ type: Object }],
  timestamp: { type: Date, default: Date.now },
  sessionId: { type: String },
});

module.exports = mongoose.model('Visit', visitSchema);
