const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 300 } // TTL index: document will automatically delete after 5 minutes (300 seconds)
    }
});

module.exports = mongoose.model('OTP', otpSchema);
