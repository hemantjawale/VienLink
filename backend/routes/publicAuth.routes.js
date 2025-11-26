import express from 'express';
import { body, validationResult } from 'express-validator';
import PublicUser from '../models/PublicUser.model.js';
import { generateToken } from '../utils/generateToken.js';
import { protectPublic } from '../middleware/publicAuth.middleware.js';

const router = express.Router();

// Public user signup
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('hasUnderlyingDisease').isBoolean(),
    body('onMedication').isBoolean(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email } = req.body;

      const existing = await PublicUser.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const user = await PublicUser.create(req.body);

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Public user forgot password - generate verification code
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const user = await PublicUser.findOne({ email });

    if (!user) {
      return res.json({ success: true, message: 'If this email exists, a verification code has been generated.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Return the code directly instead of sending email
    res.json({
      success: true,
      message: 'Verification code generated.',
      verificationCode: code, // Return code directly for development/testing
    });
  } catch (error) {
    next(error);
  }
});

// Public user reset password with code
router.post(
  '/reset-password',
  [body('email').isEmail().normalizeEmail(), body('code').notEmpty(), body('newPassword').isLength({ min: 6 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, code, newPassword } = req.body;
      const user = await PublicUser.findOne({ email });
      if (!user || !user.resetCode || !user.resetCodeExpires) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
      }

      if (user.resetCode !== code || user.resetCodeExpires < new Date()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
      }

      user.password = newPassword;
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      await user.save();

      res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
    } catch (error) {
      next(error);
    }
  }
);

// Public user login
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await PublicUser.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(401).json({ success: false, message: 'Account is inactive' });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current public user
router.get('/me', protectPublic, async (req, res, next) => {
  try {
    res.json({ success: true, user: req.publicUser });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', protectPublic, async (req, res, next) => {
  try {
    const updatable = ['firstName', 'lastName', 'phone', 'city', 'pinCode', 'hasUnderlyingDisease', 'diseaseDetails', 'onMedication', 'medicationDetails', 'bloodGroup'];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.publicUser[field] = req.body[field];
      }
    });

    await req.publicUser.save();
    res.json({ success: true, user: req.publicUser });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put(
  '/change-password',
  protectPublic,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await PublicUser.findById(req.publicUser._id);
      if (!user || !(await user.comparePassword(currentPassword))) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Public user logout
router.post('/logout', protectPublic, async (req, res, next) => {
  try {
    // In a real implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Update user's last logout time
    // 3. Clear any server-side session data
    
    // For now, just return success - client handles token removal
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
