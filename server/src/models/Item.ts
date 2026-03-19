import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IItem extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  whatsapp?: string;
  status: 'available' | 'reserved' | 'sold' | 'removed';
  createdAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    whatsapp: { type: String },
    status: { type: String, enum: ['available', 'reserved', 'sold', 'removed'], default: 'available' },
  },
  { timestamps: true }
);

export default mongoose.model<IItem>('Item', ItemSchema);
