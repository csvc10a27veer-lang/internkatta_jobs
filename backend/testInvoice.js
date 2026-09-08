const mongoose = require('mongoose');
const { generateInvoicePDF } = require('./utils/invoiceGenerator');
const { sendInvoiceEmail } = require('./utils/emailService');
const fs = require('fs');

async function testInvoice() {
  const mockPayment = {
    _id: new mongoose.Types.ObjectId(),
    transactionId: 'TXN123456789',
    orderId: 'ORD_123456789_ABC',
    customerName: 'John Doe',
    customerEmail: 'test@example.com',
    productName: 'Full Stack Web Development Course',
    type: 'COURSE',
    amount: 1999,
    completedDate: new Date(),
    invoiceSent: false,
    save: async function() { this.invoiceSent = true; }
  };

  try {
    console.log('Generating PDF buffer...');
    const buffer = await generateInvoicePDF(mockPayment);
    console.log('PDF Buffer generated. Size:', buffer.length);
    
    // Save to disk for manual inspection (optional)
    fs.writeFileSync('test_invoice.pdf', buffer);
    console.log('Saved to test_invoice.pdf');

  } catch (err) {
    console.error('Error:', err);
  }
}

testInvoice();
