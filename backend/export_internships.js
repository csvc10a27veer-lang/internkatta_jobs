// backend/export_internships.js

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Internship = require('./models/internshipModel'); // Adjust path if needed
const connectDB = require('./config/dbconnection');

async function generateInternshipTable() {
    try {
        await connectDB();

        // Fetch all internships, selecting only the necessary fields
        const internships = await Internship.find({})
            .select('title tutor mentor duration price -_id')
            .lean();

        if (internships.length === 0) {
            console.log("No internships found in the database.");
            process.exit(0);
        }

        // Map the data to match your requested table headers
        const tableData = internships.map(internship => ({
            'Internship Name': internship.title || 'N/A',
            'Mentor': internship.tutor || internship.mentor || 'N/A',
            'Duration': internship.duration || 'N/A',
            'Price': internship.price || 'N/A'
        }));

        // Output as a clean table in the terminal
        console.table(tableData);

    } catch (error) {
        console.error("Error fetching internships:", error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
}

generateInternshipTable();