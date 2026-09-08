const PDFDocument = require('pdfkit');

/**
 * Generates an invoice PDF in memory as a Buffer.
 * @param {Object} payment - The payment object from the database.
 * @returns {Promise<Buffer>} - A promise that resolves with the PDF buffer.
 */
const generateInvoicePDF = (payment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', (err) => {
        reject(err);
      });

      // ---- Header ----
      doc
        .fillColor('#444444')
        .fontSize(24)
        .text('INVOICE', 50, 50)
        .fontSize(10)
        .text('Fourise Software Solutions Pvt. Ltd.', 200, 50, { align: 'right' })
        .text('info@gradezy.in', 200, 65, { align: 'right' })
        .moveDown();

      // ---- Separator ----
      generateHr(doc, 90);

      // ---- Invoice details & Bill To ----
      const customerName = payment.customerName || payment.userId?.fullName || 'Customer';
      const customerEmail = payment.customerEmail || payment.userId?.email || 'N/A';
      const orderId = payment.orderId || payment.transactionId;
      const completedDate = payment.completedDate || payment.paymentDate || new Date();
      
      const formattedDate = new Intl.DateTimeFormat('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      }).format(new Date(completedDate));

      const customerTop = 110;

      doc
        .fontSize(10)
        .text('Invoice Number:', 50, customerTop)
        .font('Helvetica-Bold')
        .text(orderId, 150, customerTop)
        .font('Helvetica')
        .text('Invoice Date:', 50, customerTop + 15)
        .text(formattedDate, 150, customerTop + 15)
        .text('Payment Status:', 50, customerTop + 30)
        .font('Helvetica-Bold')
        .fillColor('#22c55e') // Green
        .text('PAID', 150, customerTop + 30)
        .fillColor('#444444') // Back to dark gray
        .font('Helvetica');

      doc
        .text('Billed To:', 300, customerTop)
        .font('Helvetica-Bold')
        .text(customerName, 300, customerTop + 15)
        .font('Helvetica')
        .text(customerEmail, 300, customerTop + 30);

      generateHr(doc, 170);

      // ---- Table Header ----
      const invoiceTableTop = 200;
      doc.font('Helvetica-Bold');
      generateTableRow(
        doc,
        invoiceTableTop,
        'Description',
        '',
        '',
        'Total'
      );
      generateHr(doc, invoiceTableTop + 20);
      doc.font('Helvetica');

      // ---- Table Row (Item) ----
      let rowTop = invoiceTableTop + 30;
      let amountPaid = 0;

      if (payment.type === 'CART' && payment.cartItems && payment.cartItems.length > 0) {
          payment.cartItems.forEach(item => {
              const itemPrice = parseFloat(item.discountedPrice || item.price).toFixed(2);
              generateTableRow(
                  doc,
                  rowTop,
                  item.name || item.itemType,
                  '',
                  '',
                  `Rs. ${itemPrice}`
              );
              generateHr(doc, rowTop + 20);
              rowTop += 30;
          });
          amountPaid = parseFloat(payment.amount).toFixed(2);
      } else {
          const productName = payment.productName || (payment.type === 'COURSE' ? 'Course Enrollment' : 'Internship Enrollment');
          amountPaid = parseFloat(payment.amount).toFixed(2);
          
          generateTableRow(
            doc,
            rowTop,
            productName,
            '',
            '',
            `Rs. ${amountPaid}`
          );
          generateHr(doc, rowTop + 20);
          rowTop += 30;
      }

      // ---- Totals ----
      const totalTop = rowTop + 10;
      doc.font('Helvetica-Bold');
      generateTableRow(
        doc,
        totalTop,
        '',
        '',
        'Total Paid',
        `Rs. ${amountPaid}`
      );
      doc.font('Helvetica');

      // ---- Footer ----
      doc
        .fontSize(10)
        .text(
          'Thank you for choosing InternKatta (Fourise Software Solutions Pvt. Ltd.).',
          50,
          700,
          { align: 'center', width: 500 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

function generateHr(doc, y) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function generateTableRow(doc, y, item, description, unitCost, lineTotal) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 280, y)
    .text(unitCost, 370, y, { width: 90, align: 'right' })
    .text(lineTotal, 0, y, { align: 'right' });
}

module.exports = {
  generateInvoicePDF
};
