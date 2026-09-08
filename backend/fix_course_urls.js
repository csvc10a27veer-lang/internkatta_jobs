// Script to fix existing course URLs in the database
// This will update all course thumbnails and video URLs from localhost:4000 to production HTTPS

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to your MongoDB database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/InternKatta', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Import the Course model
const Course = require('./models/courseModel');

async function fixCourseUrls() {
    try {
        console.log('🔍 Finding courses with localhost URLs...');
        
        // Find all courses that have localhost:4000 URLs
        const courses = await Course.find({
            $or: [
                { thumbnailUrl: { $regex: /localhost:4000/ } },
                { introVideoUrl: { $regex: /localhost:4000/ } },
                { 'sections.lectures.videoUrl': { $regex: /localhost:4000/ } }
            ]
        });

        console.log(`📊 Found ${courses.length} courses with localhost URLs`);

        if (courses.length === 0) {
            console.log('✅ No courses found with localhost URLs. Database is already clean!');
            return;
        }

        let updatedCount = 0;

        for (const course of courses) {
            let hasChanges = false;

            // Fix thumbnail URL
            if (course.thumbnailUrl && course.thumbnailUrl.includes('localhost:4000')) {
                course.thumbnailUrl = course.thumbnailUrl.replace('http://localhost:4000', 'https://api.InternKatta.gradezy.in');
                hasChanges = true;
                console.log(`🖼️  Fixed thumbnail URL for course: ${course.title}`);
            }

            // Fix intro video URL
            if (course.introVideoUrl && course.introVideoUrl.includes('localhost:4000')) {
                course.introVideoUrl = course.introVideoUrl.replace('http://localhost:4000', 'https://api.InternKatta.gradezy.in');
                hasChanges = true;
                console.log(`🎥 Fixed intro video URL for course: ${course.title}`);
            }

            // Fix lecture video URLs in sections
            if (course.sections && course.sections.length > 0) {
                for (const section of course.sections) {
                    if (section.lectures && section.lectures.length > 0) {
                        for (const lecture of section.lectures) {
                            if (lecture.videoUrl && lecture.videoUrl.includes('localhost:4000')) {
                                lecture.videoUrl = lecture.videoUrl.replace('http://localhost:4000', 'https://api.InternKatta.gradezy.in');
                                hasChanges = true;
                                console.log(`📹 Fixed lecture video URL: ${lecture.title} in course: ${course.title}`);
                            }
                        }
                    }
                }
            }

            // Save the course if changes were made
            if (hasChanges) {
                await course.save();
                updatedCount++;
                console.log(`💾 Saved changes for course: ${course.title}`);
            }
        }

        console.log(`\n✅ Successfully updated ${updatedCount} courses!`);
        console.log('🎉 All localhost URLs have been replaced with production HTTPS URLs');

    } catch (error) {
        console.error('❌ Error fixing course URLs:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
fixCourseUrls();
