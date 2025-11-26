import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const publicUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    city: String,
    pinCode: String,
    hasUnderlyingDisease: {
      type: Boolean,
      required: true,
    },
    diseaseDetails: String,
    onMedication: {
      type: Boolean,
      required: true,
    },
    medicationDetails: String,
    rewardPoints: {
      type: Number,
      default: 0,
    },
    badges: [badgeSchema],
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    resetCode: String,
    resetCodeExpires: Date,
  },
  { timestamps: true }
);

publicUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

publicUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('PublicUser', publicUserSchema);
