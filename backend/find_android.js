const mongoose = require('mongoose');
const Internship = require('./models/internshipModel');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = 'mongodb+srv://swaroopjadhav6161_db_user:noSmX6Q4iKwzfMQq@cluster0.95b76ul.mongodb.net/internkatta?appName=Cluster0';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    const internships = await Internship.find({ deleted: { $ne: true } }).select('_id title lectures');
    internships.forEach(i => {
      console.log(`Internship: ${i.title} (ID: ${i._id}), Lectures count: ${i.lectures?.length}`);
    });
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

check();
