const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const internshipSchema = new mongoose.Schema({
    internshipTitle: { type: String },
    lectures: [{
        lectureTitle: { type: String },
        lectureDescription: { type: String },
        mcqs: [{
            question: String,
            options: [String],
            correctOption: Number
        }]
    }]
});

const Internship = mongoose.model('Internship_Test', internshipSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const newInternship = new Internship({
            internshipTitle: 'Test Internship',
            lectures: [
                { lectureTitle: 'Topic 1' },
                { lectureTitle: 'Topic 2' }
            ]
        });

        await newInternship.save();
        console.log('Created internship with IDs:');
        newInternship.lectures.forEach(l => console.log(l.lectureTitle, l._id.toString()));

        // Simulate admin update WITH keeping IDs
        newInternship.lectures = [
            { _id: newInternship.lectures[0]._id.toString(), lectureTitle: 'Topic 1 - Updated' },
            { _id: newInternship.lectures[1]._id.toString(), lectureTitle: 'Topic 2 - Updated' },
            { lectureTitle: 'Topic 3 - New' }
        ];

        await newInternship.save();
        
        console.log('After update with string IDs:');
        newInternship.lectures.forEach(l => console.log(l.lectureTitle, l._id.toString()));

        // Simulate admin update WITH keeping ObjectIDs
        newInternship.lectures = [
            { _id: newInternship.lectures[0]._id, lectureTitle: 'Topic 1 - Final' },
            { _id: newInternship.lectures[1]._id, lectureTitle: 'Topic 2 - Final' }
        ];

        await newInternship.save();
        
        console.log('After update with Object IDs:');
        newInternship.lectures.forEach(l => console.log(l.lectureTitle, l._id.toString()));

        await Internship.deleteOne({ _id: newInternship._id });

        mongoose.disconnect();
    } catch (e) {
        console.error(e);
        mongoose.disconnect();
    }
}

run();
