const mongoose = require('mongoose');
require('dotenv').config();

const testController = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internkatta', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('DB Connected');
        
        const { getLearnerProgressDetail } = require('./controllers/adminController');
        const User = require('./models/userModel');
        const Internship = require('./models/internshipModel');

        const user = await User.findOne({});
        const internship = await Internship.findOne({});
        
        if (!user || !internship) {
            console.log('No user or internship found');
            process.exit(0);
        }

        const req = {
            params: {
                userId: user._id.toString(),
                internshipId: internship._id.toString()
            }
        };

        const res = {
            status: function(code) {
                this.code = code;
                return this;
            },
            json: function(data) {
                console.log('Status:', this.code);
                console.log('Response:', JSON.stringify(data, null, 2));
            }
        };

        await getLearnerProgressDetail(req, res);

    } catch (e) {
        console.error('Test Error:', e);
    } finally {
        mongoose.connection.close();
    }
};

testController();
