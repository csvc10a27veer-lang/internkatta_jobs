// backend/config/phonepeConfig.js

const crypto = require('crypto');

// PhonePe Configuration — all values come from .env so each environment
// (local / test / production) uses its own credentials and URLs automatically.
// Never commit real secrets into this file.
const PHONEPE_CONFIG = {
  // In V2, the App ID (Client ID) is often mistakenly stored in PHONEPE_MERCHANT_ID
  CLIENT_ID: process.env.PHONEPE_MERCHANT_ID, 
  // The real Merchant ID as seen in the status API
  ACTUAL_MERCHANT_ID: process.env.PHONEPE_ACTUAL_MERCHANT_ID || 'M232T7DTC1W58',
  
  SALT_KEY: process.env.PHONEPE_SALT_KEY,
  SALT_INDEX: process.env.PHONEPE_SALT_INDEX || '1',

  // API Endpoints (v2 API)
  // According to PhonePe docs:
  // - Auth API: https://api.phonepe.com/apis/identity-manager
  // - Other APIs (Payment, Status, Refund): https://api.phonepe.com/apis/pg
  BASE_URL: process.env.PHONEPE_BASE_URL || 'https://api.phonepe.com/apis/pg',
  AUTH_TOKEN_URL: process.env.PHONEPE_AUTH_TOKEN_URL || 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token',

  // Callback / redirect base — derived from FRONTEND_URL / BACKEND_URL in .env.
  // Each environment's .env sets FRONTEND_URL to its own domain:
  //   local:  http://localhost:5173
  //   test:   https://test.internkatta.com
  //   prod:   https://internkatta.com
  CALLBACK_URL: `${process.env.BACKEND_URL || 'https://api.internkatta.com'}/api/payment/callback`,
  REDIRECT_URL: `${process.env.FRONTEND_URL || 'https://internkatta.com'}/payment/callback`,

  // Environment
  ENVIRONMENT: process.env.PHONEPE_ENVIRONMENT || 'UAT'
};

if (!PHONEPE_CONFIG.CLIENT_ID || !PHONEPE_CONFIG.SALT_KEY) {
  console.warn('⚠️  PhonePe credentials missing from .env (PHONEPE_MERCHANT_ID / PHONEPE_SALT_KEY). Payments will fail until these are set.');
}

// Generate PhonePe transaction ID
const generatePhonePeTransactionId = () => {
  return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Generate checksum for PhonePe API
const generateChecksum = (payload, saltKey, saltIndex) => {
  const base64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const string = base64 + '/pg/v1/pay' + saltKey;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  return sha256 + '###' + saltIndex;
};

// Verify PhonePe checksum
const verifyChecksum = (payload, checksum, saltKey, saltIndex) => {
  const base64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const string = base64 + saltKey;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const expectedChecksum = sha256 + '###' + saltIndex;
  return checksum === expectedChecksum;
};

// Create PhonePe payment payload (Updated for v2 API)
const createPaymentPayload = (orderId, amount, customerInfo, redirectUrl) => {
  const payload = {
    merchantId: PHONEPE_CONFIG.CLIENT_ID,
    merchantUserId: customerInfo.userId,
    merchantTransactionId: orderId,
    amount: amount * 100, // Convert to paise
    paymentFlow: {
      type: 'PG_CHECKOUT',
      message: 'Payment for order ' + orderId,
      merchantUrls: {
        redirectUrl: redirectUrl,
        cancelUrl: redirectUrl,
      }
    }
  };

  return payload;
};

// Create PhonePe API request headers (Updated for v2 API)
const createHeaders = (authToken) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `O-Bearer ${authToken}`
  };
};

// Helper function to get authorization token from PhonePe (NEW)
const getAuthToken = async () => {
  try {
    console.log('🔐 Generating PhonePe Authorization Token...');

    // Request Body parameters (as per docs)
    const requestBodyParams = new URLSearchParams();
    requestBodyParams.append('client_id', PHONEPE_CONFIG.CLIENT_ID);
    requestBodyParams.append('client_version', PHONEPE_CONFIG.SALT_INDEX);
    requestBodyParams.append('client_secret', PHONEPE_CONFIG.SALT_KEY);
    requestBodyParams.append('grant_type', 'client_credentials');

    const axios = require('axios');
    const tokenResponse = await axios.post(
      PHONEPE_CONFIG.AUTH_TOKEN_URL,
      requestBodyParams.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000
      }
    );

    console.log('✅ PhonePe Authorization Token Response:', tokenResponse.data);

    if (tokenResponse.data && tokenResponse.data.access_token) {
      return tokenResponse.data.access_token;
    } else {
      throw new Error('Failed to retrieve access_token from PhonePe');
    }

  } catch (error) {
    console.error('❌ Error generating PhonePe Authorization Token:', error.response?.data || error.message);
    throw new Error('Failed to generate PhonePe Authorization Token: ' + (error.response?.data?.message || error.message));
  }
};

module.exports = {
  PHONEPE_CONFIG,
  generatePhonePeTransactionId,
  generateChecksum,
  verifyChecksum,
  createPaymentPayload,
  createHeaders,
  getAuthToken
};