/**
 * Migration Script: Convert Image Paths from JPEG/PNG to WebP
 * 
 * This script updates all image paths in the database from .jpeg/.png to .webp
 * It only updates paths that have matching WebP files in the filesystem
 * 
 * Usage: 
 *   From backend directory: node ../scripts/migrate-image-paths-to-webp.js
 *   OR from project root: cd backend && node ../scripts/migrate-image-paths-to-webp.js
 */

const fs = require('fs');
const path = require('path');
const Module = require('module');

// Get paths
const scriptDir = __dirname;
const projectRoot = path.join(scriptDir, '..');
const backendPath = path.join(projectRoot, 'backend');
const backendNodeModules = path.join(backendPath, 'node_modules');

// Add backend node_modules to module search path
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain) {
    // Try backend node_modules first for non-relative paths
    if (!request.startsWith('.') && !path.isAbsolute(request)) {
        const backendModulePath = path.join(backendNodeModules, request);
        try {
            return originalResolveFilename(backendModulePath, parent, isMain);
        } catch (e) {
            // Fall through to normal resolution
        }
    }
    return originalResolveFilename(request, parent, isMain);
};

// Load environment variables from backend
require('dotenv').config({ path: path.join(backendPath, '.env') });

// Now we can require mongoose (it will be found in backend/node_modules)
const mongoose = require('mongoose');

// Import models (using absolute paths)
const Internship = require(path.join(backendPath, 'models/internshipModel'));
const Course = require(path.join(backendPath, 'models/courseModel'));

// Helper function to check if WebP version exists
const checkWebPExists = (imagePath) => {
    if (!imagePath) return false;
    
    // Convert path to WebP
    const webpPath = imagePath.replace(/\.(jpeg|jpg|png)$/i, '.webp');
    
    // Check if file exists in public folder
    const publicPath = path.join(projectRoot, 'frontend/public', webpPath);
    
    return fs.existsSync(publicPath);
};

// Helper function to convert path to WebP
const convertToWebP = (imagePath) => {
    if (!imagePath) return imagePath;
    if (imagePath.toLowerCase().endsWith('.webp')) return imagePath;
    return imagePath.replace(/\.(jpeg|jpg|png)$/i, '.webp');
};

// Main migration function
const migrateImagePaths = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        let totalUpdated = 0;
        let totalSkipped = 0;
        let totalErrors = 0;

        // Migrate Internships
        console.log('\n📚 Migrating Internship image paths...');
        const internships = await Internship.find({});
        console.log(`Found ${internships.length} internships`);

        for (const internship of internships) {
            let internshipUpdated = false;
            
            if (internship.lectures && Array.isArray(internship.lectures)) {
                for (const lecture of internship.lectures) {
                    if (lecture.contentSections && Array.isArray(lecture.contentSections)) {
                        for (const section of lecture.contentSections) {
                            if (section.image && 
                                (section.image.endsWith('.jpeg') || 
                                 section.image.endsWith('.jpg') || 
                                 section.image.endsWith('.png'))) {
                                
                                // Check if WebP version exists
                                if (checkWebPExists(section.image)) {
                                    const oldPath = section.image;
                                    section.image = convertToWebP(section.image);
                                    console.log(`  ✅ Updated: ${oldPath} → ${section.image}`);
                                    internshipUpdated = true;
                                    totalUpdated++;
                                } else {
                                    console.log(`  ⚠️  Skipped (WebP not found): ${section.image}`);
                                    totalSkipped++;
                                }
                            }
                        }
                    }
                }
            }

            if (internshipUpdated) {
                await internship.save();
                console.log(`✅ Saved internship: ${internship.title}`);
            }
        }

        // Migrate Courses
        console.log('\n📖 Migrating Course image paths...');
        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses`);

        for (const course of courses) {
            let courseUpdated = false;
            
            if (course.sections && Array.isArray(course.sections)) {
                for (const section of course.sections) {
                    if (section.lectures && Array.isArray(section.lectures)) {
                        for (const lecture of section.lectures) {
                            if (lecture.contentSections && Array.isArray(lecture.contentSections)) {
                                for (const contentSection of lecture.contentSections) {
                                    if (contentSection.image && 
                                        (contentSection.image.endsWith('.jpeg') || 
                                         contentSection.image.endsWith('.jpg') || 
                                         contentSection.image.endsWith('.png'))) {
                                        
                                        // Check if WebP version exists
                                        if (checkWebPExists(contentSection.image)) {
                                            const oldPath = contentSection.image;
                                            contentSection.image = convertToWebP(contentSection.image);
                                            console.log(`  ✅ Updated: ${oldPath} → ${contentSection.image}`);
                                            courseUpdated = true;
                                            totalUpdated++;
                                        } else {
                                            console.log(`  ⚠️  Skipped (WebP not found): ${contentSection.image}`);
                                            totalSkipped++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (courseUpdated) {
                await course.save();
                console.log(`✅ Saved course: ${course.title}`);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Total paths updated: ${totalUpdated}`);
        console.log(`⚠️  Total paths skipped (WebP not found): ${totalSkipped}`);
        console.log(`❌ Total errors: ${totalErrors}`);
        console.log('='.repeat(60));
        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
};

// Run migration
if (require.main === module) {
    migrateImagePaths();
}

module.exports = { migrateImagePaths };

