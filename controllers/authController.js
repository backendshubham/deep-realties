const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateToken, generateOTP } = require('../utils/helpers');
const { sendOTPEmail } = require('../utils/mailService');

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

    // Check if email was pre-verified
    const preVerified = await db('otps')
      .where({ email, type: 'email_verification' })
      .where('expires_at', '>', new Date())
      .first();

    const is_verified = !!preVerified;

    // Create user
    const [user] = await db('users')
      .insert({
        email,
        password_hash,
        full_name,
        phone,
        role: role || 'buyer',
        is_verified
      })
      .returning(['id', 'email', 'full_name', 'role', 'created_at']);

    if (preVerified) {
      // Delete the used pre-verification OTP
      await db('otps').where({ id: preVerified.id }).delete();
    } else {
      // Standard flow: Generate and save OTP for later verification
      const otp = generateOTP();
      const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db('otps').insert({
        user_id: user.id,
        otp_code: otp,
        type: 'registration',
        expires_at
      });

      // Send email
      await sendOTPEmail(email, full_name, otp, 'registration');
    }

    const token = generateToken(user.id);

    res.status(201).json({
      message: is_verified ? 'Registration successful' : 'Registration successful. Please verify your email with the OTP sent.',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_verified
      },
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
    
    // Check verification status
    if (!user.is_verified) {
      return res.status(403).json({ 
        error: 'Email not verified', 
        needs_verification: true,
        email: user.email 
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
      .select('id', 'email', 'full_name', 'phone', 'role', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const verifyRegistrationOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.is_verified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    const validOtp = await db('otps')
      .where({
        user_id: user.id,
        otp_code: otp,
        type: 'registration'
      })
      .where('expires_at', '>', new Date())
      .first();

    if (!validOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Verify user and delete used OTP
    await db.transaction(async (trx) => {
      await trx('users').where({ id: user.id }).update({ is_verified: true });
      await trx('otps').where({ id: validOtp.id }).delete();
    });

    const token = generateToken(user.id);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.is_verified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    // Delete old registration OTPs
    await db('otps').where({ user_id: user.id, type: 'registration' }).delete();

    // Generate new OTP
    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await db('otps').insert({
      user_id: user.id,
      otp_code: otp,
      type: 'registration',
      expires_at
    });

    await sendOTPEmail(email, user.full_name, otp, 'registration');

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      // For security, don't reveal if user exists, but here we usually do for convenience in simple apps
      // or return success anyway. Recommending a helpful message.
      return res.status(404).json({ error: 'User with this email does not exist' });
    }

    // Delete old reset OTPs
    await db('otps').where({ user_id: user.id, type: 'forgot_password' }).delete();

    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await db('otps').insert({
      user_id: user.id,
      otp_code: otp,
      type: 'forgot_password',
      expires_at
    });

    await sendOTPEmail(email, user.full_name, otp, 'forgot_password');

    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

const verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validOtp = await db('otps')
      .where({
        user_id: user.id,
        otp_code: otp,
        type: 'forgot_password'
      })
      .where('expires_at', '>', new Date())
      .first();

    if (!validOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({ 
      message: 'OTP verified. You can now reset your password.',
      success: true 
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, new_password } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validOtp = await db('otps')
      .where({
        user_id: user.id,
        otp_code: otp,
        type: 'forgot_password'
      })
      .where('expires_at', '>', new Date())
      .first();

    if (!validOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);

    await db.transaction(async (trx) => {
      await trx('users').where({ id: user.id }).update({ password_hash });
      await trx('otps').where({ id: validOtp.id }).delete();
    });

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    next(error);
  }
};

const sendEmailVerificationOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Delete old verification OTPs for this email
    await db('otps').where({ email, type: 'email_verification' }).delete();

    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await db('otps').insert({
      email,
      otp_code: otp,
      type: 'email_verification',
      expires_at
    });

    await sendOTPEmail(email, 'User', otp, 'registration');

    res.json({ message: 'Verification OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

const verifyEmailOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const validOtp = await db('otps')
      .where({
        email,
        otp_code: otp,
        type: 'email_verification'
      })
      .where('expires_at', '>', new Date())
      .first();

    if (!validOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Don't delete yet, it will be checked during register (or we can just return success)
    res.json({ 
      message: 'Email verified successfully',
      success: true 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};

