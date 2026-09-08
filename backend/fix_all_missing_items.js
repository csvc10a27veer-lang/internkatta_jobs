const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Payment = require('./models/paymentModel');
const Course = require('./models/courseModel');
const Internship = require('./models/internshipModel');

async function fixAllMissingItems() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/InternKatta');
        console.log('Connected to MongoDB');

        // Find ALL payments regardless of status!
        const payments = await Payment.find({});
        
        let updatedCount = 0;

        for (const payment of payments) {
            if (!payment.productName || payment.productName.includes('Unknown/Deleted') || payment.productName === 'Deleted Course' || payment.productName === 'Deleted Internship') {
                
                let newName = '';
                
                if (payment.type === 'COURSE') {
                    if (payment.courseId) {
                        const courseExists = await Course.findById(payment.courseId);
                        if (!courseExists) {
                            newName = 'Archived Course';
                        }
                    } else {
                        // Completely missing courseId
                        newName = 'Archived Course';
                    }
                } else if (payment.type === 'INTERNSHIP') {
                    if (payment.internshipId) {
                        const internshipExists = await Internship.findById(payment.internshipId);
                        if (!internshipExists) {
                            newName = 'Archived Internship';
                        }
                    } else {
                        // Completely missing internshipId
                        newName = 'Archived Internship';
                    }
                } else {
                    // Fallback for unknown type
                    newName = 'Archived Item';
                }

                if (newName) {
                    // Use updateOne to bypass strict schema validation on other fields
                    await Payment.updateOne({ _id: payment._id }, { $set: { productName: newName } });
                    updatedCount++;
                }
            }
        }

        console.log(`\nSuccessfully updated ${updatedCount} more payments (including Pending/Failed ones)!`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
}

fixAllMissingItems();
