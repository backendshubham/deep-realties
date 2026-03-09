const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/database');
const { generateToken, getBaseUrl } = require('../utils/helpers');
const { sendMail } = require('../utils/emailService');
const { otpEmailTemplate, passwordResetEmailTemplate } = require('../utils/emailTemplates');
const { generate6DigitOtp, hashOtp } = require('../utils/otp');

const register = async (req, res, next) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    // Check if user exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email was verified in temporary table (case-insensitive)
    const emailVerification = await db('email_verifications')
      .whereRaw('LOWER(email) = ?', [normalizedEmail])
      .where({ verified: true })
      .orderBy('created_at', 'desc')
      .first();
    
    if (!emailVerification) {
      return res.status(400).json({ error: 'Please verify your email before creating an account' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user with email already verified (use normalized email)
    const [user] = await db('users')
      .insert({
        email: normalizedEmail,
        password_hash,
        full_name,
        phone,
        role: role || 'buyer',
        email_verified: true
      })
      .returning(['id', 'email', 'full_name', 'role', 'created_at', 'email_verified']);

    // Clean up temporary verification record (case-insensitive)
    await db('email_verifications')
      .whereRaw('LOWER(email) = ?', [normalizedEmail])
      .del();

    // Generate token since email is already verified
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Account created successfully',
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, email_verified: true },
      token
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Please verify your email to continue',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'email', 'full_name', 'phone', 'role', 'created_at', 'email_verified')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Check if user exists
    const user = await db('users').where({ email }).first();
    
    if (user) {
      // User exists - use existing verification logic
      if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated' });
      if (user.email_verified) {
        const token = generateToken(user.id);
        return res.json({
          message: 'Email already verified',
          user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, email_verified: true },
          token
        });
      }

      if (!user.email_verification_otp_hash || !user.email_verification_otp_expires_at) {
        return res.status(400).json({ error: 'OTP not found. Please resend OTP.' });
      }

      if (new Date(user.email_verification_otp_expires_at).getTime() < Date.now()) {
        return res.status(400).json({ error: 'OTP expired. Please resend OTP.' });
      }

      const maxAttempts = parseInt(process.env.EMAIL_OTP_MAX_ATTEMPTS || '10', 10);
      if ((user.email_verification_attempts || 0) >= maxAttempts) {
        return res.status(429).json({ error: 'Too many attempts. Please resend OTP.' });
      }

      const providedHash = hashOtp(otp);
      const ok = providedHash === user.email_verification_otp_hash;

      if (!ok) {
        await db('users')
          .where({ id: user.id })
          .update({ email_verification_attempts: (user.email_verification_attempts || 0) + 1 });
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      await db('users')
        .where({ id: user.id })
        .update({
          email_verified: true,
          email_verification_otp_hash: null,
          email_verification_otp_expires_at: null,
          email_verification_otp_sent_at: null,
          email_verification_attempts: 0
        });

      const token = generateToken(user.id);
      return res.json({
        message: 'Email verified successfully',
        user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, email_verified: true },
        token
      });
    } else {
      // User doesn't exist - check temporary verification table (case-insensitive)
      const normalizedEmail = email.toLowerCase();
      const verification = await db('email_verifications')
        .whereRaw('LOWER(email) = ?', [normalizedEmail])
        .where({ verified: false })
        .orderBy('created_at', 'desc')
        .first();
      
      if (!verification) {
        return res.status(400).json({ error: 'OTP not found. Please send OTP first.' });
      }
      
      if (new Date(verification.expires_at).getTime() < Date.now()) {
        return res.status(400).json({ error: 'OTP expired. Please resend OTP.' });
      }
      
      const maxAttempts = parseInt(process.env.EMAIL_OTP_MAX_ATTEMPTS || '10', 10);
      if (verification.attempts >= maxAttempts) {
        return res.status(429).json({ error: 'Too many attempts. Please resend OTP.' });
      }
      
      const providedHash = hashOtp(otp);
      const ok = providedHash === verification.otp_hash;
      
      if (!ok) {
        await db('email_verifications')
          .where({ id: verification.id })
          .update({ attempts: verification.attempts + 1 });
        return res.status(400).json({ error: 'Invalid OTP' });
      }
      
      // Mark as verified
      await db('email_verifications')
        .where({ id: verification.id })
        .update({ verified: true });
      
      return res.json({
        message: 'Email verified successfully. You can now create your account.',
        verified: true
      });
    }
  } catch (error) {
    next(error);
  }
};

