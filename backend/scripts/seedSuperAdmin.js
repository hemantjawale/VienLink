import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: `${__dirname}/../.env` });

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('Super admin already exists:');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Password: (use the one you set)`);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await User.create({
      email: 'admin@vienlink.com',
      password: 'admin123', // Default password - change after first login
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      phone: '+1234567890',
    });

    console.log('✅ Super Admin created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${superAdmin.email}`);
    console.log(`Password: admin123`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding super admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();

