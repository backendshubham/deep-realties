const crypto = require('crypto');

function generate6DigitOtp() {
  // 000000 to 999999, padded to 6 digits
  const num = crypto.randomInt(0, 1000000);
  return String(num).padStart(6, '0');
}

function hashOtp(otp) {
  const secret = process.env.OTP_HASH_SECRET || process.env.JWT_SECRET || 'otp-secret';
  return crypto.createHmac('sha256', secret).update(String(otp)).digest('hex');
}

module.exports = {
  generate6DigitOtp,
  hashOtp
};


