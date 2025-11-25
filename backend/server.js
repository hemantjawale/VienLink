import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes
import authRoutes from './routes/auth.routes.js';
import donorRoutes from './routes/donor.routes.js';
import bloodUnitRoutes from './routes/bloodUnit.routes.js';
import bloodRequestRoutes from './routes/bloodRequest.routes.js';
import interHospitalRequestRoutes from './routes/interHospitalRequest.routes.js';
import bloodCampRoutes from './routes/bloodCamp.routes.js';
import staffRoutes from './routes/staff.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import auditRoutes from './routes/audit.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Check required environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ Error: JWT_SECRET is not defined in .env file');
  console.error('Please add JWT_SECRET=your_secret_key to your .env file');
  process.exit(1);
}

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/blood-units', bloodUnitRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);
app.use('/api/inter-hospital-requests', interHospitalRequestRoutes);
app.use('/api/blood-camps', bloodCampRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Vien Link API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

