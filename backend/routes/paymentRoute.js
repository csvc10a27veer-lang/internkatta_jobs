// backend/routes/paymentRoute.js

const express = require('express');
const router = express.Router();
const { 
  createCoursePayment, 
  createInternshipPayment, 
  createCartPayment,
  paymentCallback, 
  getPaymentStatus,
  checkUserPurchase,
  getAllPayments
} = require('../controllers/paymentController');

// Create payment for course
router.post('/course', createCoursePayment);

// Create payment for internship
router.post('/internship', createInternshipPayment);

// Create payment for Cart
router.post('/create-cart-payment', createCartPayment);

// Payment callback from PhonePe
router.post('/callback', paymentCallback);

// Get payment status
router.get('/status/:transactionId', getPaymentStatus);

// Check if user has purchased a specific item
router.get('/check/:userId/:itemType/:itemId', checkUserPurchase);

// Get all payments for admin
router.get('/admin/all', getAllPayments);

// --- NEW PHONEPE V2 API ROUTES ---

// Test PhonePe configuration
router.get('/test-config', async (req, res) => {
  try {
    const { getAuthToken } = require('../config/phonepeConfig');
    const authToken = await getAuthToken();
    
    res.json({
      success: true,
      message: 'PhonePe configuration test successful',
      data: {
        authToken: authToken ? 'SET' : 'NOT_SET',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'PhonePe configuration test failed',
      error: error.message
    });
  }
});

// Check PhonePe payment status
router.get('/phonepe-status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { getAuthToken } = require('../config/phonepeConfig');
    const { PHONEPE_CONFIG } = require('../config/phonepeConfig');
    
    const authToken = await getAuthToken();
    
    // Query PhonePe v2 status API
    const phonepeStatusResponse = await require('axios').get(
      `${PHONEPE_CONFIG.BASE_URL}/v2/status/${transactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${authToken}`
        }
      }
    );
    
    res.json({
      success: true,
      message: 'PhonePe status retrieved successfully',
      data: phonepeStatusResponse.data
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking PhonePe status',
      error: error.message
    });
  }
});

module.exports = router;
