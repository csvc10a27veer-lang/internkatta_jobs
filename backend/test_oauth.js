require('dotenv').config({ path: '.env' });
const { getAuthToken, PHONEPE_CONFIG } = require('./config/phonepeConfig.js');

async function test() {
  console.log('CLIENT_ID:', PHONEPE_CONFIG.CLIENT_ID);
  console.log('SALT_KEY:', PHONEPE_CONFIG.SALT_KEY);
  console.log('SALT_INDEX:', PHONEPE_CONFIG.SALT_INDEX);
  console.log('AUTH_URL:', PHONEPE_CONFIG.AUTH_TOKEN_URL);
  
  try {
    const token = await getAuthToken();
    console.log('Token:', token);
  } catch (err) {
    console.log('Error:', err.message);
  }
}

test();
