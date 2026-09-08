// backend/controllers/paymentController.js

const axios = require('axios');
const crypto = require('crypto');
const Notification = require('../models/notificationModel');
const Course = require('../models/courseModel');
const Internship = require('../models/internshipModel');
const User = require('../models/userModel');
const Payment = require('../models/paymentModel');
const Coupon = require('../models/couponModel');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');
const { sendInvoiceEmail } = require('../utils/emailService');
const { 
  PHONEPE_CONFIG, 
  generatePhonePeTransactionId, 
  generateChecksum, 
  verifyChecksum, 
  createPaymentPayload, 
  createHeaders,
  getAuthToken
} = require('../config/phonepeConfig');

// PhonePe Production Payment System

// Create payment for Cart
const createCartPayment = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total actual final price from cart
    let actualFinalPrice = 0;
    let originalAmount = 0;
    
    user.cart.forEach(item => {
        actualFinalPrice += item.discountedPrice;
        originalAmount += item.price;
    });

    // Generate unique transaction ID
    const transactionId = generatePhonePeTransactionId();

    // Create payment record in database
    const paymentRecord = new Payment({
      transactionId,
      userId,
      amount: actualFinalPrice,
      originalAmount: originalAmount,
      status: 'PENDING',
      type: 'CART',
      productName: `Cart Payment (${user.cart.length} items)`,
      productImage: '', // Can be empty for cart
      customerName: user.fullName,
      customerEmail: user.email,
      customerPhone: user.phone,
      cartItems: user.cart.map(item => ({
        itemType: item.itemType,
        itemId: item.itemId,
        price: item.price,
        discountedPrice: item.discountedPrice,
        couponCode: item.couponCode,
        couponId: item.couponId,
        name: item.name
      }))
    });

    await paymentRecord.save();

    // Create PhonePe payment payload
    const customerInfo = {
      userId: user._id.toString(),
      phone: user.phone || '9999999999'
    };

    const redirectUrl = `${PHONEPE_CONFIG.REDIRECT_URL}?transactionId=${transactionId}&itemType=cart&itemId=cart`;
    const payload = createPaymentPayload(transactionId, actualFinalPrice, customerInfo, redirectUrl);

    // 1. Get Authorization Token
    const authToken = await getAuthToken();

    // Create PhonePe API request headers
    const headers = createHeaders(authToken);

    // Call PhonePe v2 API
    const phonepeResponse = await axios.post(
      `${PHONEPE_CONFIG.BASE_URL}/checkout/v2/pay`,
      payload,
      { headers }
    );

    if (phonepeResponse.data.redirectUrl && phonepeResponse.data.orderId) {
      paymentRecord.phonepeTransactionId = phonepeResponse.data.orderId;
      paymentRecord.phonepeResponse = phonepeResponse.data;
      await paymentRecord.save();

      res.json({
        success: true,
        paymentUrl: phonepeResponse.data.redirectUrl,
        transactionId: transactionId,
        phonepeTransactionId: phonepeResponse.data.orderId
      });
    } else {
      console.error('❌ PhonePe response missing redirectUrl/orderId:', phonepeResponse.data);
      throw new Error('PhonePe payment initiation failed');
    }

  } catch (error) {
    console.error('Payment creation error (Cart):', error);
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed',
      error: error.message
    });
  }
};

