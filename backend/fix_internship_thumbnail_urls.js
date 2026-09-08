// Script to fix internship thumbnail URLs in the database
// Replaces old domain URLs with the correct internkatta.com domain

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/InternKatta', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Import the Internship model
const Internship = require('./models/internshipModel');

async function fixInternshipThumbnailUrls() {
    try {
        console.log('🔍 Finding internships with incorrect thumbnail URLs...\n');
        
        // Find all internships
        const internships = await Internship.find({});

        console.log(`📊 Found ${internships.length} total internships`);

        if (internships.length === 0) {
            console.log('✅ No internships found in database.');
            return;
        }

        let updatedCount = 0;
        const oldDomains = [
            'api.InternKatta.gradezy.in',
            'api.internkatta.gradezy.in',
            'InternKatta.gradezy.in',
            'internkatta.gradezy.in',
            'api.skillup.gradezy.in',
            'skillup.gradezy.in',
            'localhost:4000',
            'http://localhost:4000',
            'https://localhost:4000'
        ];

        for (const internship of internships) {
            let hasChanges = false;

            // Fix thumbnail URL
            if (internship.thumbnail && internship.thumbnail.url) {
                let thumbnailUrl = internship.thumbnail.url;
                const originalUrl = thumbnailUrl;
                
                // Check if URL contains any old domain or gradezy.in
                if (thumbnailUrl.includes('gradezy.in') || thumbnailUrl.includes('localhost:4000')) {
                    // Replace any domain with correct domain
                    thumbnailUrl = thumbnailUrl.replace(/https?:\/\/[^\/]+/, 'https://api.internkatta.com');
                    internship.thumbnail.url = thumbnailUrl;
                    hasChanges = true;
                    console.log(`🖼️  Fixed thumbnail URL for internship: ${internship.title}`);
                    console.log(`   Old: ${originalUrl}`);
                    console.log(`   New: ${thumbnailUrl}`);
                }
            }

            // Save the internship if changes were made
            if (hasChanges) {
                await internship.save();
                updatedCount++;
                console.log(`💾 Saved changes for internship: ${internship.title}\n`);
            }
        }

        console.log(`\n✅ Successfully updated ${updatedCount} internships!`);
        console.log('🎉 All thumbnail URLs have been updated to use api.internkatta.com');

    } catch (error) {
        console.error('❌ Error fixing internship thumbnail URLs:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
fixInternshipThumbnailUrls();



