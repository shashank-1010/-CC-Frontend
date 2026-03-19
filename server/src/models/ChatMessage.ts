import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  message: string;
  userId: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    message: { 
      type: String, 
      required: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    isAnonymous: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);