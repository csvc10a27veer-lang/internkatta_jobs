const mongoose = require('mongoose');
require('dotenv').config({ path: 'e:/Fourie_Skillup/backend/.env' });
const { getDashboardStats } = require('e:/Fourie_Skillup/backend/controllers/dashboardController');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');
    
    const req = {
      query: { page: 1, limit: 10, dateMode: 'lifetime' }
    };
    const res = {
      status: (code) => { console.log('STATUS:', code); return res; },
      json: (data) => { console.log('JSON:', data.message || (data.data ? 'Data loaded successfully' : data)); }
    };

    await getDashboardStats(req, res);
  } catch (err) {
    console.error("CAUGHT ERROR:", err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
