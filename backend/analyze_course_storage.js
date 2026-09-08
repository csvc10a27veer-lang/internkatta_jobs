// Script to analyze storage usage for each course
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: 'production.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Import models
const Course = require('./models/courseModel');
const User = require('./models/userModel');

// Function to get file size in MB
function getFileSizeInMB(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return (stats.size / (1024 * 1024)).toFixed(2);
    } catch (error) {
        return 0;
    }
}

// Function to extract filename from URL
function extractFilenameFromUrl(url) {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
}

// Function to analyze course storage
async function analyzeCourseStorage() {
    try {
        console.log('🔍 Analyzing Course Storage Usage...\n');
        
        const courses = await Course.find({}).populate('createdBy', 'fullName email');
        
        if (courses.length === 0) {
            console.log('❌ No courses found in the database.');
            return;
        }

        let totalStorage = 0;
        const uploadsDir = path.join(__dirname, 'uploads');
        
        console.log('📊 COURSE STORAGE ANALYSIS\n');
        console.log('=' .repeat(80));
        
        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            console.log(`\n📚 Course ${i + 1}: ${course.title}`);
            console.log(`👤 Created by: ${course.createdBy?.fullName || 'Unknown'}`);
            console.log(`📅 Created: ${course.createdAt.toLocaleDateString()}`);
            console.log(`💰 Price: ₹${course.price}`);
            
            let courseStorage = 0;
            let fileCount = 0;
            
            // Analyze thumbnail
            if (course.thumbnailUrl) {
                const thumbnailFile = extractFilenameFromUrl(course.thumbnailUrl);
                if (thumbnailFile) {
                    const thumbnailPath = path.join(uploadsDir, thumbnailFile);
                    const thumbnailSize = getFileSizeInMB(thumbnailPath);
                    if (thumbnailSize > 0) {
                        courseStorage += parseFloat(thumbnailSize);
                        fileCount++;
                        console.log(`🖼️  Thumbnail: ${thumbnailFile} (${thumbnailSize} MB)`);
                    }
                }
            }
            
            // Analyze intro video
            if (course.introVideoUrl) {
                const introVideoFile = extractFilenameFromUrl(course.introVideoUrl);
                if (introVideoFile) {
                    const introVideoPath = path.join(uploadsDir, introVideoFile);
                    const introVideoSize = getFileSizeInMB(introVideoPath);
                    if (introVideoSize > 0) {
                        courseStorage += parseFloat(introVideoSize);
                        fileCount++;
                        console.log(`🎬 Intro Video: ${introVideoFile} (${introVideoSize} MB)`);
                    }
                }
            }
            
            // Analyze lecture videos
            if (course.sections && course.sections.length > 0) {
                console.log(`\n📖 Sections: ${course.sections.length}`);
                
                for (let j = 0; j < course.sections.length; j++) {
                    const section = course.sections[j];
                    console.log(`  📑 Section ${j + 1}: ${section.title || 'Untitled'}`);
                    console.log(`     📹 Lectures: ${section.lectures.length}`);
                    
                    for (let k = 0; k < section.lectures.length; k++) {
                        const lecture = section.lectures[k];
                        if (lecture.videoUrl) {
                            const lectureFile = extractFilenameFromUrl(lecture.videoUrl);
                            if (lectureFile) {
                                const lecturePath = path.join(uploadsDir, lectureFile);
                                const lectureSize = getFileSizeInMB(lecturePath);
                                if (lectureSize > 0) {
                                    courseStorage += parseFloat(lectureSize);
                                    fileCount++;
                                    console.log(`       🎥 ${lecture.title}: ${lectureFile} (${lectureSize} MB)`);
                                }
                            }
                        }
                    }
                }
            }
            
            console.log(`\n💾 Total Storage for "${course.title}": ${courseStorage.toFixed(2)} MB`);
            console.log(`📁 Total Files: ${fileCount}`);
            totalStorage += courseStorage;
            
            console.log('-' .repeat(60));
        }
        
        console.log(`\n📈 SUMMARY`);
        console.log('=' .repeat(80));
        console.log(`📚 Total Courses: ${courses.length}`);
        console.log(`💾 Total Storage Used: ${totalStorage.toFixed(2)} MB (${(totalStorage / 1024).toFixed(2)} GB)`);
        console.log(`📊 Average Storage per Course: ${(totalStorage / courses.length).toFixed(2)} MB`);
        
        // Check for orphaned files
        console.log(`\n🔍 Checking for orphaned files...`);
        const allFiles = fs.readdirSync(uploadsDir);
        const courseFiles = new Set();
        
        // Collect all course-related files
        courses.forEach(course => {
            if (course.thumbnailUrl) {
                const file = extractFilenameFromUrl(course.thumbnailUrl);
                if (file) courseFiles.add(file);
            }
            if (course.introVideoUrl) {
                const file = extractFilenameFromUrl(course.introVideoUrl);
                if (file) courseFiles.add(file);
            }
            if (course.sections) {
                course.sections.forEach(section => {
                    section.lectures.forEach(lecture => {
                        if (lecture.videoUrl) {
                            const file = extractFilenameFromUrl(lecture.videoUrl);
                            if (file) courseFiles.add(file);
                        }
                    });
                });
            }
        });
        
        const orphanedFiles = allFiles.filter(file => 
            !courseFiles.has(file) && 
            !file.startsWith('submission') && 
            !file.startsWith('internship-') &&
            fs.statSync(path.join(uploadsDir, file)).isFile()
        );
        
        if (orphanedFiles.length > 0) {
            console.log(`⚠️  Found ${orphanedFiles.length} orphaned files:`);
            orphanedFiles.forEach(file => {
                const filePath = path.join(uploadsDir, file);
                const size = getFileSizeInMB(filePath);
                console.log(`   📄 ${file} (${size} MB)`);
            });
        } else {
            console.log(`✅ No orphaned files found.`);
        }
        
    } catch (error) {
        console.error('❌ Error analyzing course storage:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the analysis
analyzeCourseStorage();
