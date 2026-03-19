import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStudyGroup extends Document {
  userId: Types.ObjectId;
  subject: string;
  description: string;
  membersLimit: number;
  status: 'open' | 'closed' | 'completed';
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  memberCount: number;
  availableSpots: number;
  isFull: boolean;
}

const StudyGroupSchema = new Schema<IStudyGroup>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true // Add index for faster queries
    },
    subject: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    description: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    membersLimit: { 
      type: Number, 
      required: true,
      min: [2, 'Members limit must be at least 2'],
      max: [100, 'Members limit cannot exceed 100']
    },
    status: { 
      type: String, 
      enum: {
        values: ['open', 'closed', 'completed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'open',
      index: true
    },
    members: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      index: true
    }],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for member count
StudyGroupSchema.virtual('memberCount').get(function(this: IStudyGroup) {
  return this.members?.length || 0;
});

// Virtual for available spots
StudyGroupSchema.virtual('availableSpots').get(function(this: IStudyGroup) {
  return this.membersLimit - (this.members?.length || 0);
});

// Virtual for checking if group is full
StudyGroupSchema.virtual('isFull').get(function(this: IStudyGroup) {
  return this.members?.length >= this.membersLimit;
});

// Pre-save middleware to ensure creator is in members
StudyGroupSchema.pre('save', function(next) {
  // Add creator to members if not already present
  if (this.isNew && this.userId && !this.members.includes(this.userId)) {
    this.members.push(this.userId);
  }
  next();
});

// Pre-validate middleware
StudyGroupSchema.pre('validate', function(next) {
  // Ensure membersLimit is at least 2
  if (this.membersLimit < 2) {
    next(new Error('Members limit must be at least 2'));
  } else {
    next();
  }
});

// Instance method to check if user is member
StudyGroupSchema.methods.isMember = function(userId: string): boolean {
  return this.members.some((id: Types.ObjectId) => id.toString() === userId);
};

// Instance method to check if user is creator
StudyGroupSchema.methods.isCreator = function(userId: string): boolean {
  return this.userId.toString() === userId;
};

// Instance method to add member
StudyGroupSchema.methods.addMember = async function(userId: string): Promise<boolean> {
  if (this.status !== 'open') {
    throw new Error('Group is not open for joining');
  }
  
  if (this.members.length >= this.membersLimit) {
    throw new Error('Group is full');
  }
  
  if (this.isMember(userId)) {
    throw new Error('Already a member');
  }
  
  this.members.push(new Types.ObjectId(userId));
  await this.save();
  return true;
};

// Instance method to remove member
StudyGroupSchema.methods.removeMember = async function(userId: string): Promise<boolean> {
  if (this.isCreator(userId)) {
    throw new Error('Creator cannot be removed');
  }
  
  if (!this.isMember(userId)) {
    throw new Error('Not a member');
  }
  
  this.members = this.members.filter(
    (id: Types.ObjectId) => id.toString() !== userId
  );
  await this.save();
  return true;
};

// Static method to find groups by member
StudyGroupSchema.statics.findByMember = function(userId: string) {
  return this.find({ members: userId })
    .populate('userId', 'name email phone')
    .populate('members', 'name email phone')
    .sort({ createdAt: -1 });
};

// Static method to find open groups
StudyGroupSchema.statics.findOpen = function() {
  return this.find({ status: 'open' })
    .populate('userId', 'name email phone')
    .populate('members', 'name email phone')
    .sort({ createdAt: -1 });
};

// Indexes for better query performance
StudyGroupSchema.index({ userId: 1, createdAt: -1 });
StudyGroupSchema.index({ status: 1, createdAt: -1 });
StudyGroupSchema.index({ members: 1 });

export default mongoose.model<IStudyGroup>('StudyGroup', StudyGroupSchema);