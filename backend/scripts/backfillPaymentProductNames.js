require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Payment = require('../models/paymentModel');
const Course = require('../models/courseModel');
const Internship = require('../models/internshipModel');

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fourie_skillup';
        await mongoose.connect(uri);
        console.log('Connected to DB.');

        const payments = await Payment.find({});
        console.log(`Found ${payments.length} payment records.`);

        let updatedCount = 0;
        let unknownCount = 0;

        for (const payment of payments) {
            let updated = false;

            if (payment.type === 'COURSE' && payment.courseId) {
                // Find course (including soft-deleted ones)
                const course = await Course.findById(payment.courseId);
                if (course) {
                    payment.productName = course.title;
                    payment.productImage = course.thumbnailUrl || '';
                    updated = true;
                } else {
                    // Permanently deleted
                    payment.productName = "Unknown/Deleted Course";
                    payment.productImage = "";
                    updated = true;
                    unknownCount++;
                }
            } else if (payment.type === 'INTERNSHIP' && payment.internshipId) {
                // Find internship (including soft-deleted ones)
                const internship = await Internship.findById(payment.internshipId);
                if (internship) {
                    payment.productName = internship.title;
                    payment.productImage = internship.thumbnailUrl || '';
                    updated = true;
                } else {
                    // Permanently deleted
                    payment.productName = "Unknown/Deleted Internship";
                    payment.productImage = "";
                    updated = true;
                    unknownCount++;
                }
            } else if (!payment.productName) {
                // Failsafe for entirely broken records
                payment.productName = payment.type === 'COURSE' ? "Unknown/Deleted Course" : "Unknown/Deleted Internship";
                payment.productImage = "";
                updated = true;
                unknownCount++;
            }

            if (updated) {
                await payment.save();
                updatedCount++;
            }
        }

        console.log(`\nMigration complete!`);
        console.log(`Successfully updated ${updatedCount} records.`);
        console.log(`Assigned "Unknown/Deleted" to ${unknownCount} unrecoverable records.`);
        
        await mongoose.disconnect();
        console.log('Disconnected from DB.');
        process.exit(0);

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