// Create payment for course
const createCoursePayment = async (req, res) => {
  try {
    const { courseId, userId, couponCode, finalPrice } = req.body;

    // Validate course and user
    const course = await Course.findOne({ _id: courseId, deleted: { $ne: true } });
    const user = await User.findById(userId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle coupon validation if provided
    let coupon = null;
    let actualFinalPrice = course.discountedPrice || course.price;
    
    if (couponCode) {
      coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(),
        courseId: courseId,
        isActive: true,
        validUntil: { $gt: new Date() }
      });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid or expired coupon code' });
      }

      // Check usage limit
      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit exceeded' });
      }

      // Check if user has already used this coupon
      const hasUsedCoupon = coupon.usedBy.some(usage => 
        usage.user.toString() === userId.toString()
      );

      if (hasUsedCoupon) {
        return res.status(400).json({ message: 'You have already used this coupon' });
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (actualFinalPrice * coupon.discountAmount) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        discountAmount = coupon.discountAmount;
      }

      // Ensure discount doesn't exceed item price
      if (discountAmount > actualFinalPrice) {
        discountAmount = actualFinalPrice;
      }

      actualFinalPrice = actualFinalPrice - discountAmount;
    }

    // Validate final price if provided
    if (finalPrice && Math.abs(finalPrice - actualFinalPrice) > 0.01) {
      return res.status(400).json({ message: 'Price mismatch. Please refresh and try again.' });
    }

    // Check if user already purchased or is enrolled in this course
    const existingPayment = await Payment.findOne({
      userId,
      courseId,
      status: 'COMPLETED'
    });

    const isEnrolled = user.enrolledCourses.some(id => id.toString() === courseId.toString());

    if (existingPayment || isEnrolled) {
      return res.status(400).json({ message: 'You have already purchased this course' });
    }

    // Generate unique transaction ID
    const transactionId = generatePhonePeTransactionId();

    // Create payment record in database
    const paymentRecord = new Payment({
      transactionId,
      userId,
      courseId,
      amount: actualFinalPrice,
      originalAmount: course.discountedPrice || course.price,
      couponCode: coupon ? coupon.code : null,
      couponId: coupon ? coupon._id : null,
      status: 'PENDING',
      type: 'COURSE',
      productName: course.title,
      productImage: course.thumbnailUrl || '',
      customerName: user.fullName,
      customerEmail: user.email,
      customerPhone: user.phone
    });

    await paymentRecord.save();

    // Create PhonePe payment payload
    const customerInfo = {
      userId: user._id.toString(),
      phone: user.phone || '9999999999'
    };

    const redirectUrl = `${PHONEPE_CONFIG.REDIRECT_URL}?transactionId=${transactionId}&itemType=course&itemId=${courseId}`;
    const payload = createPaymentPayload(transactionId, actualFinalPrice, customerInfo, redirectUrl);

    // --- NEW AUTHENTICATION FLOW ---
    // 1. Get Authorization Token
    const authToken = await getAuthToken();
    console.log('🔑 Received Auth Token:', authToken ? 'SET' : 'NOT_SET');

    // Create PhonePe API request headers
    const headers = createHeaders(authToken);

    // --- ADDED LOGGING HERE ---
    console.log('--- PhonePe v2 API Request Details (Course) ---');
    console.log('Timestamp:', new Date().toISOString());
    console.log('API URL:', `${PHONEPE_CONFIG.BASE_URL}/checkout/v2/pay`);
    console.log('Headers Sent:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': 'O-Bearer ' + authToken.substring(0, 20) + '...'
    });
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('--- End PhonePe v2 API Request Details (Course) ---');
    // --- END ADDED LOGGING ---

    // Call PhonePe v2 API - According to docs: POST /checkout/v2/pay
    const phonepeResponse = await axios.post(
      `${PHONEPE_CONFIG.BASE_URL}/checkout/v2/pay`,
      payload,
      { headers }
    );

    console.log('✅ PhonePe pay API response:', JSON.stringify(phonepeResponse.data, null, 2));

    if (phonepeResponse.data.redirectUrl && phonepeResponse.data.orderId) {
      // Update payment record with PhonePe transaction ID
      paymentRecord.phonepeTransactionId = phonepeResponse.data.orderId;
      paymentRecord.phonepeResponse = phonepeResponse.data;
      await paymentRecord.save();

      res.json({
        success: true,
        paymentUrl: phonepeResponse.data.redirectUrl,
        transactionId: transactionId,
        phonepeTransactionId: phonepeResponse.data.orderId
      });
    } else {
      console.error('❌ PhonePe response missing redirectUrl/orderId:', phonepeResponse.data);
      throw new Error('PhonePe payment initiation failed');
    }

  } catch (error) {
    console.error('Payment creation error (Course):', error.response?.data || error.message);
    if (error.response) {
      console.error('PhonePe pay API error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed',
      error: error.response?.data || error.message
    });
  }
};

