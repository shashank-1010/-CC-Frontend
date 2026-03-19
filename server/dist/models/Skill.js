"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const skillSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: [true, 'Skill title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 1000
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Programming', 'Web Development', 'Mobile Development',
            'Design', 'Video Editing', 'Photo Editing',
            'Music', 'Dance', 'Sports', 'Fitness',
            'Cooking', 'Languages', 'Academics', 'Soft Skills',
            'Business', 'Marketing', 'Other'
        ]
    },
    proficiencyLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'expert'],
        default: 'intermediate'
    },
    availability: {
        type: String,
        enum: ['available', 'busy', 'unavailable'],
        default: 'available'
    },
    userId: {
        _id: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: String,
        email: String,
        whatsapp: String
    },
    whatsapp: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^\d{10}$/.test(v);
            },
            message: 'WhatsApp number must be 10 digits'
        }
    },
    tags: [{
            type: String,
            trim: true
        }],
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
// Text search index
skillSchema.index({
    title: 'text',
    description: 'text',
    tags: 'text'
});
// Category index for filtering
skillSchema.index({ category: 1, proficiencyLevel: 1, availability: 1 });
const Skill = mongoose_1.default.model('Skill', skillSchema);
exports.default = Skill;
