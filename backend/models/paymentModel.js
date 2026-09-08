// backend/models/paymentModel.js

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship'
  },
  type: {
    type: String,
    enum: ['COURSE', 'INTERNSHIP', 'CART'],
    required: true
  },
  productName: {
    type: String
  },
  productImage: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  originalAmount: {
    type: Number
  },
  couponCode: {
    type: String
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  phonepeTransactionId: {
    type: String
  },
  phonepeResponse: {
    type: Object
  },
  paymentDetails: {
    type: Object
  },
  orderId: {
    type: String,
    unique: true
  },
  customerName: {
    type: String
  },
  customerEmail: {
    type: String
  },
  customerPhone: {
    type: String
  },
  paymentMethod: {
    type: String
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  failureReason: {
    type: String
  },
  refundStatus: {
    type: String,
    enum: ['NONE', 'PENDING', 'COMPLETED', 'FAILED'],
    default: 'NONE'
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundDate: {
    type: Date
  },
  invoiceSent: {
    type: Boolean,
    default: false
  },
  cartItems: [{
    itemType: { type: String, enum: ['Course', 'Internship'] },
    itemId: { type: mongoose.Schema.Types.ObjectId, refPath: 'cartItems.itemType' },
    price: Number,
    discountedPrice: Number,
    couponCode: String,
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    name: String
  }]
}, {
  timestamps: true
});

// Generate order ID before saving
paymentSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Index for better query performance
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ paymentDate: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