// Create payment for internship
const createInternshipPayment = async (req, res) => {
  try {
    console.log('Payment request received:', req.body);
    const { internshipId, userId, couponCode, finalPrice } = req.body;

    // Validate internship and user
    const internship = await Internship.findOne({ _id: internshipId, deleted: { $ne: true } });
    const user = await User.findById(userId);

    console.log('Internship found:', internship ? 'Yes' : 'No');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!internship) {
      console.log('Internship not found for ID:', internshipId);
      return res.status(404).json({ message: 'Internship not found' });
    }

    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle coupon validation if provided
    let coupon = null;
    let actualFinalPrice = internship.discountedPrice || internship.price;
    
    if (couponCode) {
      coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(),
        internshipId: internshipId,
        isActive: true,
        validUntil: { $gt: new Date() }
      });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid or expired coupon code' });
      }

      // Check usage limit
      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit exceeded' });
      }

      // Check if user has already used this coupon
      const hasUsedCoupon = coupon.usedBy.some(usage => 
        usage.user.toString() === userId.toString()
      );

      if (hasUsedCoupon) {
        return res.status(400).json({ message: 'You have already used this coupon' });
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (actualFinalPrice * coupon.discountAmount) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        discountAmount = coupon.discountAmount;
      }

      // Ensure discount doesn't exceed item price
      if (discountAmount > actualFinalPrice) {
        discountAmount = actualFinalPrice;
      }

      actualFinalPrice = actualFinalPrice - discountAmount;
    }

    // Validate final price if provided
    if (finalPrice && Math.abs(finalPrice - actualFinalPrice) > 0.01) {
      return res.status(400).json({ message: 'Price mismatch. Please refresh and try again.' });
    }

    // Check if user already purchased or is enrolled in this internship
    const existingPayment = await Payment.findOne({
      userId,
      internshipId,
      status: 'COMPLETED'
    });

    const isEnrolled = user.enrolledInternships.some(id => id.toString() === internshipId.toString());

    if (existingPayment || isEnrolled) {
      console.log('User already purchased or enrolled in this internship');
      return res.status(400).json({ message: 'You have already purchased this internship' });
    }

    // Generate unique transaction ID
    const transactionId = generatePhonePeTransactionId();
    console.log('Generated transaction ID:', transactionId);

    // Create payment record in database
    const paymentRecord = new Payment({
      transactionId,
      userId,
      internshipId,
      amount: actualFinalPrice,
      originalAmount: internship.discountedPrice || internship.price,
      couponCode: coupon ? coupon.code : null,
      couponId: coupon ? coupon._id : null,
      status: 'PENDING',
      type: 'INTERNSHIP',
      productName: internship.title,
      productImage: internship.thumbnailUrl || '',
      customerName: user.fullName,
      customerEmail: user.email,
      customerPhone: user.phone
    });

    await paymentRecord.save();
    console.log('Payment record saved successfully');

    // Create PhonePe payment payload
    const customerInfo = {
      userId: user._id.toString(),
      phone: user.phone || '9999999999'
    };

    const redirectUrl = `${PHONEPE_CONFIG.REDIRECT_URL}?transactionId=${transactionId}&itemType=internship&itemId=${internshipId}`;
    const payload = createPaymentPayload(transactionId, actualFinalPrice, customerInfo, redirectUrl);

    // --- NEW AUTHENTICATION FLOW ---
    // 1. Get Authorization Token
    const authToken = await getAuthToken();
    console.log('🔑 Received Auth Token:', authToken ? 'SET' : 'NOT_SET');

    // Create PhonePe API request headers
    const headers = createHeaders(authToken);

    // --- ADDED LOGGING HERE ---
    console.log('--- PhonePe v2 API Request Details (Internship) ---');
    console.log('Timestamp:', new Date().toISOString());
    console.log('API URL:', `${PHONEPE_CONFIG.BASE_URL}/checkout/v2/pay`);
    console.log('Headers Sent:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': 'O-Bearer ' + authToken.substring(0, 20) + '...'
    });
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('--- End PhonePe v2 API Request Details (Internship) ---');
    // --- END ADDED LOGGING ---

    // Call PhonePe v2 API
    const phonepeResponse = await axios.post(
      `${PHONEPE_CONFIG.BASE_URL}/checkout/v2/pay`,
      payload,
      { headers }
    );

    console.log('✅ PhonePe pay API response:', JSON.stringify(phonepeResponse.data, null, 2));

    if (phonepeResponse.data.redirectUrl && phonepeResponse.data.orderId) {
      // Update payment record with PhonePe transaction ID
      paymentRecord.phonepeTransactionId = phonepeResponse.data.orderId;
      paymentRecord.phonepeResponse = phonepeResponse.data;
      await paymentRecord.save();

      res.json({
        success: true,
        paymentUrl: phonepeResponse.data.redirectUrl,
        transactionId: transactionId,
        phonepeTransactionId: phonepeResponse.data.orderId
      });
    } else {
      console.error('❌ PhonePe response missing redirectUrl/orderId:', phonepeResponse.data);
      throw new Error('PhonePe payment initiation failed');
    }

  } catch (error) {
    console.error('Payment creation error (Internship):', error);
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed',
      error: error.message
    });
  }
};

