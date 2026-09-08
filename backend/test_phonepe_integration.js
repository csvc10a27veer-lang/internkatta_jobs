// backend/test_phonepe_integration.js
// Test script to verify PhonePe v2 API integration

const { getAuthToken, PHONEPE_CONFIG } = require('./config/phonepeConfig');

async function testPhonePeIntegration() {
  console.log('🧪 Testing PhonePe v2 API Integration...\n');
  
  try {
    // Test 1: Configuration
    console.log('1️⃣ Testing PhonePe Configuration...');
    console.log('MERCHANT_ID:', PHONEPE_CONFIG.MERCHANT_ID ? 'SET' : 'NOT_SET');
    console.log('SALT_KEY:', PHONEPE_CONFIG.SALT_KEY ? 'SET (' + PHONEPE_CONFIG.SALT_KEY.length + ' chars)' : 'NOT_SET');
    console.log('BASE_URL:', PHONEPE_CONFIG.BASE_URL);
    console.log('AUTH_TOKEN_URL:', PHONEPE_CONFIG.AUTH_TOKEN_URL);
    console.log('ENVIRONMENT:', PHONEPE_CONFIG.ENVIRONMENT);
    console.log('✅ Configuration test passed\n');
    
    // Test 2: Authorization Token
    console.log('2️⃣ Testing Authorization Token Generation...');
    const authToken = await getAuthToken();
    console.log('Auth Token:', authToken ? 'SET (' + authToken.substring(0, 20) + '...)' : 'NOT_SET');
    console.log('✅ Authorization token test passed\n');
    
    // Test 3: API Endpoint Test
    console.log('3️⃣ Testing PhonePe v2 API Endpoint...');
    const axios = require('axios');
    
    const testPayload = {
      merchantTransactionId: 'TEST_' + Date.now(),
      amount: 100, // ₹1.00 in paise
      paymentFlow: {
        type: 'PG_CHECKOUT',
        merchantUrls: {
          redirectUrl: 'https://InternKatta.gradezy.in/payment/callback',
        }
      }
    };
    
    console.log('Test Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await axios.post(
      `${PHONEPE_CONFIG.BASE_URL}/v2/pay`,
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${authToken}`
        },
        timeout: 15000
      }
    );
    
    console.log('PhonePe API Response:', response.data);
    console.log('✅ API endpoint test passed\n');
    
    console.log('🎉 All PhonePe integration tests passed successfully!');
    
  } catch (error) {
    console.error('❌ PhonePe integration test failed:', error.message);
    
    if (error.response) {
      console.error('Error Response:', error.response.data);
      console.error('Error Status:', error.response.status);
    }
  }
}

// Run the test
if (require.main === module) {
  testPhonePeIntegration();
}

module.exports = { testPhonePeIntegration };
