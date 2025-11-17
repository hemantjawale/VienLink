import express from 'express';
import { body } from 'express-validator';
import { googleLogin, login, refreshToken, register } from '../controllers/authController';

const router = express.Router();

// Hospital registration
router.post('/register', [
  body('hospital.name').notEmpty().withMessage('Hospital name is required'),
  body('hospital.license_number').notEmpty().withMessage('License number is required'),
  body('hospital.address.street').notEmpty().withMessage('Street address is required'),
  body('hospital.address.city').notEmpty().withMessage('City is required'),
  body('hospital.address.state').notEmpty().withMessage('State is required'),
  body('hospital.address.pincode').isLength({ min: 6, max: 6 }).withMessage('Valid 6-digit pincode is required'),
  body('hospital.contact_email').isEmail().withMessage('Valid contact email is required'),
  body('hospital.contact_phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian phone number is required'),
  body('user.name').notEmpty().withMessage('Administrator name is required'),
  body('user.email').isEmail().withMessage('Valid email is required'),
  body('user.password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('user.role').optional().isIn(['administrator', 'staff', 'medical_professional']).withMessage('Invalid role')
], register);

// Google OAuth login
router.post('/google', [
  body('id_token').notEmpty().withMessage('Google ID token is required')
], googleLogin);

// Traditional login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

// Refresh token
router.post('/refresh', [
  body('refresh_token').notEmpty().withMessage('Refresh token is required')
], refreshToken);

export default router;
