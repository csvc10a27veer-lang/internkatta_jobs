require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const Internship = require('../models/internshipModel.js');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fourie_skillup'; // Fallback for local testing if env is missing

const standardizeThumbnails = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully.');

        const internships = await Internship.find({});
        console.log(`Found ${internships.length} internships to inspect.`);

        const uploadsDir = path.join(__dirname, '..', 'uploads', 'thumbnails');
        let processedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const internship of internships) {
            if (!internship.thumbnail || !internship.thumbnail.public_id) {
                console.log(`[SKIPPED] Internship '${internship.title}' has no valid thumbnail public_id.`);
                skippedCount++;
                continue;
            }

            const currentPublicId = internship.thumbnail.public_id;
            const ext = path.extname(currentPublicId).toLowerCase();

            // Check if it's already a webp file
            if (ext === '.webp') {
                console.log(`[SKIPPED] Internship '${internship.title}' already uses .webp (${currentPublicId}).`);
                skippedCount++;
                continue;
            }

            const oldFilePath = path.join(uploadsDir, currentPublicId);

            if (!fs.existsSync(oldFilePath)) {
                console.log(`[ERROR] File not found for internship '${internship.title}': ${oldFilePath}`);
                errorCount++;
                continue;
            }

            try {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const newFilename = `internship-${uniqueSuffix}.webp`;
                const newFilePath = path.join(uploadsDir, newFilename);

                // Read and convert using sharp
                await sharp(oldFilePath)
                    .webp({ quality: 80 })
                    .toFile(newFilePath);

                // Update database URL logic similar to createInternship
                // For backend scripts, we just replace the filename in the URL
                const oldUrl = internship.thumbnail.url;
                const newUrl = oldUrl.replace(currentPublicId, newFilename);

                internship.thumbnail.public_id = newFilename;
                internship.thumbnail.url = newUrl;

                await internship.save();

                // Delete old file
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.error(`[WARNING] Could not delete old file ${oldFilePath}:`, err);
                });

                console.log(`[SUCCESS] Converted thumbnail for '${internship.title}' to ${newFilename}`);
                processedCount++;
            } catch (err) {
                console.error(`[ERROR] Failed to process thumbnail for '${internship.title}':`, err);
                errorCount++;
            }
        }

        console.log('--- Summary ---');
        console.log(`Total Internships: ${internships.length}`);
        console.log(`Processed (Converted): ${processedCount}`);
        console.log(`Skipped (Already webp or missing): ${skippedCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

standardizeThumbnails();
