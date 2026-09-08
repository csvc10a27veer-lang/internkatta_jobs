// Script to check for any deleted items in the database
// This can help identify items that were deleted before soft delete was implemented

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/InternKatta');

const Internship = require('./models/internshipModel');
const Course = require('./models/courseModel');

async function checkDeletedItems() {
    try {
        console.log('🔍 Checking for deleted items...\n');

        // Check internships with deleted field
        const deletedInternships = await Internship.find({ deleted: true });
        console.log(`📦 Deleted Internships (in recycle bin): ${deletedInternships.length}`);
        deletedInternships.forEach(item => {
            console.log(`   - ${item.title} (ID: ${item._id}, Deleted: ${item.deletedAt})`);
        });

        // Check all internships (including non-deleted)
        const allInternships = await Internship.find({});
        console.log(`\n📚 Total Internships in database: ${allInternships.length}`);
        
        // Check courses with deleted field
        const deletedCourses = await Course.find({ deleted: true });
        console.log(`\n📦 Deleted Courses (in recycle bin): ${deletedCourses.length}`);
        deletedCourses.forEach(item => {
            console.log(`   - ${item.title} (ID: ${item._id}, Deleted: ${item.deletedAt})`);
        });

        // Check all courses
        const allCourses = await Course.find({});
        console.log(`\n📚 Total Courses in database: ${allCourses.length}`);

        console.log('\n💡 Note: Items deleted before soft delete was implemented are permanently gone.');
        console.log('   Recovery options:');
        console.log('   1. Check MongoDB Atlas backups');
        console.log('   2. Check if you have a database dump');
        console.log('   3. Recreate the item manually');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.disconnect();
    }
}

checkDeletedItems();



