import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAdminLog extends Document {
  adminId: Types.ObjectId;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: string;
  createdAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetId: { type: String },
    targetType: { type: String },
    details: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);
