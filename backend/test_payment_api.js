// backend/test_payment_api.js
// Test script to check payment API response

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Import models
const Payment = require('./models/paymentModel');

async function testPaymentAPI() {
    try {
        console.log('🧪 Testing Payment API Response...\n');
        
        // Test 1: Check database connection
        console.log('1️⃣ Testing Database Connection...');
        const dbState = mongoose.connection.readyState;
        const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        console.log('Database State:', dbStates[dbState]);
        
        if (dbState !== 1) {
            console.log('❌ Database not connected');
            return;
        }
        console.log('✅ Database connected successfully\n');
        
        // Test 2: Check payment data structure
        console.log('2️⃣ Testing Payment Data Structure...');
        const payments = await Payment.find({ type: 'COURSE' })
            .populate('userId', 'fullName email')
            .populate('courseId', 'title thumbnail')
            .limit(5);
        
        console.log(`Found ${payments.length} course payments`);
        
        if (payments.length > 0) {
            console.log('\n📋 Sample Payment Object:');
            const samplePayment = payments[0];
            console.log('Payment ID:', samplePayment._id);
            console.log('Type:', samplePayment.type);
            console.log('Status:', samplePayment.status);
            console.log('Amount:', samplePayment.amount);
            console.log('Customer Name:', samplePayment.customerName);
            console.log('Customer Email:', samplePayment.customerEmail);
            console.log('Order ID:', samplePayment.orderId);
            console.log('Transaction ID:', samplePayment.transactionId);
            console.log('Payment Date:', samplePayment.paymentDate);
            console.log('Created At:', samplePayment.createdAt);
            
            if (samplePayment.userId) {
                console.log('User Details:', {
                    id: samplePayment.userId._id,
                    name: samplePayment.userId.fullName,
                    email: samplePayment.userId.email
                });
            }
            
            if (samplePayment.courseId) {
                console.log('Course Details:', {
                    id: samplePayment.courseId._id,
                    title: samplePayment.courseId.title,
                    thumbnail: samplePayment.courseId.thumbnail
                });
            }
        }
        
        // Test 3: Check for any malformed data
        console.log('\n3️⃣ Checking for Malformed Data...');
        const allPayments = await Payment.find({ type: 'COURSE' });
        let malformedCount = 0;
        
        allPayments.forEach((payment, index) => {
            if (!payment._id || !payment.type || !payment.status) {
                malformedCount++;
                console.log(`⚠️  Malformed payment at index ${index}:`, {
                    hasId: !!payment._id,
                    hasType: !!payment.type,
                    hasStatus: !!payment.status,
                    payment: payment
                });
            }
        });
        
        if (malformedCount === 0) {
            console.log('✅ No malformed payment records found');
        } else {
            console.log(`⚠️  Found ${malformedCount} malformed payment records`);
        }
        
        console.log('\n🎉 Payment API test completed!');
        
    } catch (error) {
        console.error('❌ Error testing payment API:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the test
testPaymentAPI();
