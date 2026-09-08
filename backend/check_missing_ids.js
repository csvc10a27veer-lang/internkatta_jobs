const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Payment = require('./models/paymentModel');

async function checkMissingIds() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/InternKatta');
        console.log('Connected to MongoDB');

        const missingCourseIds = await Payment.find({ status: { $in: ['COMPLETED', 'SUCCESS'] }, type: 'COURSE', courseId: null });
        const missingInternshipIds = await Payment.find({ status: { $in: ['COMPLETED', 'SUCCESS'] }, type: 'INTERNSHIP', internshipId: null });
        
        console.log(`Payments with missing courseId: ${missingCourseIds.length}`);
        console.log(`Payments with missing internshipId: ${missingInternshipIds.length}`);
        
        // Let's update them!
        let updated = 0;
        for (const payment of [...missingCourseIds, ...missingInternshipIds]) {
            if (!payment.productName || payment.productName === 'Deleted Course' || payment.productName === 'Deleted Internship' || payment.productName.includes('Unknown/Deleted')) {
                payment.productName = payment.type === 'COURSE' ? 'Archived Course' : 'Archived Internship';
                await payment.save();
                updated++;
            }
        }
        
        console.log(`Updated ${updated} payments that had entirely missing IDs.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
}

checkMissingIds();
