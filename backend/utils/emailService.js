const nodemailer = require('nodemailer');

const getEmailConfig = () => {
  const port = parseInt(process.env.SMTP_PORT) || 465;
  return {
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER || 'info@gradezy.in',
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  };
};

const isEmailConfigured = () => {
  return !!(process.env.SMTP_PASS || process.env.EMAIL_PASSWORD);
};

let transporter = null;

const getTransporter = () => {
  if (!transporter && isEmailConfigured()) {
    transporter = nodemailer.createTransport(getEmailConfig());

    transporter.verify((error) => {
      if (error) {
        console.error('[Email Service] Transporter verify error:', error.message);
      } else {
        console.log('[Email Service] Transporter verified and ready to send emails');
      }
    });
  }
  return transporter;
};

// Initialize transporter on load if configured
getTransporter();

// Ensure display names with periods/special chars are correctly quoted per RFC 5322
const getFromAddress = () => {
  const envFrom = process.env.SMTP_FROM;
  if (!envFrom) {
    return '"InternKatta" <info@gradezy.in>';
  }
  const match = envFrom.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    let name = match[1].trim();
    const addr = match[2].trim();
    if ((name.startsWith('"') && name.endsWith('"')) || (name.startsWith("'") && name.endsWith("'"))) {
      name = name.slice(1, -1);
    }
    return `"${name}" <${addr}>`;
  }
  return envFrom;
};

const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    const currentTransporter = getTransporter();
    if (!currentTransporter) {
      console.error('[Email Service] Email service not configured. SMTP_PASS/EMAIL_PASSWORD missing.');
      return {
        success: false,
        message: 'Email service not configured'
      };
    }

    const mailOptions = {
      from: getFromAddress(),
      replyTo: process.env.SMTP_REPLY_TO || 'info@gradezy.in',
      to,
      subject,
      html,
      text,
      attachments
    };

    const info = await currentTransporter.sendMail(mailOptions);

    if (info && info.rejected && info.rejected.length > 0 && (!info.accepted || info.accepted.length === 0)) {
      console.error('[Email Service] Recipient rejected by SMTP server:', info.rejected);
      return {
        success: false,
        message: 'Email delivery was rejected by the server',
        error: `Rejected by mail server: ${info.rejected.join(', ')}`
      };
    }

    console.log(`[Email Service] Email sent successfully to ${to}, messageId: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      response: info.response
    };
  } catch (error) {
    console.error('[Email Service] Error sending email:', error.message);

    return {
      success: false,
      error: error.message,
      message: error.message
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
