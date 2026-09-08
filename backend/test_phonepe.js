const axios = require('axios');
const crypto = require('crypto');

const payload = {
  merchantId: 'SU2508251500285640112856',
  merchantUserId: 'testuser',
  merchantTransactionId: 'TXN_123456789',
  amount: 10000,
  redirectUrl: 'https://internkatta.com/payment/callback',
  redirectMode: 'POST',
  callbackUrl: 'https://api.internkatta.com/api/payment/callback',
  mobileNumber: '9999999999',
  paymentInstrument: {
    type: 'PAY_PAGE'
  }
};

const saltKey = '006c20b2-0a39-423a-9cd3-8e359879dd15';
const saltIndex = '1';

const base64 = Buffer.from(JSON.stringify(payload)).toString('base64');
const string = base64 + '/pg/v1/pay' + saltKey;
const checksum = crypto.createHash('sha256').update(string).digest('hex') + '###' + saltIndex;

async function testPhonePe() {
  try {
    const res = await axios.post('https://api.phonepe.com/apis/hermes/pg/v1/pay', {
      request: base64
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      }
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    console.log('ERROR:', err.response?.status);
    console.log('ERROR DATA:', err.response?.data);
  }
}

testPhonePe();
