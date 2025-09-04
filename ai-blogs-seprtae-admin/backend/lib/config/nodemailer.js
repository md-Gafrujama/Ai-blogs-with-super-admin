import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Function to send email to multiple recipients
export const sendMultiple = async (mailOptions) => {
  try {
    // Convert recipients array to comma-separated string if it's an array
    const to = Array.isArray(mailOptions.to) ? mailOptions.to.join(', ') : mailOptions.to;
    
    console.log('📧 Attempting to send email...');
    console.log('📧 Recipients:', to);
    console.log('📧 From:', process.env.FROM_EMAIL || mailOptions.from);
    console.log('📧 Subject:', mailOptions.subject);
    console.log('📧 SMTP User configured:', !!process.env.SMTP_USER);
    console.log('📧 SMTP Pass configured:', !!process.env.SMTP_PASS);
    
    const emailOptions = {
      from: process.env.FROM_EMAIL || mailOptions.from,
      to: to,
      subject: mailOptions.subject,
      html: mailOptions.html
    };

    const info = await transporter.sendMail(emailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Response:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('❌ Full error:', error);
    throw error;
  }
};

// Function to send single email
export const send = async (mailOptions) => {
  try {
    const emailOptions = {
      from: process.env.FROM_EMAIL || mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html
    };

    const info = await transporter.sendMail(emailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default { sendMultiple, send };