const sendVerificationOtp = async (req, res, next) => {
  try {
    let { email } = req.body;
    
    // Normalize email (lowercase, trim)
    if (email) {
      email = email.toLowerCase().trim();
    }
    
    // Validate email format - more comprehensive regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    
    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      if (existingUser.email_verified) {
        return res.status(400).json({ 
          error: 'This email is already registered',
          message: 'Email already verified. Please log in with your password.',
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }
      // User exists but not verified - use existing resend logic
      req.body.email = email; // Update req.body with normalized email
      return resendEmailOtp(req, res, next);
    }
    
    // User doesn't exist - check temporary verification table (case-insensitive)
    const existingVerification = await db('email_verifications')
      .whereRaw('LOWER(email) = ?', [email.toLowerCase()])
      .where({ verified: false })
      .orderBy('created_at', 'desc')
      .first();
    
    // Check cooldown
    const cooldownSeconds = parseInt(process.env.EMAIL_OTP_RESEND_COOLDOWN_SECONDS || '60', 10);
    if (existingVerification && existingVerification.sent_at) {
      const sentAt = new Date(existingVerification.sent_at).getTime();
      const diffSeconds = Math.floor((Date.now() - sentAt) / 1000);
      if (diffSeconds < cooldownSeconds) {
        return res.status(429).json({ error: `Please wait ${cooldownSeconds - diffSeconds} seconds before resending OTP.` });
      }
    }
    
    // Generate OTP
    const otp = generate6DigitOtp();
    const otpHash = hashOtp(otp);
    const expiresMinutes = parseInt(process.env.EMAIL_OTP_EXPIRES_MINUTES || '10', 10);
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
    
    // Store in temporary verification table (always use lowercase email)
    const normalizedEmail = email.toLowerCase();
    if (existingVerification) {
      await db('email_verifications')
        .where({ id: existingVerification.id })
        .update({
          email: normalizedEmail, // Ensure lowercase
          otp_hash: otpHash,
          expires_at: expiresAt,
          sent_at: new Date(),
          attempts: 0
        });
    } else {
      await db('email_verifications').insert({
        email: normalizedEmail, // Store lowercase
        otp_hash: otpHash,
        expires_at: expiresAt,
        sent_at: new Date(),
        attempts: 0,
        verified: false
      });
    }
    
    // Send email
    await sendMail({
      to: email,
      subject: 'Verify your email - DeepRealties OTP',
      text: `Your DeepRealties OTP is ${otp}. It expires in ${expiresMinutes} minutes.`,
      html: otpEmailTemplate({ otp, expiresMinutes })
    });
    
    return res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
};

const resendEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await db('users').where({ email }).first();
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated' });
    if (user.email_verified) return res.json({ message: 'Email already verified' });

    // Basic resend cooldown
    const cooldownSeconds = parseInt(process.env.EMAIL_OTP_RESEND_COOLDOWN_SECONDS || '60', 10);
    if (user.email_verification_otp_sent_at) {
      const sentAt = new Date(user.email_verification_otp_sent_at).getTime();
      const diffSeconds = Math.floor((Date.now() - sentAt) / 1000);
      if (diffSeconds < cooldownSeconds) {
        return res.status(429).json({ error: `Please wait ${cooldownSeconds - diffSeconds} seconds before resending OTP.` });
      }
    }

    const otp = generate6DigitOtp();
    const otpHash = hashOtp(otp);
    const expiresMinutes = parseInt(process.env.EMAIL_OTP_EXPIRES_MINUTES || '10', 10);
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    await db('users')
      .where({ id: user.id })
      .update({
        email_verification_otp_hash: otpHash,
        email_verification_otp_expires_at: expiresAt,
        email_verification_otp_sent_at: new Date(),
        email_verification_attempts: 0
      });

    await sendMail({
      to: user.email,
      subject: 'Your DeepRealties OTP (Resent)',
      text: `Your DeepRealties OTP is ${otp}. It expires in ${expiresMinutes} minutes.`,
      html: otpEmailTemplate({ otp, expiresMinutes })
    });

    return res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    let { email } = req.body;
    
    // Normalize email
    if (email) {
      email = email.toLowerCase().trim();
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    
    // Find user
    const user = await db('users').where({ email }).first();
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If the email exists, a password reset link has been sent.' });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    if (!user.email_verified) {
      return res.status(400).json({ error: 'Please verify your email first' });
    }
    
    // Check cooldown (prevent spam)
    const cooldownSeconds = parseInt(process.env.PASSWORD_RESET_COOLDOWN_SECONDS || '60', 10);
    if (user.password_reset_token_sent_at) {
      const sentAt = new Date(user.password_reset_token_sent_at).getTime();
      const diffSeconds = Math.floor((Date.now() - sentAt) / 1000);
      if (diffSeconds < cooldownSeconds) {
        return res.status(429).json({ error: `Please wait ${cooldownSeconds - diffSeconds} seconds before requesting another reset link.` });
      }
    }
    
    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresMinutes = parseInt(process.env.PASSWORD_RESET_EXPIRES_MINUTES || '60', 10);
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
    
    // Store token
    await db('users')
      .where({ id: user.id })
      .update({
        password_reset_token: resetToken,
        password_reset_token_expires_at: expiresAt,
        password_reset_token_sent_at: new Date()
      });
    
    // Generate reset URL (only token, no email for security)
    const baseUrl = getBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    // Send email
    await sendMail({
      to: user.email,
      subject: 'Reset your password - DeepRealties',
      text: `Click this link to reset your password: ${resetUrl}\n\nThis link will expire in ${expiresMinutes} minutes.`,
      html: passwordResetEmailTemplate({ resetUrl, expiresMinutes })
    });
    
    return res.json({ message: 'If the email exists, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

// Validate reset token and return email (for frontend)
const validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    // Find user by token
    const user = await db('users')
      .where({ password_reset_token: token })
      .whereNotNull('password_reset_token')
      .first();
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }
    
    // Check if token expired
    if (!user.password_reset_token_expires_at || new Date(user.password_reset_token_expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    // Return masked email for display (security: don't reveal full email)
    const emailParts = user.email.split('@');
    const maskedEmail = emailParts[0].substring(0, 2) + '***@' + emailParts[1];
    
    return res.json({ 
      valid: true,
      email: user.email, // Return full email for internal use
      maskedEmail: maskedEmail // Masked version for display
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    // Validate inputs
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Find user by token (email is retrieved from token)
    const user = await db('users')
      .where({ password_reset_token: token })
      .whereNotNull('password_reset_token')
      .first();
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    // Check if token expired
    if (!user.password_reset_token_expires_at || new Date(user.password_reset_token_expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }
    
    // Hash new password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Update password and clear reset fields
    await db('users')
      .where({ id: user.id })
      .update({
        password_hash,
        password_reset_token: null,
        password_reset_token_expires_at: null,
        password_reset_token_sent_at: null
      });
    
    return res.json({ 
      message: 'Password reset successfully. You can now login with your new password.',
      email: user.email // Return email for redirect to login
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmailOtp,
  resendEmailOtp,
  sendVerificationOtp,
  forgotPassword,
  validateResetToken,
  resetPassword
};

