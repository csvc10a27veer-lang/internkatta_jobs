// backend/fix_all_http_urls.js
// Comprehensive script to fix all HTTP URLs in the database

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Import models
const Course = require('./models/courseModel');
const Internship = require('./models/internshipModel');
const User = require('./models/userModel');

async function fixAllHttpUrls() {
    try {
        console.log('🔍 Starting comprehensive HTTP URL fix...\n');
        
        let totalFixed = 0;
        
        // 1. Fix Course URLs
        console.log('📚 Fixing Course URLs...');
        const courses = await Course.find({
            $or: [
                { thumbnailUrl: { $regex: /^http:\/\// } },
                { introVideoUrl: { $regex: /^http:\/\// } },
                { 'sections.lectures.videoUrl': { $regex: /^http:\/\// } }
            ]
        });
        
        for (const course of courses) {
            let hasChanges = false;
            
            // Fix thumbnail URL
            if (course.thumbnailUrl && course.thumbnailUrl.startsWith('http://')) {
                course.thumbnailUrl = course.thumbnailUrl.replace('http://', 'https://');
                hasChanges = true;
                console.log(`🖼️  Fixed course thumbnail: ${course.title}`);
            }
            
            // Fix intro video URL
            if (course.introVideoUrl && course.introVideoUrl.startsWith('http://')) {
                course.introVideoUrl = course.introVideoUrl.replace('http://', 'https://');
                hasChanges = true;
                console.log(`🎥 Fixed course intro video: ${course.title}`);
            }
            
            // Fix lecture video URLs
            if (course.sections && course.sections.length > 0) {
                for (const section of course.sections) {
                    if (section.lectures && section.lectures.length > 0) {
                        for (const lecture of section.lectures) {
                            if (lecture.videoUrl && lecture.videoUrl.startsWith('http://')) {
                                lecture.videoUrl = lecture.videoUrl.replace('http://', 'https://');
                                hasChanges = true;
                                console.log(`📹 Fixed lecture video: ${lecture.title} in ${course.title}`);
                            }
                        }
                    }
                }
            }
            
            if (hasChanges) {
                await course.save();
                totalFixed++;
            }
        }
        
        // 2. Fix Internship URLs
        console.log('\n💼 Fixing Internship URLs...');
        const internships = await Internship.find({
            'thumbnail.url': { $regex: /^http:\/\// }
        });
        
        for (const internship of internships) {
            if (internship.thumbnail && internship.thumbnail.url && internship.thumbnail.url.startsWith('http://')) {
                internship.thumbnail.url = internship.thumbnail.url.replace('http://', 'https://');
                await internship.save();
                totalFixed++;
                console.log(`🖼️  Fixed internship thumbnail: ${internship.title}`);
            }
        }
        
        // 3. Fix User submission URLs
        console.log('\n👤 Fixing User submission URLs...');
        const users = await User.find({
            'internshipProgress.completedLectures.submittedFile.url': { $regex: /^http:\/\// }
        });
        
        for (const user of users) {
            let hasChanges = false;
            
            if (user.internshipProgress && user.internshipProgress.length > 0) {
                for (const progress of user.internshipProgress) {
                    if (progress.completedLectures && progress.completedLectures.length > 0) {
                        for (const lecture of progress.completedLectures) {
                            if (lecture.submittedFile && lecture.submittedFile.url && lecture.submittedFile.url.startsWith('http://')) {
                                lecture.submittedFile.url = lecture.submittedFile.url.replace('http://', 'https://');
                                hasChanges = true;
                                console.log(`📄 Fixed user submission: ${user.fullName}`);
                            }
                        }
                    }
                }
            }
            
            if (hasChanges) {
                await user.save();
                totalFixed++;
            }
        }
        
        console.log(`\n✅ Successfully fixed ${totalFixed} HTTP URLs!`);
        console.log('🎉 All URLs are now using HTTPS to prevent mixed content warnings');
        
    } catch (error) {
        console.error('❌ Error fixing HTTP URLs:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
fixAllHttpUrls();
