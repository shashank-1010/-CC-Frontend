import mongoose, { Document, Schema } from 'mongoose';

export interface IRide extends Document {
  from: string;
  to: string;
  rideTime: Date;
  seats: number;
  price?: number;
  status: 'active' | 'full' | 'cancelled';
  userId: mongoose.Types.ObjectId;
  passengers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RideSchema = new Schema<IRide>(
  {
    from: { 
      type: String, 
      required: [true, 'Starting point is required'],
      trim: true 
    },
    to: { 
      type: String, 
      required: [true, 'Destination is required'],
      trim: true 
    },
    rideTime: { 
      type: Date, 
      required: [true, 'Ride time is required'] 
    },
    seats: { 
      type: Number, 
      required: [true, 'Number of seats is required'],
      min: [1, 'At least 1 seat required'],
      max: [10, 'Maximum 10 seats allowed']
    },
    price: { 
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    status: { 
      type: String, 
      enum: {
        values: ['active', 'full', 'cancelled'],
        message: '{VALUE} is not a valid status'
      },
      default: 'active' 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    passengers: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for available seats
RideSchema.virtual('availableSeats').get(function() {
  return this.seats - (this.passengers?.length || 0);
});

// Virtual for checking if ride is full
RideSchema.virtual('isFull').get(function() {
  return (this.passengers?.length || 0) >= this.seats;
});

// Index for faster queries
RideSchema.index({ userId: 1, rideTime: -1 });
RideSchema.index({ status: 1, rideTime: 1 });
RideSchema.index({ from: 1, to: 1, rideTime: 1 });

export default mongoose.model<IRide>('Ride', RideSchema);