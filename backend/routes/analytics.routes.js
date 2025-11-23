import express from 'express';
import BloodUnit from '../models/BloodUnit.model.js';
import BloodRequest from '../models/BloodRequest.model.js';
import Donor from '../models/Donor.model.js';
import BloodCamp from '../models/BloodCamp.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { predictStockLevel } from '../utils/stockPrediction.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', authorize('hospital_admin', 'staff', 'super_admin'), async (req, res, next) => {
  try {
    const filter = {};
    
    if (req.user.role !== 'super_admin') {
      filter.hospitalId = req.user.hospitalId;
    }

    // Blood inventory summary
    const inventorySummary = await BloodUnit.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$bloodGroup',
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] },
          },
          reserved: {
            $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] },
          },
          expiringSoon: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lte: ['$expiryDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] },
                    { $gte: ['$expiryDate', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Recent requests
    const recentRequests = await BloodRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('requestedBy', 'firstName lastName');

    // Total donors
    const totalDonors = await Donor.countDocuments(filter);

    // Upcoming camps
    const upcomingCamps = await BloodCamp.find({
      ...filter,
      startDate: { $gte: new Date() },
      status: 'upcoming',
    })
      .sort({ startDate: 1 })
      .limit(5);

    // Monthly collection trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await BloodUnit.aggregate([
      {
        $match: {
          ...filter,
          collectionDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$collectionDate' },
            month: { $month: '$collectionDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        inventorySummary,
        recentRequests,
        totalDonors,
        upcomingCamps,
        monthlyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/stock-prediction/:bloodGroup
// @desc    Get stock prediction for a blood group
// @access  Private
router.get('/stock-prediction/:bloodGroup', authorize('hospital_admin', 'staff'), async (req, res, next) => {
  try {
    const { bloodGroup } = req.params;

    if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood group',
      });
    }

    const prediction = await predictStockLevel(
      BloodUnit,
      bloodGroup,
      req.user.hospitalId
    );

    res.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/camp/:campId
// @desc    Get blood camp analytics
// @access  Private
router.get('/camp/:campId', authorize('hospital_admin', 'staff'), async (req, res, next) => {
  try {
    const filter = { _id: req.params.campId };
    
    if (req.user.role !== 'super_admin') {
      filter.hospitalId = req.user.hospitalId;
    }

    const camp = await BloodCamp.findOne(filter);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Blood camp not found',
      });
    }

    // Calculate analytics
    const totalRegistrations = camp.totalRegistrations;
    const totalCheckIns = camp.checkIns.length;
    const attendanceRate = totalRegistrations > 0
      ? ((totalCheckIns / totalRegistrations) * 100).toFixed(2)
      : 0;

    // Time slot analysis
    const timeSlotAnalysis = camp.timeSlots.map((slot, index) => ({
      index,
      timeRange: `${slot.startTime} - ${slot.endTime}`,
      maxDonors: slot.maxDonors,
      registered: slot.registeredDonors.length,
      utilizationRate: ((slot.registeredDonors.length / slot.maxDonors) * 100).toFixed(2),
    }));

    res.json({
      success: true,
      data: {
        campId: camp._id,
        name: camp.name,
        totalRegistrations,
        totalCheckIns,
        attendanceRate: `${attendanceRate}%`,
        timeSlotAnalysis,
        status: camp.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

