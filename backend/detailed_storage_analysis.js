// Detailed storage analysis for each course
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

// Function to analyze detailed storage
async function detailedStorageAnalysis() {
    try {
        console.log('🔍 DETAILED COURSE STORAGE ANALYSIS\n');
        
        const courses = await Course.find({}).populate('createdBy', 'fullName email');
        
        if (courses.length === 0) {
            console.log('❌ No courses found in the database.');
            return;
        }

        let totalStorage = 0;
        const uploadsDir = path.join(__dirname, 'uploads');
        
        console.log('📊 DETAILED STORAGE BREAKDOWN\n');
        console.log('=' .repeat(100));
        
        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            console.log(`\n📚 COURSE ${i + 1}: ${course.title}`);
            console.log(`👤 Created by: ${course.createdBy?.fullName || 'Unknown'}`);
            console.log(`📅 Created: ${course.createdAt.toLocaleDateString()}`);
            console.log(`💰 Price: ₹${course.price}`);
            console.log(`📝 Description: ${course.description.substring(0, 100)}...`);
            
            let courseStorage = 0;
            let fileCount = 0;
            const fileDetails = [];
            
            // Analyze thumbnail
            if (course.thumbnailUrl) {
                const thumbnailFile = extractFilenameFromUrl(course.thumbnailUrl);
                if (thumbnailFile) {
                    const thumbnailPath = path.join(uploadsDir, thumbnailFile);
                    const thumbnailSize = getFileSizeInMB(thumbnailPath);
                    if (thumbnailSize > 0) {
                        courseStorage += parseFloat(thumbnailSize);
                        fileCount++;
                        fileDetails.push({
                            type: 'Thumbnail',
                            file: thumbnailFile,
                            size: thumbnailSize
                        });
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
                        fileDetails.push({
                            type: 'Intro Video',
                            file: introVideoFile,
                            size: introVideoSize
                        });
                    }
                }
            }
            
            // Analyze lecture videos
            if (course.sections && course.sections.length > 0) {
                console.log(`\n📖 COURSE STRUCTURE:`);
                console.log(`   📑 Total Sections: ${course.sections.length}`);
                
                let totalLectures = 0;
                for (let j = 0; j < course.sections.length; j++) {
                    const section = course.sections[j];
                    totalLectures += section.lectures.length;
                }
                console.log(`   📹 Total Lectures: ${totalLectures}`);
                
                for (let j = 0; j < course.sections.length; j++) {
                    const section = course.sections[j];
                    console.log(`\n   📑 SECTION ${j + 1}: ${section.title || 'Untitled'}`);
                    console.log(`      📹 Lectures: ${section.lectures.length}`);
                    
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
                                    fileDetails.push({
                                        type: 'Lecture Video',
                                        file: lectureFile,
                                        size: lectureSize,
                                        lecture: lecture.title
                                    });
                                }
                            }
                        }
                    }
                }
            }
            
            // Display file details
            console.log(`\n💾 STORAGE BREAKDOWN:`);
            if (fileDetails.length > 0) {
                fileDetails.forEach(detail => {
                    console.log(`   ${detail.type}: ${detail.file} (${detail.size} MB)`);
                    if (detail.lecture) {
                        console.log(`      📝 Lecture: ${detail.lecture}`);
                    }
                });
            } else {
                console.log(`   ⚠️  No files found for this course`);
            }
            
            console.log(`\n📊 COURSE SUMMARY:`);
            console.log(`   💾 Total Storage: ${courseStorage.toFixed(2)} MB`);
            console.log(`   📁 Total Files: ${fileCount}`);
            console.log(`   📈 Storage per Lecture: ${course.sections && course.sections.length > 0 ? 
                (courseStorage / course.sections.reduce((acc, section) => acc + section.lectures.length, 0)).toFixed(2) + ' MB' : 'N/A'}`);
            
            totalStorage += courseStorage;
            
            console.log('\n' + '=' .repeat(100));
        }
        
        console.log(`\n📈 OVERALL SUMMARY`);
        console.log('=' .repeat(100));
        console.log(`📚 Total Courses: ${courses.length}`);
        console.log(`💾 Total Storage Used: ${totalStorage.toFixed(2)} MB (${(totalStorage / 1024).toFixed(2)} GB)`);
        console.log(`📊 Average Storage per Course: ${(totalStorage / courses.length).toFixed(2)} MB`);
        
        // Storage recommendations
        console.log(`\n💡 STORAGE RECOMMENDATIONS:`);
        if (totalStorage > 1000) {
            console.log(`   ⚠️  High storage usage detected (${(totalStorage / 1024).toFixed(2)} GB)`);
            console.log(`   💡 Consider implementing video compression`);
            console.log(`   💡 Consider using cloud storage (AWS S3, Google Cloud)`);
        } else if (totalStorage > 500) {
            console.log(`   ⚠️  Moderate storage usage (${totalStorage.toFixed(2)} MB)`);
            console.log(`   💡 Monitor storage growth`);
        } else {
            console.log(`   ✅ Low storage usage (${totalStorage.toFixed(2)} MB)`);
        }
        
    } catch (error) {
        console.error('❌ Error analyzing course storage:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the analysis
detailedStorageAnalysis();
