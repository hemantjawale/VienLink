import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Hospital from '../models/Hospital';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { verifyGoogleToken } from '../utils/googleAuth';
import bcrypt from 'bcryptjs';

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id_token } = req.body;
    
    // Verify Google token
    const googleUserInfo = await verifyGoogleToken(id_token);
    
    // Find or create user
    let user = await User.findOne({ google_id: googleUserInfo.googleId });
    
    if (!user) {
      // Check if user exists with same email
      user = await User.findOne({ email: googleUserInfo.email });
      
      if (user) {
        // Link Google account to existing user
        user.google_id = googleUserInfo.googleId;
        await user.save();
      } else {
        res.status(404).json({ 
          error: 'User not found. Please register your hospital first or contact administrator.' 
        });
        return;
      }
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Get hospital info
    const hospital = await Hospital.findById(user.hospital_id);
    if (!hospital) {
      res.status(404).json({ error: 'Hospital not found' });
      return;
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      hospitalId: user.hospital_id.toString()
    });

    res.json({
      tokens,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        hospital: {
          id: hospital._id,
          name: hospital.name,
          license_number: hospital.license_number
        }
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Find user with hospital info
    const user = await User.findOne({ email, google_id: { $exists: false } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if user is active
    if (!user.is_active) {
      res.status(403).json({ error: 'Account is deactivated' });
      return;
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Get hospital info
    const hospital = await Hospital.findById(user.hospital_id);
    if (!hospital) {
      res.status(404).json({ error: 'Hospital not found' });
      return;
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      hospitalId: user.hospital_id.toString()
    });

    res.json({
      tokens,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        hospital: {
          id: hospital._id,
          name: hospital.name,
          license_number: hospital.license_number
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refresh_token);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      hospitalId: user.hospital_id.toString()
    });

    res.json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { hospital, user } = req.body;

    // Check if hospital with same license number exists
    const existingHospital = await Hospital.findOne({ license_number: hospital.license_number });
    if (existingHospital) {
      res.status(400).json({ error: 'Hospital with this license number already exists' });
      return;
    }

    // Check if user with same email exists
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Create hospital
    const newHospital = new Hospital({
      name: hospital.name,
      license_number: hospital.license_number,
      address: hospital.address,
      contact_email: hospital.contact_email,
      contact_phone: hospital.contact_phone,
      is_active: true,
      created_at: new Date()
    });

    await newHospital.save();

    // Create user
    const newUser = new User({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role || 'administrator',
      hospital_id: newHospital._id,
      is_active: true,
      last_login: new Date(),
      created_at: new Date()
    });

    await newUser.save();

    // Generate tokens
    const tokens = generateTokens({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      hospitalId: newHospital._id.toString()
    });

    res.status(201).json({
      message: 'Hospital and administrator registered successfully',
      tokens,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        hospital: {
          id: newHospital._id,
          name: newHospital.name,
          license_number: newHospital.license_number
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};