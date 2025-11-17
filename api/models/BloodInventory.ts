import mongoose, { Document, Schema } from 'mongoose';

export interface IBloodInventory extends Document {
  _id: mongoose.Types.ObjectId;
  hospital_id: mongoose.Types.ObjectId;
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  batch_id: string;
  quantity_ml: number;
  collection_date: Date;
  expiry_date: Date;
  status: 'available' | 'allocated' | 'expired' | 'disposed';
  donor_id?: mongoose.Types.ObjectId;
  created_at: Date;
}

const bloodInventorySchema = new Schema<IBloodInventory>({
  hospital_id: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  blood_type: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  batch_id: {
    type: String,
    required: true,
    trim: true
  },
  quantity_ml: {
    type: Number,
    required: true,
    min: 0
  },
  collection_date: {
    type: Date,
    required: true
  },
  expiry_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'allocated', 'expired', 'disposed'],
    default: 'available'
  },
  donor_id: {
    type: Schema.Types.ObjectId,
    ref: 'Donor'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for optimal query performance
bloodInventorySchema.index({ hospital_id: 1, blood_type: 1, status: 1 });
bloodInventorySchema.index({ expiry_date: 1 });
bloodInventorySchema.index({ batch_id: 1 });

const BloodInventory = mongoose.model<IBloodInventory>('BloodInventory', bloodInventorySchema);

export default BloodInventory;