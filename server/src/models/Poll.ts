import mongoose, { Document, Schema } from 'mongoose';

export interface IPoll extends Document {
  question: string;
  options: {
    text: string;
    votes: number;
    voters: mongoose.Types.ObjectId[];
  }[];
  comments: {
    comment: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  createdBy: mongoose.Types.ObjectId;
  votedUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PollSchema = new Schema<IPoll>(
  {
    question: { type: String, required: true },
    options: [{
      text: { type: String, required: true },
      votes: { type: Number, default: 0 },
      voters: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }],
    comments: [{
      comment: { type: String, required: true },
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    votedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export default mongoose.model<IPoll>('Poll', PollSchema);