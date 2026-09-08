// get_ids.js - Get real IDs from database

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/InternKatta');

// Import models
const Course = require('./backend/models/courseModel');
const User = require('./backend/models/userModel');

async function getIds() {
  try {
    console.log('🔍 Getting real IDs from database...\n');
    
    // Get first course
    const course = await Course.findOne();
    if (course) {
      console.log('📚 Course Found:');
      console.log(`   ID: ${course._id}`);
      console.log(`   Title: ${course.title}`);
      console.log(`   Price: ₹${course.price}`);
    } else {
      console.log('❌ No courses found in database');
    }
    
    // Get first user
    const user = await User.findOne();
    if (user) {
      console.log('\n👤 User Found:');
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
    } else {
      console.log('\n❌ No users found in database');
    }
    
    console.log('\n📝 Update test_payment.js with these IDs:');
    if (course) {
      console.log(`   const TEST_COURSE_ID = '${course._id}';`);
    }
    if (user) {
      console.log(`   const TEST_USER_ID = '${user._id}';`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

getIds();