// PhonePe payment callback handler (Updated for v2 API per official docs)
// According to PhonePe docs, webhook format:
// {
//   "event": "checkout.order.completed" | "checkout.order.failed",
//   "payload": {
//     "orderId": "...",
//     "merchantOrderId": "...",
//     "state": "COMPLETED" | "FAILED",
//     "amount": 10000,
//     ...
//   }
// }
const paymentCallback = async (req, res) => {
  try {
    console.log('PhonePe v2 webhook received:', JSON.stringify(req.body, null, 2));

    // Extract event and payload according to PhonePe v2 webhook format
    const { event, payload } = req.body;

    if (!event || !payload) {
      console.log('Invalid webhook format - missing event or payload');
      return res.status(400).json({ success: false, message: 'Invalid webhook format' });
    }

    const { merchantOrderId, orderId, state, amount } = payload;

    if (!merchantOrderId) {
      console.log('Missing merchantOrderId in webhook payload');
      return res.status(400).json({ success: false, message: 'Missing merchantOrderId' });
    }

    // Find payment record by merchantOrderId (our transactionId)
    const payment = await Payment.findOne({ transactionId: merchantOrderId });

    if (!payment) {
      console.log('Payment record not found for transaction:', merchantOrderId);
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // --- IDEMPOTENCY GUARD ---
    // Reject callbacks for payments that have already been finalized.
    // This prevents replay attacks where an attacker fabricates a COMPLETED webhook
    // for a payment that was already processed (or never actually paid).
    if (payment.status === 'COMPLETED' || payment.status === 'FAILED') {
      console.log(`[SECURITY] Duplicate callback rejected for transaction ${merchantOrderId}. Current status: ${payment.status}`);
      return res.json({ success: true, message: `Payment already finalized with status: ${payment.status}` });
    }
    // --- END IDEMPOTENCY GUARD ---

    // Verify amount (convert from paise to rupees)
    const expectedAmount = payment.amount * 100;
    if (amount && amount !== expectedAmount) {
      console.log('Amount mismatch:', amount, 'expected:', expectedAmount);
      return res.status(400).json({ success: false, message: 'Amount mismatch' });
    }

    // Use payload.state to determine payment status (per PhonePe docs)
    // State values: COMPLETED, FAILED, PENDING
    if (state === 'COMPLETED' || event === 'checkout.order.completed') {
      // Update payment status in database
      payment.status = 'COMPLETED';
      payment.completedDate = new Date();
      payment.paymentMethod = 'PHONEPE';
      payment.paymentDetails = payload;
      if (orderId) {
        payment.phonepeTransactionId = orderId; // Store PhonePe's orderId
      }
      await payment.save();

      // Enroll user in course/internship
      await enrollUserInItem(payment);

      console.log('Payment completed successfully for transaction:', merchantOrderId);
      res.json({ success: true, message: 'Payment successful' });
    } else if (state === 'FAILED' || event === 'checkout.order.failed') {
      // Update payment status to failed
      payment.status = 'FAILED';
      payment.failureReason = payload.errorCode || payload.message || 'Payment failed';
      payment.paymentDetails = payload;
      if (orderId) {
        payment.phonepeTransactionId = orderId;
      }
      await payment.save();

      console.log('Payment failed for transaction:', merchantOrderId);
      res.json({ success: false, message: 'Payment failed' });
    } else {
      // PENDING or unknown state - log but don't update
      console.log('Payment in pending/unknown state:', state, 'for transaction:', merchantOrderId);
      res.json({ success: true, message: 'Webhook received, status: ' + state });
    }

  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ success: false, message: 'Callback processing failed' });
  }
};

