import mongoose, { Document, Schema } from 'mongoose';

export interface ILostItem extends Document {
  title: string;
  description: string;
  category: 'lost' | 'found';
  itemType: string;
  location: string;
  date: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  imageUrl?: string;
  status: 'open' | 'resolved' | 'closed';
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LostItemSchema = new Schema<ILostItem>(
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
    category: {
      type: String,
      enum: ['lost', 'found'],
      required: true
    },
    itemType: {
      type: String,
      required: [true, 'Item type is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true
    },
    contactEmail: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'closed'],
      default: 'open'
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
LostItemSchema.index({ userId: 1, createdAt: -1 });
LostItemSchema.index({ category: 1, status: 1 });
LostItemSchema.index({ itemType: 1, location: 1 });

export default mongoose.model<ILostItem>('LostItem', LostItemSchema);