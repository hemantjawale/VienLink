import mongoose, { Document, Schema } from 'mongoose';

export interface IDonor extends Document {
  _id: mongoose.Types.ObjectId;
  hospital_id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone: string;
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  date_of_birth: Date;
  medical_history: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    last_donation?: Date;
  };
  is_active: boolean;
  last_donation?: Date;
  created_at: Date;
  updated_at: Date;
}

const donorSchema = new Schema<IDonor>({
  hospital_id: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  blood_type: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  date_of_birth: {
    type: Date,
    required: true
  },
  medical_history: {
    conditions: [{
      type: String,
      trim: true
    }],
    medications: [{
      type: String,
      trim: true
    }],
    allergies: [{
      type: String,
      trim: true
    }],
    last_donation: Date
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_donation: Date,
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

// Create indexes for optimal query performance
donorSchema.index({ hospital_id: 1, blood_type: 1 });
donorSchema.index({ phone: 1 });
donorSchema.index({ email: 1 }, { sparse: true });

const Donor = mongoose.model<IDonor>('Donor', donorSchema);

export default Donor;