// Helper function to enroll user in course/internship
const enrollUserInItem = async (payment) => {
  try {
    // When called from getPaymentStatus, payment fields may be populated objects
    // (e.g. payment.userId is a full User object, payment.courseId is a full Course object).
    // We must extract the raw _id in either case.
    const userId      = payment.userId?._id      || payment.userId;
    const courseId    = payment.courseId?._id     || payment.courseId;
    const internshipId= payment.internshipId?._id || payment.internshipId;
    const couponId    = payment.couponId?._id     || payment.couponId;

    const user = await User.findById(userId);

    if (!user) {
      console.error('❌ enrollUserInItem: User not found for id:', userId);
      return;
    }

    if (payment.type === 'CART') {
        if (payment.cartItems && payment.cartItems.length > 0) {
            for (const item of payment.cartItems) {
                if (item.itemType === 'Course') {
                    const alreadyEnrolled = user.enrolledCourses.some(
                        id => id.toString() === item.itemId.toString()
                    );
                    if (!alreadyEnrolled) {
                        user.enrolledCourses.push(item.itemId);
                        console.log('✅ User enrolled in course from cart:', item.itemId);
                    }
                } else if (item.itemType === 'Internship') {
                    const alreadyEnrolled = user.enrolledInternships.some(
                        id => id.toString() === item.itemId.toString()
                    );
                    if (!alreadyEnrolled) {
                        user.enrolledInternships.push(item.itemId);
                        console.log('✅ User enrolled in internship from cart:', item.itemId);

                        try {
                            await Notification.create({
                                recipient: userId,
                                type: 'offer_letter',
                                title: 'Offer Letter Generated',
                                message: `Your offer letter is ready for download.`,
                                link: `/user/offerletter`,
                                isRead: false
                            });
                        } catch (notifError) {
                            console.error('Error creating notification for offer letter:', notifError);
                        }
                    }
                }
                
                // Mark coupon as used if applicable
                if (item.couponId) {
                    const coupon = await Coupon.findById(item.couponId);
                    if (coupon) {
                        coupon.usedBy.push({ user: userId });
                        coupon.usedCount += 1;
                        await coupon.save();
                        console.log('✅ Coupon marked as used from cart:', item.couponCode);
                    }
                }
            }
        }
        // Clear user's cart
        user.cart = [];
        await user.save();
        console.log('✅ User cart cleared after successful payment');

    } else if (payment.type === 'COURSE' && courseId) {
      // Array.includes() doesn't work for ObjectIds — use .some() with .toString()
      const alreadyEnrolled = user.enrolledCourses.some(
        id => id.toString() === courseId.toString()
      );
      if (!alreadyEnrolled) {
        user.enrolledCourses.push(courseId);
        await user.save();
        console.log('✅ User enrolled in course:', courseId);
      } else {
        console.log('ℹ️ User already enrolled in course:', courseId);
      }
    } else if (payment.type === 'INTERNSHIP' && internshipId) {
      const alreadyEnrolled = user.enrolledInternships.some(
        id => id.toString() === internshipId.toString()
      );
      if (!alreadyEnrolled) {
        user.enrolledInternships.push(internshipId);
        await user.save();
        console.log('✅ User enrolled in internship:', internshipId);

        // --- Create Notification for Offer Letter ---
        try {
            const notification = await Notification.create({
                recipient: userId,
                type: 'offer_letter',
                title: 'Offer Letter Generated',
                message: `Your offer letter is ready for download.`,
                link: `/user/offerletter`,
                isRead: false
            });

            // Need to require app dynamically if it's not passed, but paymentController might not have req.
            // Wait, this is called from webhook callback which has req, but `enrollUserInItem` might not receive req.
            // Wait, this function is `const enrollUserInItem = async (payment) => { ... }`
            // Let's use global or we can skip sockets here or figure out how to access io.
            // We can emit to user if we have a global way to access userSockets, but they are stored on `app`.
            // The `req` is not available in `enrollUserInItem` directly.
            // We will just create the DB notification. When user logs in or polls, they get it.
        } catch (notifError) {
            console.error('Error creating notification for offer letter:', notifError);
        }

      } else {
        console.log('ℹ️ User already enrolled in internship:', internshipId);
      }
    }

    // Mark coupon as used if applicable
    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (coupon) {
        coupon.usedBy.push({ user: userId });
        coupon.usedCount += 1;
        await coupon.save();
        console.log('✅ Coupon marked as used:', payment.couponCode);
      }
    }

    // --- Generate and Send Invoice Email ---
    if (!payment.invoiceSent) {
      try {
        console.log('Generating invoice for payment:', payment.transactionId);
        const invoiceBuffer = await generateInvoicePDF(payment);
        console.log('Sending invoice email...');
        const emailResult = await sendInvoiceEmail(payment, invoiceBuffer);
        
        if (emailResult.success) {
          console.log('✅ Invoice email sent successfully');
          payment.invoiceSent = true;
          await payment.save();
        } else {
          console.error('⚠️ Invoice email failed:', emailResult.message);
        }
      } catch (invoiceError) {
        console.error('❌ Error generating or sending invoice:', invoiceError);
      }
    }
  } catch (error) {
    console.error('❌ Error in enrollUserInItem:', error);
    throw error; // Re-throw to handle in calling function
  }
};


