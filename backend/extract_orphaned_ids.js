const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Payment = require('./models/paymentModel');
const Course = require('./models/courseModel');
const Internship = require('./models/internshipModel');

async function extractOrphanedIds() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/InternKatta');
        console.log('Connected to MongoDB');

        const payments = await Payment.find({ status: { $in: ['COMPLETED', 'SUCCESS'] } }).lean();
        
        const orphanedCourses = new Set();
        const orphanedInternships = new Set();

        for (const payment of payments) {
            // Check if productName is missing or is the default fallback
            if (!payment.productName || payment.productName.includes('Unknown/Deleted') || payment.productName === 'Deleted Course' || payment.productName === 'Deleted Internship') {
                if (payment.type === 'COURSE' && payment.courseId) {
                    const courseExists = await Course.findById(payment.courseId);
                    if (!courseExists) {
                        orphanedCourses.add(payment.courseId.toString());
                    }
                } else if (payment.type === 'INTERNSHIP' && payment.internshipId) {
                    const internshipExists = await Internship.findById(payment.internshipId);
                    if (!internshipExists) {
                        orphanedInternships.add(payment.internshipId.toString());
                    }
                }
            }
        }

        console.log('\n--- Orphaned Course IDs ---');
        if (orphanedCourses.size === 0) {
            console.log('None found.');
        } else {
            orphanedCourses.forEach(id => console.log(id));
        }

        console.log('\n--- Orphaned Internship IDs ---');
        if (orphanedInternships.size === 0) {
            console.log('None found.');
        } else {
            orphanedInternships.forEach(id => console.log(id));
        }

        console.log('\nPlease provide the names corresponding to these IDs so we can backfill them.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
}

extractOrphanedIds();
