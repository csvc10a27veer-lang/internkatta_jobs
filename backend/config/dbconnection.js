const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    // Set DNS servers to public ones to avoid local ISP DNS resolution failure (ECONNREFUSED) for SRV records
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (dnsErr) {
      console.warn('Warning: Failed to set public DNS servers, attempting connection anyway:', dnsErr.message);
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

