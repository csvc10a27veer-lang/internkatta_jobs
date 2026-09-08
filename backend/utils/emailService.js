const nodemailer = require('nodemailer');

const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER || 'info@gradezy.in',
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
};

const isEmailConfigured = () => {
  return !!process.env.EMAIL_PASSWORD;
};

let transporter = null;

if (isEmailConfigured()) {
  transporter = nodemailer.createTransport(emailConfig);

  transporter.verify((error) => {
    if (error) {
      console.log('Email service error:', error.message);
    } else {
      console.log('Email service is ready to send messages');
    }
  });
} else {
  console.log('Email service disabled - EMAIL_PASSWORD not set');
}

const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    if (!transporter) {
      return {
        success: false,
        message: 'Email service not configured'
      };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Fourise Software Solutions Pvt.Ltd" <info@gradezy.in>',
      replyTo: process.env.SMTP_REPLY_TO || 'info@gradezy.in',
      to,
      subject,
      html,
      text,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);

    return {
      success: false,
      error: error.message
    };
  }
};

const sendInvoiceEmail = async (payment, pdfBuffer) => {
  const customerName = payment.customerName || payment.userId?.fullName || 'Customer';
  const customerEmail = payment.customerEmail || payment.userId?.email;
  const productName = payment.productName || 'your purchase';

  if (!customerEmail) {
    console.error('Cannot send invoice email: No customer email found.');
    return { success: false, message: 'No email found' };
  }

  const subject = `Your Invoice from Fourise Software Solutions Pvt. Ltd.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #0a66c2;">Thank you for your purchase!</h2>
      <p>Dear ${customerName},</p>
      <p>We have successfully received your payment for <strong>${productName}</strong>.</p>
      <p>Please find your invoice attached to this email.</p>
      <p>If you have any questions or concerns, feel free to reply to this email.</p>
      <br />
      <p>Best regards,<br/>The InternKatta Team<br/>Fourise Software Solutions Pvt. Ltd.</p>
    </div>
  `;

  const attachments = [
    {
      filename: `Invoice_${payment.orderId || payment.transactionId}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }
  ];

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    attachments
  });
};

module.exports = {
  sendEmail,
  sendInvoiceEmail,
  transporter,
  isEmailConfigured
};
