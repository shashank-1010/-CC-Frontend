import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INote extends Document {
  userId: Types.ObjectId;
  title: string;
  subject: string;
  description: string;
  fileUrl?: string;
  status: 'public' | 'archived' | 'deleted';
  createdAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    fileUrl: { type: String },
    status: { type: String, enum: ['public', 'archived', 'deleted'], default: 'public' },
  },
  { timestamps: true }
);

export default mongoose.model<INote>('Note', NoteSchema);
