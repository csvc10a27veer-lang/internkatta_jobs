// backend/fix_missing_enrollments.js
// Run this ONCE to fix users who paid but were not enrolled due to the ObjectId bug.
// Usage: node fix_missing_enrollments.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGO_URI = process.env.MONGODB_URI;

async function fixMissingEnrollments() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const User = require('./models/userModel');
  const Payment = require('./models/paymentModel');

  const completedPayments = await Payment.find({ status: 'COMPLETED' });
  console.log(`📦 Found ${completedPayments.length} completed payment(s)`);

  let fixed = 0;

  for (const payment of completedPayments) {
    const userId = payment.userId;
    const user = await User.findById(userId);

    if (!user) {
      console.log(`⚠️  User not found for payment ${payment.transactionId}`);
      continue;
    }

    if (payment.type === 'COURSE' && payment.courseId) {
      const courseId = payment.courseId;
      const alreadyEnrolled = user.enrolledCourses.some(
        id => id.toString() === courseId.toString()
      );
      if (!alreadyEnrolled) {
        user.enrolledCourses.push(courseId);
        await user.save();
        console.log(`✅ Fixed: Enrolled ${user.email} in course ${courseId} (txn: ${payment.transactionId})`);
        fixed++;
      }
    } else if (payment.type === 'INTERNSHIP' && payment.internshipId) {
      const internshipId = payment.internshipId;
      const alreadyEnrolled = user.enrolledInternships.some(
        id => id.toString() === internshipId.toString()
      );
      if (!alreadyEnrolled) {
        user.enrolledInternships.push(internshipId);
        await user.save();
        console.log(`✅ Fixed: Enrolled ${user.email} in internship ${internshipId} (txn: ${payment.transactionId})`);
        fixed++;
      }
    }
  }

  console.log(`\n🎉 Done! Fixed ${fixed} missing enrollment(s).`);
  await mongoose.disconnect();
}

fixMissingEnrollments().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
