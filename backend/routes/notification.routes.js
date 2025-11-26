import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { protectPublic } from '../middleware/publicAuth.middleware.js';
import notificationService from '../services/notification.service.js';
import Notification from '../models/Notification.model.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications with pagination
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    let result;
    if (unreadOnly) {
      // Get only unread notifications
      const notifications = await Notification.find({
        recipient: req.user._id,
        recipientModel: 'User',
        read: false,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('createdBy', 'firstName lastName email');

      result = {
        notifications,
        total: notifications.length,
        unreadCount: notifications.length,
        page,
        totalPages: 1
      };
    } else {
      result = await notificationService.getUserNotifications(req.user._id, 'User', page, limit);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', protect, async (req, res, next) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user._id, 'User');
    
    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.patch('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.patch('/read-all', protect, async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user._id, 'User');
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const notification = await notificationService.deleteNotification(req.params.id, req.user._id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/broadcast-emergency
// @desc    Broadcast emergency notification (Super Admin only)
// @access  Private (Super Admin)
router.post('/broadcast-emergency', protect, async (req, res, next) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can broadcast emergency notifications'
      });
    }

    const { title, message, priority = 'high' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    const notifications = await notificationService.broadcastEmergencyNotification(
      title,
      message,
      priority,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Emergency notification broadcasted successfully',
      data: {
        notifiedUsers: notifications.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/test
// @desc    Send test notification (for development)
// @access  Private
router.post('/test', protect, async (req, res, next) => {
  try {
    const { type = 'info', title, message } = req.body;

    const notification = await notificationService.createNotification({
      recipient: req.user._id,
      recipientModel: 'User',
      type: 'SYSTEM_MAINTENANCE',
      title: title || 'Test Notification',
      message: message || 'This is a test notification to verify the real-time system is working.',
      priority: 'low',
      actionRequired: false,
      createdBy: req.user._id,
      creatorModel: 'User'
    });

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: notification
    });
  } catch (error) {
    next(error);
  }
});

// Public user notification routes
// @route   GET /api/notifications/public
// @desc    Get public user notifications
// @access  Private (Public User)
router.get('/public', protectPublic, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await notificationService.getUserNotifications(req.publicUser._id, 'PublicUser', page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/public/unread-count
// @desc    Get public user unread notifications count
// @access  Private (Public User)
router.get('/public/unread-count', protectPublic, async (req, res, next) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.publicUser._id, 'PublicUser');
    
    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/notifications/public/:id/read
// @desc    Mark public user notification as read
// @access  Private (Public User)
router.patch('/public/:id/read', protectPublic, async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.publicUser._id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/notifications/public/read-all
// @desc    Mark all public user notifications as read
// @access  Private (Public User)
router.patch('/public/read-all', protectPublic, async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.publicUser._id, 'PublicUser');
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/public/:id
// @desc    Delete public user notification
// @access  Private (Public User)
router.delete('/public/:id', protectPublic, async (req, res, next) => {
  try {
    const notification = await notificationService.deleteNotification(req.params.id, req.publicUser._id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/cleanup
// @desc    Cleanup expired notifications (admin only)
// @access  Private (Admin)
router.post('/cleanup', protect, async (req, res, next) => {
  try {
    // Only allow super admins and hospital admins
    if (!['super_admin', 'hospital_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const result = await notificationService.cleanupExpiredNotifications();

    res.json({
      success: true,
      message: 'Expired notifications cleaned up successfully',
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
