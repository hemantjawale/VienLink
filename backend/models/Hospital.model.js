import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },
    licenseNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'premium'],
        default: 'free',
      },
      startDate: Date,
      endDate: Date,
      isActive: {
        type: Boolean,
        default: false,
      },
    },
    settings: {
      apiLimit: {
        type: Number,
        default: 1000,
      },
      branding: {
        logo: String,
        primaryColor: String,
        secondaryColor: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Hospital', hospitalSchema);

