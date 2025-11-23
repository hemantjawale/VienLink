import express from 'express';
import { body, validationResult } from 'express-validator';
import Hospital from '../models/Hospital.model.js';
import User from '../models/User.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { logAction } from '../utils/auditLogger.js';
import { generateToken } from '../utils/generateToken.js';

const router = express.Router();

// @route   POST /api/hospitals/register
// @desc    Public hospital registration (creates hospital and admin)
// @access  Public
router.post(
  '/register',
  [
    body('hospitalName').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('phone').trim().notEmpty(),
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

      const {
        hospitalName,
        email,
        password,
        firstName,
        lastName,
        phone,
        address,
        licenseNumber,
      } = req.body;

      // Check if hospital email exists
      const existingHospital = await Hospital.findOne({ email });
      if (existingHospital) {
        return res.status(400).json({
          success: false,
          message: 'Hospital with this email already exists',
        });
      }

      // Check if user email exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Create hospital
      const hospital = await Hospital.create({
        name: hospitalName,
        email,
        phone,
        address,
        licenseNumber,
        isApproved: false, // Requires super admin approval
      });

      // Create hospital admin user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: 'hospital_admin',
        hospitalId: hospital._id,
        phone,
      });

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'Hospital registered successfully. Waiting for approval.',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          hospitalId: user.hospitalId,
        },
        hospital: {
          id: hospital._id,
          name: hospital.name,
          isApproved: hospital.isApproved,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.use(protect);

// @route   GET /api/hospitals
// @desc    Get all hospitals
// @access  Private (Super Admin)
router.get('/', authorize('super_admin'), async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.isApproved !== undefined) {
      filter.isApproved = req.query.isApproved === 'true';
    }

    const hospitals = await Hospital.find(filter)
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 50)
      .skip(parseInt(req.query.skip) || 0);

    const total = await Hospital.countDocuments(filter);

    res.json({
      success: true,
      count: hospitals.length,
      total,
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/hospitals/:id/reject
// @desc    Reject or unapprove hospital
// @access  Private (Super Admin)
router.put('/:id/reject', authorize('super_admin'), async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    // Mark as not approved and clear approver info
    hospital.isApproved = false;
    hospital.approvedBy = null;
    hospital.approvedAt = null;
    await hospital.save();

    await logAction('HOSPITAL_REJECTED', 'Hospital', hospital._id, req.user._id, null, {}, req);

    res.json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/hospitals/:id
// @desc    Get single hospital
// @access  Private
router.get('/:id', authorize('super_admin', 'hospital_admin'), async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };

    // Hospital admins can only see their own hospital
    if (req.user.role === 'hospital_admin') {
      if (req.params.id !== req.user.hospitalId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this hospital',
        });
      }
    }

    const hospital = await Hospital.findOne(filter)
      .populate('approvedBy', 'firstName lastName');

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    res.json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/hospitals/:id/approve
// @desc    Approve hospital
// @access  Private (Super Admin)
router.put('/:id/approve', authorize('super_admin'), async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    if (hospital.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Hospital is already approved',
      });
    }

    hospital.isApproved = true;
    hospital.approvedBy = req.user._id;
    hospital.approvedAt = new Date();
    await hospital.save();

    await logAction('HOSPITAL_APPROVED', 'Hospital', hospital._id, req.user._id, null, {}, req);

    res.json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/hospitals/:id
// @desc    Update hospital
// @access  Private
router.put('/:id', authorize('super_admin', 'hospital_admin'), async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };

    if (req.user.role === 'hospital_admin') {
      if (req.params.id !== req.user.hospitalId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this hospital',
        });
      }
    }

    const hospital = await Hospital.findOne(filter);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    const oldData = hospital.toObject();
    Object.assign(hospital, req.body);
    await hospital.save();

    await logAction('HOSPITAL_UPDATED', 'Hospital', hospital._id, req.user._id, hospital._id, {
      old: oldData,
      new: hospital.toObject(),
    }, req);

    res.json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/hospitals/:id
// @desc    Delete hospital
// @access  Private (Super Admin)
router.delete('/:id', authorize('super_admin'), async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    await logAction('HOSPITAL_DELETED', 'Hospital', hospital._id, req.user._id, null, {}, req);

    res.json({
      success: true,
      message: 'Hospital deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