// Get payment status (Updated for v2 API)
const getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find payment record
    const payment = await Payment.findOne({ transactionId })
      .populate('userId', 'fullName email')
      .populate('courseId', 'title thumbnail')
      .populate('internshipId', 'title thumbnail');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // If payment is still pending, check with PhonePe v2 API
    // Use merchantOrderId (our transactionId) instead of PhonePe's orderId
    if (payment.status === 'PENDING') {
      try {
        const statusResponse = await checkPhonePeStatus(payment.transactionId);

        // Log full response so we can see the exact shape from PhonePe
        console.log('🔍 PhonePe statusResponse for merchantOrderId', payment.transactionId, ':', 
          JSON.stringify(statusResponse, null, 2)
        );

        // According to PhonePe docs, status API response format:
        // {
        //   "orderId": "...",
        //   "state": "PENDING" | "COMPLETED" | "FAILED",
        //   "amount": 10000,
        //   "paymentDetails": [...]
        // }
        // Use root-level "state" parameter (per PhonePe docs recommendation)
        if (statusResponse && statusResponse.state) {
          const state = statusResponse.state;

          if (state === 'COMPLETED') {
            payment.status = 'COMPLETED';
            payment.completedDate = new Date();
            payment.paymentMethod = 'PHONEPE';
            payment.paymentDetails = statusResponse;
            if (statusResponse.orderId) {
              payment.phonepeTransactionId = statusResponse.orderId;
            }
            await payment.save();

            // Enroll user if payment is successful
            await enrollUserInItem(payment);
          } else if (state === 'FAILED') {
            payment.status = 'FAILED';
            payment.failureReason = statusResponse.errorCode || statusResponse.message || 'Payment failed';
            payment.paymentDetails = statusResponse;
            if (statusResponse.orderId) {
              payment.phonepeTransactionId = statusResponse.orderId;
            }
            await payment.save();
          }
          // If state is PENDING, leave payment status as PENDING
        } else {
          console.warn('⚠️ Unexpected PhonePe statusResponse format:', statusResponse);
        }
      } catch (error) {
        console.error('Error checking PhonePe status:', error);
      }
    }

    res.json({ success: true, payment });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ success: false, message: 'Failed to get payment status' });
  }
};

