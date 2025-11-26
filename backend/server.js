import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

// Socket
import { initializeSocket } from './utils/socket.js';

// Load environment
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// -------------------- Middleware --------------------
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// -------------------- Env Validation --------------------
if (!process.env.MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET in .env");
  process.exit(1);
}

// -------------------- Database --------------------
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

connectDB();

// -------------------- Routes --------------------
import authRoutes from './routes/auth.routes.js';
import publicAuthRoutes from './routes/publicAuth.routes.js';
import donorRoutes from './routes/donor.routes.js';
import bloodUnitRoutes from './routes/bloodUnit.routes.js';
import bloodRequestRoutes from './routes/bloodRequest.routes.js';
import interHospitalRequestRoutes from './routes/interHospitalRequest.routes.js';
import publicBloodRequestRoutes from './routes/publicBloodRequest.routes.js';
import publicAppointmentRoutes from './routes/publicAppointment.routes.js';
import publicCampsRoutes from './routes/publicCamps.routes.js';
import bloodCampRoutes from './routes/bloodCamp.routes.js';
import hospitalSlotRoutes from './routes/hospitalSlot.routes.js';
import staffRoutes from './routes/staff.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import auditRoutes from './routes/audit.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import notificationRoutes from './routes/notification.routes.js';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/public-auth', publicAuthRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/blood-units', bloodUnitRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);
app.use('/api/inter-hospital-requests', interHospitalRequestRoutes);
app.use('/api/public-blood-requests', publicBloodRequestRoutes);
app.use('/api/public-appointments', publicAppointmentRoutes);
app.use('/api/public-camps', publicCampsRoutes);
app.use('/api/blood-camps', bloodCampRoutes);
app.use('/api/hospital-slots', hospitalSlotRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);

// -------------------- Health Checks --------------------
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "VienLink API Root Running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "VienLink API is running" });
});

// -------------------- Error Handler --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// -------------------- Server & Socket --------------------
const PORT = process.env.PORT || 5000;
const server = createServer(app);
const io = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO initialized`);
});

// -------------------- Graceful Shutdown --------------------
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down...");
  server.close(() => process.exit(0));
});
