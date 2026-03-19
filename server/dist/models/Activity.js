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
const ActivitySchema = new mongoose_1.Schema({
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
    requiredParticipants: {
        type: Number,
        required: [true, 'Required participants is required'],
        min: [1, 'Required participants must be at least 1'],
        max: [100, 'Required participants cannot exceed 100']
    },
    deadline: {
        type: String,
        trim: true
    },
    contact: {
        type: String,
        trim: true
    },
    whatsappLink: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    activityType: {
        type: String,
        enum: ['whatsapp', 'limited'],
        required: true,
        default: 'whatsapp'
    },
    maxParticipants: {
        type: Number,
        min: [1, 'Max participants must be at least 1'],
        required: function () {
            return this.activityType === 'limited';
        }
    },
    status: {
        type: String,
        enum: {
            values: ['open', 'full', 'closed'],
            message: '{VALUE} is not a valid status'
        },
        default: 'open'
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            joinedAt: { type: Date, default: Date.now },
            status: {
                type: String,
                enum: ['approved', 'pending', 'rejected'],
                default: 'approved'
            }
        }],
    joinRequests: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            requestedAt: { type: Date, default: Date.now },
            message: String
        }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Virtual for approved participants count
ActivitySchema.virtual('approvedParticipantsCount').get(function () {
    return this.participants?.filter(p => p.status === 'approved').length || 0;
});
// Virtual for pending requests count
ActivitySchema.virtual('pendingRequestsCount').get(function () {
    return this.joinRequests?.length || 0;
});
// Virtual for checking if activity is full
ActivitySchema.virtual('isFull').get(function () {
    if (this.activityType === 'whatsapp')
        return false;
    if (!this.maxParticipants)
        return false;
    const approvedCount = this.participants?.filter(p => p.status === 'approved').length || 0;
    return approvedCount >= this.maxParticipants;
});
// Virtual for available spots
ActivitySchema.virtual('availableSpots').get(function () {
    if (this.activityType === 'whatsapp')
        return null;
    if (!this.maxParticipants)
        return null;
    const approvedCount = this.participants?.filter(p => p.status === 'approved').length || 0;
    return this.maxParticipants - approvedCount;
});
// Indexes
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ status: 1, deadline: 1 });
ActivitySchema.index({ 'participants.user': 1 });
ActivitySchema.index({ 'joinRequests.user': 1 });
ActivitySchema.index({ activityType: 1 });
exports.default = mongoose_1.default.model('Activity', ActivitySchema);
