// Script to fix admin roles in the database
// This will add the role field to existing admin records

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to your MongoDB database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/InternKatta', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Import the Admin model
const Admin = require('./models/adminModel');

async function fixAdminRoles() {
    try {
        console.log('🔍 Finding admins without role field...');
        
        // Find all admins that don't have a role field or have undefined role
        const admins = await Admin.find({
            $or: [
                { role: { $exists: false } },
                { role: undefined },
                { role: null }
            ]
        });

        console.log(`📊 Found ${admins.length} admins without role field`);

        if (admins.length === 0) {
            console.log('✅ All admins already have role field. Database is clean!');
            return;
        }

        let updatedCount = 0;

        for (const admin of admins) {
            console.log(`🔄 Updating admin: ${admin.fullName || 'Unknown'} (${admin.email})`);
            
            // Set the role to 'admin'
            admin.role = 'admin';
            
            // Fix undefined fullName if needed
            if (!admin.fullName) {
                admin.fullName = 'Admin User';
                console.log(`  - Fixed undefined fullName for ${admin.email}`);
            }
            
            await admin.save();
            
            updatedCount++;
            console.log(`✅ Updated admin: ${admin.fullName}`);
        }

        console.log(`\n✅ Successfully updated ${updatedCount} admins!`);
        console.log('🎉 All admins now have the role field set to "admin"');

        // Verify the fix
        console.log('\n🔍 Verifying the fix...');
        const allAdmins = await Admin.find({}).select('fullName email role');
        console.log('Current admin list:');
        allAdmins.forEach(admin => {
            console.log(`  - ${admin.fullName} (${admin.email}): role = ${admin.role}`);
        });

    } catch (error) {
        console.error('❌ Error fixing admin roles:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
fixAdminRoles();
