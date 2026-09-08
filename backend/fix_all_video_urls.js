// Comprehensive script to fix ALL video URLs in the database
// This will update all localhost:4000 URLs to production HTTPS URLs

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to your MongoDB database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/InternKatta', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Import the models
const Course = require('./models/courseModel');
const Internship = require('./models/internshipModel');
const User = require('./models/userModel');

async function fixAllVideoUrls() {
    try {
        console.log('🚀 Starting comprehensive URL migration...');
        console.log('🔍 Looking for all localhost:4000 URLs in the database...\n');

        let totalUpdated = 0;

        // 1. Fix Course URLs
        console.log('📚 === FIXING COURSE URLs ===');
        const courses = await Course.find({
            $or: [
                { thumbnailUrl: { $regex: /localhost:4000/ } },
                { introVideoUrl: { $regex: /localhost:4000/ } },
                { 'sections.lectures.videoUrl': { $regex: /localhost:4000/ } }
            ]
        });

        console.log(`📊 Found ${courses.length} courses with localhost URLs`);

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
                totalUpdated++;
                console.log(`💾 Saved changes for course: ${course.title}`);
            }
        }

        // 2. Fix Internship URLs
        console.log('\n🎓 === FIXING INTERNSHIP URLs ===');
        const internships = await Internship.find({
            'thumbnail.url': { $regex: /localhost:4000/ }
        });

        console.log(`📊 Found ${internships.length} internships with localhost URLs`);

        for (const internship of internships) {
            let hasChanges = false;

            // Fix thumbnail URL
            if (internship.thumbnail && internship.thumbnail.url && internship.thumbnail.url.includes('localhost:4000')) {
                internship.thumbnail.url = internship.thumbnail.url.replace('http://localhost:4000', 'https://api.InternKatta.gradezy.in');
                hasChanges = true;
                console.log(`🖼️  Fixed thumbnail URL for internship: ${internship.title}`);
            }

            // Save the internship if changes were made
            if (hasChanges) {
                await internship.save();
                totalUpdated++;
                console.log(`💾 Saved changes for internship: ${internship.title}`);
            }
        }

        // 3. Fix User Submission URLs
        console.log('\n👤 === FIXING USER SUBMISSION URLs ===');
        const users = await User.find({
            'internshipProgress.completedLectures.submittedFile.url': { $regex: /localhost:4000/ }
        });

        console.log(`📊 Found ${users.length} users with localhost submission URLs`);

        for (const user of users) {
            let hasChanges = false;

            // Fix submission URLs
            for (const progress of user.internshipProgress) {
                if (progress.completedLectures && progress.completedLectures.length > 0) {
                    for (const lecture of progress.completedLectures) {
                        if (lecture.submittedFile && lecture.submittedFile.url && lecture.submittedFile.url.includes('localhost:4000')) {
                            lecture.submittedFile.url = lecture.submittedFile.url.replace('http://localhost:4000', 'https://api.InternKatta.gradezy.in');
                            hasChanges = true;
                            console.log(`📄 Fixed submission URL for user: ${user.fullName}`);
                        }
                    }
                }
            }

            // Save the user if changes were made
            if (hasChanges) {
                await user.save();
                totalUpdated++;
                console.log(`💾 Saved changes for user: ${user.fullName}`);
            }
        }

        console.log(`\n🎉 === MIGRATION COMPLETE ===`);
        console.log(`✅ Successfully updated ${totalUpdated} records!`);
        console.log('🔒 All localhost:4000 URLs have been replaced with https://api.InternKatta.gradezy.in');
        console.log('🎬 Video playback should now work correctly in production!');

    } catch (error) {
        console.error('❌ Error during URL migration:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
fixAllVideoUrls();
