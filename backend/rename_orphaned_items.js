const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Payment = require('./models/paymentModel');
const Course = require('./models/courseModel');
const Internship = require('./models/internshipModel');

async function renameOrphanedItems() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/InternKatta');
        console.log('Connected to MongoDB');

        const payments = await Payment.find({ status: { $in: ['COMPLETED', 'SUCCESS'] } });
        
        let updatedCount = 0;

        for (const payment of payments) {
            if (!payment.productName || payment.productName.includes('Unknown/Deleted') || payment.productName === 'Deleted Course' || payment.productName === 'Deleted Internship') {
                if (payment.type === 'COURSE' && payment.courseId) {
                    const courseExists = await Course.findById(payment.courseId);
                    if (!courseExists) {
                        payment.productName = 'Archived Course';
                        await payment.save();
                        updatedCount++;
                    }
                } else if (payment.type === 'INTERNSHIP' && payment.internshipId) {
                    const internshipExists = await Internship.findById(payment.internshipId);
                    if (!internshipExists) {
                        payment.productName = 'Archived Internship';
                        await payment.save();
                        updatedCount++;
                    }
                }
            }
        }

        console.log(`\nSuccessfully updated ${updatedCount} orphaned payments to "Archived Course" or "Archived Internship".`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
}

renameOrphanedItems();
