import express from 'express';
import { body, validationResult } from 'express-validator';
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

export default router;

