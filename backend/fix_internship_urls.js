// Script to fix existing internship URLs in the database
// This will update all internship thumbnails from localhost:4000 to production HTTPS

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to your MongoDB database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/InternKatta', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Import the Internship model
const Internship = require('./models/internshipModel');

async function fixInternshipUrls() {
    try {
        console.log('🔍 Finding internships with localhost URLs...');
        
        // Find all internships that have localhost:4000 URLs
        const internships = await Internship.find({
            'thumbnail.url': { $regex: /localhost:4000/ }
        });

        console.log(`📊 Found ${internships.length} internships with localhost URLs`);

        if (internships.length === 0) {
            console.log('✅ No internships found with localhost URLs. Database is already clean!');
            return;
        }

        let updatedCount = 0;

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
                updatedCount++;
                console.log(`💾 Saved changes for internship: ${internship.title}`);
            }
        }

        console.log(`\n✅ Successfully updated ${updatedCount} internships!`);
        console.log('🎉 All localhost URLs have been replaced with production HTTPS URLs');

    } catch (error) {
        console.error('❌ Error fixing internship URLs:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
fixInternshipUrls();
