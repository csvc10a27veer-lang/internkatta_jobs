const mongoose = require('mongoose');

const clickTrackingSchema = new mongoose.Schema({
    itemType: { type: String, enum: ['Course', 'Internship'], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClickTracking', clickTrackingSchema);
