import mongoose, { Document, Schema } from 'mongoose';

export interface IHospital extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  license_number: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contact_email: string;
  contact_phone: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const hospitalSchema = new Schema<IHospital>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  license_number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  contact_email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contact_phone: {
    type: String,
    required: true,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Hospital = mongoose.model<IHospital>('Hospital', hospitalSchema);

export default Hospital;