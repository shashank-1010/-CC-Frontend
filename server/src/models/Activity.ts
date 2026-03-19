import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  requiredParticipants: number;
  deadline?: string;
  contact?: string;
  whatsappLink?: string;
  location?: string;
  activityType: 'whatsapp' | 'limited';
  maxParticipants?: number;
  status: 'open' | 'full' | 'closed';
  userId: mongoose.Types.ObjectId;
  participants: {
    user: mongoose.Types.ObjectId;
    joinedAt: Date;
    status: 'approved' | 'pending' | 'rejected';
  }[];
  joinRequests: {
    user: mongoose.Types.ObjectId;
    requestedAt: Date;
    message?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
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
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    requiredParticipants: { 
      type: Number, 
      required: [true, 'Required participants is required'],
      min: [1, 'Required participants must be at least 1'],
      max: [100, 'Required participants cannot exceed 100']
    },
    deadline: { 
      type: String,
      trim: true 
    },
    contact: { 
      type: String,
      trim: true 
    },
    whatsappLink: { 
      type: String,
      trim: true 
    },
    location: {
      type: String,
      trim: true
    },
    activityType: {
      type: String,
      enum: ['whatsapp', 'limited'],
      required: true,
      default: 'whatsapp'
    },
    maxParticipants: {
      type: Number,
      min: [1, 'Max participants must be at least 1'],
      required: function(this: any) {
        return this.activityType === 'limited';
      }
    },
    status: { 
      type: String, 
      enum: {
        values: ['open', 'full', 'closed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'open' 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    participants: [{
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      joinedAt: { type: Date, default: Date.now },
      status: { 
        type: String, 
        enum: ['approved', 'pending', 'rejected'],
        default: 'approved'
      }
    }],
    joinRequests: [{
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      requestedAt: { type: Date, default: Date.now },
      message: String
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for approved participants count
ActivitySchema.virtual('approvedParticipantsCount').get(function() {
  return this.participants?.filter(p => p.status === 'approved').length || 0;
});

// Virtual for pending requests count
ActivitySchema.virtual('pendingRequestsCount').get(function() {
  return this.joinRequests?.length || 0;
});

// Virtual for checking if activity is full
ActivitySchema.virtual('isFull').get(function() {
  if (this.activityType === 'whatsapp') return false;
  if (!this.maxParticipants) return false;
  const approvedCount = this.participants?.filter(p => p.status === 'approved').length || 0;
  return approvedCount >= this.maxParticipants;
});

// Virtual for available spots
ActivitySchema.virtual('availableSpots').get(function() {
  if (this.activityType === 'whatsapp') return null;
  if (!this.maxParticipants) return null;
  const approvedCount = this.participants?.filter(p => p.status === 'approved').length || 0;
  return this.maxParticipants - approvedCount;
});

// Indexes
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ status: 1, deadline: 1 });
ActivitySchema.index({ 'participants.user': 1 });
ActivitySchema.index({ 'joinRequests.user': 1 });
ActivitySchema.index({ activityType: 1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);