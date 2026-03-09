const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmailOtp, resendEmailOtp, sendVerificationOtp, forgotPassword, validateResetToken, resetPassword } = require('../controllers/authController');
const { validateRegister, validateLogin, validateVerifyEmail, validateResendEmailOtp } = require('../utils/validators');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticateToken, getMe);
router.post('/verify-email', validateVerifyEmail, verifyEmailOtp);
router.post('/resend-email-otp', validateResendEmailOtp, resendEmailOtp);
router.post('/send-verification-otp', validateResendEmailOtp, sendVerificationOtp);
router.post('/forgot-password', validateResendEmailOtp, forgotPassword);
router.get('/validate-reset-token', validateResetToken);
router.post('/reset-password', resetPassword);

module.exports = router;

