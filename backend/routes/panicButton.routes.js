import express from 'express';
import { authorize } from '../middleware/auth.middleware.js';
import PublicUser from '../models/PublicUser.model.js';
import Hospital from '../models/Hospital.model.js';
import { sendEmergencyAlertEmail } from '../utils/emergencyEmail.js';

const router = express.Router();

// @route   POST /api/hospitals/panic
// @desc    Hospital panic button — instantly broadcast to ALL nearby donors
// @access  Private (hospital_admin, staff)
router.post('/panic', authorize('hospital_admin', 'staff', 'super_admin'), async (req, res, next) => {
    try {
        const { bloodGroup, message, unitsNeeded } = req.body;

        // Get hospital info
        const hospital = await Hospital.findById(req.user.hospitalId);
        const hospitalName = hospital?.name || 'VienLink Hospital';

        // Find all donors — if blood group specified, filter; otherwise broadcast to ALL
        const donorFilter = {};
        if (bloodGroup && bloodGroup !== 'ALL') {
            donorFilter.bloodGroup = bloodGroup;
        }

        const donors = await PublicUser.find(donorFilter).select('firstName lastName email phone bloodGroup');

        if (donors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No donors found in the system',
            });
        }

        // Send email alerts asynchronously to all donors
        let emailsSent = 0;
        const emailPromises = donors.map(async (donor) => {
            try {
                await sendEmergencyAlertEmail(
                    donor.email,
                    {
                        bloodGroup: bloodGroup || 'ALL',
                        hospitalName,
                        distance: 'N/A',
                        message: message || `🚨 HOSPITAL PANIC ALERT from ${hospitalName}! Urgent blood needed. Please come immediately if you can donate.`,
                        unitsNeeded: unitsNeeded || 'Multiple',
                    }
                );
                emailsSent++;
            } catch (err) {
                console.error(`Panic email failed for ${donor.email}:`, err.message);
            }
        });

        // Don't await all — respond immediately
        Promise.allSettled(emailPromises).then(() => {
            console.log(`🚨 Panic broadcast complete: ${emailsSent}/${donors.length} emails sent`);
        });

        res.json({
            success: true,
            message: `Panic broadcast initiated to ${donors.length} donors`,
            data: {
                donorsNotified: donors.length,
                bloodGroup: bloodGroup || 'ALL',
                hospitalName,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
