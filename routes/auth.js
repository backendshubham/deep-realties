const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  verifyRegistrationOTP, 
  resendOTP, 
  forgotPassword, 
  verifyResetOTP, 
  resetPassword,
  sendEmailVerificationOTP,
  verifyEmailOTP 
} = require('../controllers/authController');
const { 
  validateRegister, 
  validateLogin, 
  validateOTP, 
  validateResendOTP, 
  validateForgotPassword, 
  validateResetPassword 
} = require('../utils/validators');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticateToken, getMe);

// OTP Verification
router.post('/verify-registration-otp', validateOTP, verifyRegistrationOTP);
router.post('/resend-otp', validateResendOTP, resendOTP);
router.post('/send-verification-otp', validateResendOTP, sendEmailVerificationOTP);
router.post('/verify-email-otp', validateOTP, verifyEmailOTP);

// Forgot Password
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/verify-reset-otp', validateOTP, verifyResetOTP);
router.post('/reset-password', validateResetPassword, resetPassword);

module.exports = router;

