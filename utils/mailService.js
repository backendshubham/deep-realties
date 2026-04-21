const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'DeepRealties'}" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendOTPEmail = async (email, full_name, otp, type) => {
  let subject = '';
  let title = '';
  let message = '';
  let actionText = '';

  if (type === 'registration') {
    subject = 'Verify your DeepRealties Account';
    title = 'Welcome to DeepRealties!';
    message = 'Thank you for registering. Please use the following OTP to verify your account:';
    actionText = 'This OTP is valid for 10 minutes.';
  } else if (type === 'forgot_password') {
    subject = 'Password Reset Request - DeepRealties';
    title = 'Reset Your Password';
    message = 'We received a request to reset your password. Use the OTP below to proceed:';
    actionText = 'If you did not request this, please ignore this email.';
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .content {
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 5px;
          text-align: center;
        }
        .otp {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #1a73e8;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #777;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${title}</h2>
        </div>
        <div class="content">
          <p>Hello ${full_name},</p>
          <p>${message}</p>
          <div class="otp">${otp}</div>
          <p>${actionText}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} DeepRealties. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
};

module.exports = {
  sendOTPEmail,
  sendEmail
};
