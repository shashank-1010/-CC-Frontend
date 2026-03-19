import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'admin';
  bio?: string;
  skills?: string[];
  achievements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'],
      trim: true 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true 
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'],
      minlength: 6 
    },
    phone: { 
      type: String,
      trim: true 
    },
    role: { 
      type: String, 
      enum: ['user', 'admin'],
      default: 'user' 
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    skills: [{
      type: String,
      trim: true
    }],
    achievements: [{
      type: String,
      trim: true
    }]
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model<IUser>('User', UserSchema);