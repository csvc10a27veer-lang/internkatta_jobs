const mongoose = require('mongoose');
const Internship = require('./models/internshipModel');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const ints = await Internship.find({}).select('title duration');
    console.log(ints);
    process.exit();
});
