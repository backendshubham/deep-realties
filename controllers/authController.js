const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateToken } = require('../utils/helpers');
const { sendMail } = require('../utils/emailService');
const { otpEmailTemplate } = require('../utils/emailTemplates');
const { generate6DigitOtp, hashOtp } = require('../utils/otp');

const register = async (req, res, next) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    // Check if user exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const [user] = await db('users')
      .insert({
        email,
        password_hash,
        full_name,
        phone,
        role: role || 'buyer',
        email_verified: false
      })
      .returning(['id', 'email', 'full_name', 'role', 'created_at', 'email_verified']);

    // Generate + store OTP (hashed) and send email
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

    try {
      await sendMail({
        to: user.email,
        subject: 'Verify your email - DeepRealties OTP',
        text: `Your DeepRealties OTP is ${otp}. It expires in ${expiresMinutes} minutes.`,
        html: otpEmailTemplate({ otp, expiresMinutes })
      });
    } catch (mailErr) {
      // User is created, but email failed. Allow client to resend OTP.
      console.error('Email send failed:', mailErr.message);
    }

    // Do NOT issue auth token until email is verified.
    res.status(201).json({
      message: 'Account created. Please verify your email with the OTP sent to your inbox.',
      requiresEmailVerification: true,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, email_verified: false }
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

    const user = await db('users').where({ email }).first();
    if (!user) return res.status(404).json({ error: 'User not found' });
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

module.exports = {
  register,
  login,
  getMe,
  verifyEmailOtp,
  resendEmailOtp
};

