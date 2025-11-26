import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import Hospital from '../models/Hospital.model.js';
import { generateToken } from '../utils/generateToken.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { logAction } from '../utils/auditLogger.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (for hospital admin) / Private (for super admin to create hospital admins)
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('role').isIn(['super_admin', 'hospital_admin', 'staff']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, password, firstName, lastName, role, hospitalId, staffType, phone } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists',
        });
      }

      // Validate hospital for non-super-admin roles
      if (role !== 'super_admin') {
        if (!hospitalId) {
          return res.status(400).json({
            success: false,
            message: 'Hospital ID is required',
          });
        }

        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
          return res.status(404).json({
            success: false,
            message: 'Hospital not found',
          });
        }

        // For hospital_admin, check if hospital is approved
        if (role === 'hospital_admin' && !hospital.isApproved) {
          return res.status(400).json({
            success: false,
            message: 'Hospital must be approved before creating admin',
          });
        }
      }

      // Validate staffType for staff role
      if (role === 'staff' && !staffType) {
        return res.status(400).json({
          success: false,
          message: 'Staff type is required for staff role',
        });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role,
        hospitalId: role !== 'super_admin' ? hospitalId : undefined,
        staffType: role === 'staff' ? staffType : undefined,
        phone,
      });

      const token = generateToken(user._id);

      // Log action
      if (req.user) {
        await logAction('USER_CREATED', 'User', user._id, req.user._id, user.hospitalId, { role }, req);
      }

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          hospitalId: user.hospitalId,
          staffType: user.staffType,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Generate verification code for password reset (without email)
// @access  Public
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    // For security, respond success even if user not found
    if (!user) {
      return res.json({ success: true, message: 'If this email exists, a verification code has been generated.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Return the code directly for testing (in production, you might want to use a different method)
    res.json({
      success: true,
      message: 'Verification code generated.',
      verificationCode: code, // Only for development/testing
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/reset-password
// @desc    Verify code and reset password (hospital/staff)
// @access  Public
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
      const user = await User.findOne({ email });
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

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user and populate hospital info
      const user = await User.findOne({ email }).populate('hospitalId', 'name isApproved');

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive',
        });
      }

      // Check if hospital is approved (for non-super-admin)
      if (user.role !== 'super_admin' && user.hospitalId && !user.hospitalId.isApproved) {
        return res.status(403).json({
          success: false,
          message: 'Hospital is not approved yet',
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);

      // Log action
      await logAction('USER_LOGIN', 'User', user._id, user._id, user.hospitalId, {}, req);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          hospitalId: user.hospitalId?._id,
          hospitalName: user.hospitalId?.name,
          staffType: user.staffType,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('hospitalId', 'name email phone address location');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  protect,
  [
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { firstName, lastName, email, phone, hospitalName } = req.body;
      const userId = req.user._id;

      // Check if email is being changed and if it's already in use
      if (email !== req.user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email is already in use',
          });
        }
      }

      // Update user profile
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          firstName,
          lastName,
          email,
          phone,
          ...(hospitalName && { hospitalName }),
        },
        { new: true, runValidators: true }
      ).populate('hospitalId', 'name email phone address location');

      // Log action
      await logAction('PROFILE_UPDATED', 'User', userId, userId, updatedUser.hospitalId, { firstName, lastName, email }, req);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/verify-old-password
// @desc    Verify old password and generate verification code for password update
// @access  Private
router.post(
  '/verify-old-password',
  protect,
  [body('oldPassword').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { oldPassword } = req.body;
      const user = await User.findById(req.user._id);

      // Verify old password
      if (!(await user.comparePassword(oldPassword))) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetCode = code;
      user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await user.save();

      res.json({
        success: true,
        message: 'Verification code generated.',
        verificationCode: code, // Return code directly without email
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/update-password-with-verification
// @desc    Update password with email verification code
// @access  Private
router.post(
  '/update-password-with-verification',
  protect,
  [
    body('verificationCode').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { verificationCode, newPassword } = req.body;
      const user = await User.findById(req.user._id);

      // Verify code
      if (!user.resetCode || !user.resetCodeExpires || user.resetCode !== verificationCode || user.resetCodeExpires < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code',
        });
      }

      // Update password
      user.password = newPassword;
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      await user.save();

      // Log action
      await logAction('PASSWORD_UPDATED', 'User', user._id, user._id, user.hospitalId, {}, req);

      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/resend-verification-code
// @desc    Generate new verification code for password update
// @access  Private
router.post('/resend-verification-code', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Generate new verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    res.json({
      success: true,
      message: 'Verification code generated.',
      verificationCode: code, // Return code directly without email
    });
  } catch (error) {
    next(error);
  }
});

export default router;

