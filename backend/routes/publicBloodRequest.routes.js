import express from 'express';
import { body, validationResult } from 'express-validator';
import PublicBloodRequest from '../models/PublicBloodRequest.model.js';
import Hospital from '../models/Hospital.model.js';
import PublicUser from '../models/PublicUser.model.js';
import { protectPublic } from '../middleware/publicAuth.middleware.js';

const router = express.Router();

// Create public blood request
router.post(
  '/',
  protectPublic,
  [
    body('hospitalId').isMongoId(),
    body('bloodGroup').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('quantity').isInt({ min: 1 }),
    body('reason').trim().notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { hospitalId } = req.body;
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital || !hospital.isApproved) {
        return res.status(400).json({ success: false, message: 'Hospital not found or not approved' });
      }

      const user = await PublicUser.findById(req.publicUser._id);

      const request = await PublicBloodRequest.create({
        userId: req.publicUser._id,
        hospitalId,
        city: user?.city,
        pinCode: user?.pinCode,
        ...req.body,
      });

      res.status(201).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }
);

// List own public blood requests
router.get('/', protectPublic, async (req, res, next) => {
  try {
    const filter = { userId: req.publicUser._id };
    if (req.query.status) filter.status = req.query.status;

    const requests = await PublicBloodRequest.find(filter)
      .populate('hospitalId', 'name address')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
});

// Get single
router.get('/:id', protectPublic, async (req, res, next) => {
  try {
    const request = await PublicBloodRequest.findOne({ _id: req.params.id, userId: req.publicUser._id }).populate(
      'hospitalId',
      'name address'
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
});

export default router;
