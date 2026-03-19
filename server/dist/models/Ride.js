"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const RideSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    passengers: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Virtual for available seats
RideSchema.virtual('availableSeats').get(function () {
    return this.seats - (this.passengers?.length || 0);
});
// Virtual for checking if ride is full
RideSchema.virtual('isFull').get(function () {
    return (this.passengers?.length || 0) >= this.seats;
});
// Index for faster queries
RideSchema.index({ userId: 1, rideTime: -1 });
RideSchema.index({ status: 1, rideTime: 1 });
RideSchema.index({ from: 1, to: 1, rideTime: 1 });
exports.default = mongoose_1.default.model('Ride', RideSchema);
