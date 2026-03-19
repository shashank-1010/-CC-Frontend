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
const StudyGroupSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Add index for faster queries
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    membersLimit: {
        type: Number,
        required: true,
        min: [2, 'Members limit must be at least 2'],
        max: [100, 'Members limit cannot exceed 100']
    },
    status: {
        type: String,
        enum: {
            values: ['open', 'closed', 'completed'],
            message: '{VALUE} is not a valid status'
        },
        default: 'open',
        index: true
    },
    members: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        }],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Virtual for member count
StudyGroupSchema.virtual('memberCount').get(function () {
    return this.members?.length || 0;
});
// Virtual for available spots
StudyGroupSchema.virtual('availableSpots').get(function () {
    return this.membersLimit - (this.members?.length || 0);
});
// Virtual for checking if group is full
StudyGroupSchema.virtual('isFull').get(function () {
    return this.members?.length >= this.membersLimit;
});
// Pre-save middleware to ensure creator is in members
StudyGroupSchema.pre('save', function (next) {
    // Add creator to members if not already present
    if (this.isNew && this.userId && !this.members.includes(this.userId)) {
        this.members.push(this.userId);
    }
    next();
});
// Pre-validate middleware
StudyGroupSchema.pre('validate', function (next) {
    // Ensure membersLimit is at least 2
    if (this.membersLimit < 2) {
        next(new Error('Members limit must be at least 2'));
    }
    else {
        next();
    }
});
// Instance method to check if user is member
StudyGroupSchema.methods.isMember = function (userId) {
    return this.members.some((id) => id.toString() === userId);
};
// Instance method to check if user is creator
StudyGroupSchema.methods.isCreator = function (userId) {
    return this.userId.toString() === userId;
};
// Instance method to add member
StudyGroupSchema.methods.addMember = async function (userId) {
    if (this.status !== 'open') {
        throw new Error('Group is not open for joining');
    }
    if (this.members.length >= this.membersLimit) {
        throw new Error('Group is full');
    }
    if (this.isMember(userId)) {
        throw new Error('Already a member');
    }
    this.members.push(new mongoose_1.Types.ObjectId(userId));
    await this.save();
    return true;
};
// Instance method to remove member
StudyGroupSchema.methods.removeMember = async function (userId) {
    if (this.isCreator(userId)) {
        throw new Error('Creator cannot be removed');
    }
    if (!this.isMember(userId)) {
        throw new Error('Not a member');
    }
    this.members = this.members.filter((id) => id.toString() !== userId);
    await this.save();
    return true;
};
// Static method to find groups by member
StudyGroupSchema.statics.findByMember = function (userId) {
    return this.find({ members: userId })
        .populate('userId', 'name email phone')
        .populate('members', 'name email phone')
        .sort({ createdAt: -1 });
};
// Static method to find open groups
StudyGroupSchema.statics.findOpen = function () {
    return this.find({ status: 'open' })
        .populate('userId', 'name email phone')
        .populate('members', 'name email phone')
        .sort({ createdAt: -1 });
};
// Indexes for better query performance
StudyGroupSchema.index({ userId: 1, createdAt: -1 });
StudyGroupSchema.index({ status: 1, createdAt: -1 });
StudyGroupSchema.index({ members: 1 });
exports.default = mongoose_1.default.model('StudyGroup', StudyGroupSchema);
