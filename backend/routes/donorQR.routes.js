import express from 'express';
import QRCode from 'qrcode';
import PublicUser from '../models/PublicUser.model.js';
import Donor from '../models/Donor.model.js';
import DonationAppointment from '../models/DonationAppointment.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { protectPublic } from '../middleware/publicAuth.middleware.js';

const router = express.Router();

// @route   GET /api/donor-qr/generate
// @desc    Generate QR code for donor profile
// @access  Private (Public User)
router.get('/generate', protectPublic, async (req, res, next) => {
    try {
        const user = await PublicUser.findById(req.publicUser._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get donation stats
        const completedDonations = await DonationAppointment.find({
            userId: req.publicUser._id,
            status: 'completed',
        }).sort({ appointmentDate: -1 });

        const totalDonations = completedDonations.length;
        const lastDonation = completedDonations[0]?.appointmentDate || null;

        // Build QR data
        const qrData = {
            id: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            bloodGroup: user.bloodGroup || 'Not specified',
            phone: user.phone || '',
            email: user.email || '',
            totalDonations,
            lastDonation: lastDonation ? lastDonation.toISOString().split('T')[0] : 'Never',
            livesSaved: totalDonations * 3,
            rewardPoints: user.rewardPoints || 0,
            badges: (user.badges || []).length,
            verified: true,
            platform: 'VienLink',
            generatedAt: new Date().toISOString(),
        };

        // Generate QR code as base64 data URL
        const qrImage = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 400,
            margin: 2,
            color: {
                dark: '#1a1a2e',
                light: '#ffffff',
            },
            errorCorrectionLevel: 'H',
        });

        res.json({
            success: true,
            data: {
                qrImage,
                qrData,
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/donor-qr/scan
// @desc    Scan and verify donor QR code (for hospitals)
// @access  Private (Staff)
router.post('/scan', protect, async (req, res, next) => {
    try {
        const { qrData } = req.body;
        if (!qrData || !qrData.id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid QR code data',
            });
        }

        const user = await PublicUser.findById(qrData.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found in system',
                verified: false,
            });
        }

        // Get fresh stats
        const completedDonations = await DonationAppointment.find({
            userId: user._id,
            status: 'completed',
        }).sort({ appointmentDate: -1 });

        const totalDonations = completedDonations.length;
        const lastDonation = completedDonations[0]?.appointmentDate || null;

        // Check eligibility (90-day gap)
        let isEligible = true;
        let daysUntilEligible = 0;
        if (lastDonation) {
            const daysSinceLastDonation = Math.floor(
                (Date.now() - new Date(lastDonation)) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceLastDonation < 90) {
                isEligible = false;
                daysUntilEligible = 90 - daysSinceLastDonation;
            }
        }

        res.json({
            success: true,
            verified: true,
            data: {
                name: `${user.firstName} ${user.lastName}`,
                bloodGroup: user.bloodGroup,
                phone: user.phone,
                email: user.email,
                totalDonations,
                lastDonation: lastDonation ? lastDonation.toISOString().split('T')[0] : 'Never',
                livesSaved: totalDonations * 3,
                rewardPoints: user.rewardPoints || 0,
                isEligible,
                daysUntilEligible,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
