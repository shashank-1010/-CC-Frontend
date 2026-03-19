import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  title: string;
  description: string;
  category: 'hostel' | 'campus' | 'mess' | 'security' | 'maintenance' | 'other';
  location: string;
  imageUrl?: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: mongoose.Types.ObjectId;
  adminRemarks?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      enum: {
        values: ['hostel', 'campus', 'mess', 'security', 'maintenance', 'other'],
        message: '{VALUE} is not a valid category'
      },
      required: [true, 'Category is required']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    imageUrl: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'rejected'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    adminRemarks: {
      type: String,
      trim: true
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for time elapsed
ComplaintSchema.virtual('timeElapsed').get(function() {
  const now = new Date();
  const diff = now.getTime() - this.createdAt.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Indexes
ComplaintSchema.index({ userId: 1, createdAt: -1 });
ComplaintSchema.index({ status: 1, category: 1 });
ComplaintSchema.index({ createdAt: -1 });

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);