const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmailOtp, resendEmailOtp } = require('../controllers/authController');
const { validateRegister, validateLogin, validateVerifyEmail, validateResendEmailOtp } = require('../utils/validators');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticateToken, getMe);
router.post('/verify-email', validateVerifyEmail, verifyEmailOtp);
router.post('/resend-email-otp', validateResendEmailOtp, resendEmailOtp);

module.exports = router;

