import express from 'express';
import { body, validationResult } from 'express-validator';
import DonationAppointment from '../models/DonationAppointment.model.js';
import Hospital from '../models/Hospital.model.js';
import BloodCamp from '../models/BloodCamp.model.js';
import HospitalSlot from '../models/HospitalSlot.model.js';
import { protectPublic } from '../middleware/publicAuth.middleware.js';

const router = express.Router();

// Book hospital donation appointment (simple date/time)
router.post(
  '/hospital',
  protectPublic,
  [body('hospitalId').isMongoId(), body('timeSlot').isISO8601()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const hospital = await Hospital.findById(req.body.hospitalId);
      if (!hospital || !hospital.isApproved) {
        return res.status(400).json({ success: false, message: 'Hospital not found or not approved' });
      }

      const appointment = await DonationAppointment.create({
        userId: req.publicUser._id,
        hospitalId: req.body.hospitalId,
        timeSlot: req.body.timeSlot,
      });

      res.status(201).json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  }
);

// Public: get active hospital slots for a specific hospital
router.get('/hospital-slots/:hospitalId', async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const slots = await HospitalSlot.find({
      hospitalId,
      status: 'active',
    }).sort({ startTime: 1 });

    res.json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
});

// Book a specific hospital slot
router.post(
  '/hospital-slot',
  protectPublic,
  [body('hospitalId').isMongoId(), body('slotId').isMongoId()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { hospitalId, slotId } = req.body;

      const hospital = await Hospital.findById(hospitalId);
      if (!hospital || !hospital.isApproved) {
        return res.status(400).json({ success: false, message: 'Hospital not found or not approved' });
      }

      const slot = await HospitalSlot.findOne({ _id: slotId, hospitalId });
      if (!slot) {
        return res.status(404).json({ success: false, message: 'Slot not found for this hospital' });
      }

      if (slot.status !== 'active') {
        return res.status(400).json({ success: false, message: 'Slot is not active' });
      }

      if (slot.bookedCount >= slot.capacity) {
        return res.status(400).json({ success: false, message: 'Slot is full' });
      }

      const appointment = await DonationAppointment.create({
        userId: req.publicUser._id,
        hospitalId: slot.hospitalId,
        hospitalSlotId: slot._id,
        timeSlot: slot.startTime,
      });

      slot.bookedCount += 1;
      await slot.save();

      res.status(201).json({ success: true, data: appointment, slot });
    } catch (error) {
      next(error);
    }
  }
);

// Book camp slot (wraps BloodCamp time slot registration)
router.post(
  '/camp',
  protectPublic,
  [body('campId').isMongoId(), body('timeSlotIndex').isInt({ min: 0 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const camp = await BloodCamp.findById(req.body.campId);
      if (!camp) {
        return res.status(404).json({ success: false, message: 'Blood camp not found' });
      }

      const timeSlotIndex = req.body.timeSlotIndex;
      if (timeSlotIndex >= camp.timeSlots.length) {
        return res.status(400).json({ success: false, message: 'Invalid time slot index' });
      }

      const timeSlot = camp.timeSlots[timeSlotIndex];
      if (timeSlot.registeredDonors.length >= timeSlot.maxDonors) {
        return res.status(400).json({ success: false, message: 'Time slot is full' });
      }

      // Register anonymous entry for now
      timeSlot.registeredDonors.push({
        firstName: req.publicUser.firstName,
        lastName: req.publicUser.lastName,
        phone: req.publicUser.phone,
        email: req.publicUser.email,
        registeredAt: new Date(),
      });

      camp.totalRegistrations += 1;
      await camp.save();

      const appointment = await DonationAppointment.create({
        userId: req.publicUser._id,
        campId: camp._id,
        campTimeSlotIndex: timeSlotIndex,
      });

      res.status(201).json({ success: true, data: appointment, camp });
    } catch (error) {
      next(error);
    }
  }
);

// List own appointments
router.get('/', protectPublic, async (req, res, next) => {
  try {
    const appointments = await DonationAppointment.find({ userId: req.publicUser._id })
      .populate('hospitalId', 'name address')
      .populate('campId', 'name location');

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
});

// Cancel appointment
router.put('/:id/cancel', protectPublic, async (req, res, next) => {
  try {
    const appt = await DonationAppointment.findOne({ _id: req.params.id, userId: req.publicUser._id });
    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appt.status = 'cancelled';
    await appt.save();

    res.json({ success: true, data: appt });
  } catch (error) {
    next(error);
  }
});

export default router;