// Check payment status with PhonePe v2 API (Updated per official docs)
// According to PhonePe docs: GET /checkout/v2/order/{merchantOrderId}/status
// Production: https://api.phonepe.com/apis/pg/checkout/v2/order/{merchantOrderId}/status
const checkPhonePeStatus = async (merchantOrderId) => {
  try {
    // Get authorization token
    const authToken = await getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${authToken}`
    };

    // PhonePe v2 status endpoint per official docs:
    // GET /checkout/v2/order/{merchantOrderId}/status
    const statusUrl = `${PHONEPE_CONFIG.BASE_URL}/checkout/v2/order/${merchantOrderId}/status`;
    
    console.log('📞 Checking PhonePe status at:', statusUrl);
    
    const response = await axios.get(statusUrl, { headers });

    return response.data;
  } catch (error) {
    console.error('PhonePe v2 status check error:', error.response?.data || error.message);
    // Log the full error response for debugging
    if (error.response) {
      console.error('PhonePe status API error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    throw error;
  }
};

// Check if user has purchased a specific item
const checkUserPurchase = async (req, res) => {
  try {
    const { userId, itemType, itemId } = req.params;

    console.log('CheckUserPurchase called with:', { userId, itemType, itemId });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let isEnrolled = false;
    if (itemType === 'course') {
      isEnrolled = user.enrolledCourses.some(id => id.toString() === itemId);
    } else if (itemType === 'internship') {
      isEnrolled = user.enrolledInternships.some(id => id.toString() === itemId);
    }

    if (isEnrolled) {
      return res.json({ 
        success: true, 
        hasPurchased: true,
        payment: null
      });
    }

    let query = { userId };
    
    if (itemType === 'course') {
      query.courseId = itemId;
    } else if (itemType === 'internship') {
      query.internshipId = itemId;
    }

    console.log('Query:', query);

    // Find completed payment for this user and item
    const payment = await Payment.findOne({
      ...query,
      status: 'COMPLETED'
    });

    console.log('Payment found:', payment ? 'Yes' : 'No');

    res.json({ 
      success: true, 
      hasPurchased: !!payment,
      payment: payment || null
    });

  } catch (error) {
    console.error('Check user purchase error:', error);
    res.status(500).json({ success: false, message: 'Failed to check purchase status' });
  }
};

// Get all payments for admin
const getAllPayments = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('userId', 'fullName email')
      .populate('courseId', 'title thumbnail')
      .populate('internshipId', 'title thumbnail')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to get payments' });
  }
};

module.exports = {
  createCartPayment,
  createCoursePayment,
  createInternshipPayment,
  paymentCallback,
  getPaymentStatus,
  checkUserPurchase,
  getAllPayments
};