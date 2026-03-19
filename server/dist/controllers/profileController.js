"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveRide = exports.cancelRide = exports.getRideDetails = exports.getPendingRequests = exports.getMyLostItems = exports.getJoinedActivities = exports.getMyActivities = exports.getMyStudyGroups = exports.getMyRides = exports.getMyNotes = exports.getMyItems = exports.updateProfile = exports.getMySkills = exports.getProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const Item_1 = __importDefault(require("../models/Item"));
const Note_1 = __importDefault(require("../models/Note"));
const Ride_1 = __importDefault(require("../models/Ride"));
const LostItem_1 = __importDefault(require("../models/LostItem"));
const StudyGroup_1 = __importDefault(require("../models/StudyGroup"));
const Skill_1 = __importDefault(require("../models/Skill"));
const Activity_1 = __importDefault(require("../models/Activity"));
// @desc    Get user profile
// @route   GET /api/profile
const getProfile = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.userId)
            .select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProfile = getProfile;
// @desc    Get my skills
// @route   GET /api/profile/skills
const getMySkills = async (req, res) => {
    try {
        console.log('Fetching skills for user:', req.userId);
        const skills = await Skill_1.default.find({
            $or: [
                { userId: req.userId },
                { 'userId._id': req.userId }
            ]
        })
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });
        console.log(`Found ${skills.length} skills`);
        res.json(skills);
    }
    catch (err) {
        console.error('Error in getMySkills:', err);
        res.status(500).json({
            message: 'Failed to fetch skills',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.getMySkills = getMySkills;
// @desc    Update user profile (bio, skills, achievements)
// @route   PUT /api/profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone, bio, skills, achievements } = req.body;
        const user = await User_1.default.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Update fields
        if (name)
            user.name = name;
        if (phone !== undefined)
            user.phone = phone;
        if (bio !== undefined)
            user.bio = bio;
        if (skills !== undefined) {
            user.skills = Array.isArray(skills)
                ? skills
                : skills.split(',').map((s) => s.trim()).filter((s) => s);
        }
        if (achievements !== undefined) {
            user.achievements = Array.isArray(achievements)
                ? achievements
                : achievements.split(',').map((a) => a.trim()).filter((a) => a);
        }
        await user.save();
        const updatedUser = await User_1.default.findById(req.userId).select('-password');
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateProfile = updateProfile;
// @desc    Get my marketplace items
// @route   GET /api/profile/items
const getMyItems = async (req, res) => {
    try {
        const items = await Item_1.default.find({
            $or: [
                { userId: req.userId },
                { 'userId.id': req.userId }
            ]
        })
            .populate('userId', 'name email phone bio skills achievements')
            .sort({ createdAt: -1 });
        res.json(items);
    }
    catch (err) {
        console.error('Error in getMyItems:', err);
        res.status(500).json({
            message: 'Failed to fetch items',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.getMyItems = getMyItems;
// @desc    Get my notes
// @route   GET /api/profile/notes
const getMyNotes = async (req, res) => {
    try {
        const notes = await Note_1.default.find({
            $or: [
                { userId: req.userId },
                { 'userId.id': req.userId }
            ]
        })
            .populate('userId', 'name email phone bio skills achievements')
            .sort({ createdAt: -1 });
        res.json(notes);
    }
    catch (err) {
        console.error('Error in getMyNotes:', err);
        res.status(500).json({
            message: 'Failed to fetch notes',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.getMyNotes = getMyNotes;
// @desc    Get my rides (both created and joined)
// @route   GET /api/profile/rides
const getMyRides = async (req, res) => {
    try {
        console.log('Fetching rides for user:', req.userId);
        const rides = await Ride_1.default.find({
            $or: [
                { userId: req.userId },
                { 'passengers.userId': req.userId }
            ]
        })
            .populate('userId', 'name email phone bio skills achievements')
            .populate('passengers.userId', 'name email phone bio skills achievements')
            .sort({ createdAt: -1 });
        console.log(`Found ${rides.length} rides`);
        const transformedRides = rides.map(ride => {
            const rideObj = ride.toObject();
            if (rideObj.passengers) {
                rideObj.passengers = rideObj.passengers.filter((p) => p.status === 'approved');
            }
            return rideObj;
        });
        res.json(transformedRides);
    }
    catch (err) {
        console.error('Error in getMyRides:', err);
        res.status(500).json({
            message: 'Failed to fetch rides',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.getMyRides = getMyRides;
// @desc    Get my study groups (both created and joined)
// @route   GET /api/profile/studygroups
const getMyStudyGroups = async (req, res) => {
    try {
        console.log('Fetching study groups for user:', req.userId);
        // ✅ FIX: Use correct schema structure - members is array of ObjectIds
        const groups = await StudyGroup_1.default.find({
            $or: [
                { userId: req.userId },
                { members: req.userId }
            ]
        })
            .populate('userId', 'name email phone')
            .populate('members', 'name email phone')
            .lean()
            .sort({ createdAt: -1 });
        console.log(`Found ${groups.length} groups`);
        // Transform data for frontend
        const transformedGroups = groups.map(group => ({
            ...group,
            memberCount: group.members?.length || 0,
            isFull: (group.members?.length || 0) >= group.membersLimit
        }));
        res.json(transformedGroups);
    }
    catch (err) {
        console.error('Error in getMyStudyGroups:', err);
        res.status(500).json({
            message: 'Failed to fetch study groups',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.getMyStudyGroups = getMyStudyGroups;
// @desc    Get my activities (created by user)
// @route   GET /api/profile/activities
const getMyActivities = async (req, res) => {
    try {
        const activities = await Activity_1.default.find({
            $or: [
                { userId: req.userId },
                { 'userId.id': req.userId }
            ]
        })
            .populate('userId', 'name email phone bio skills achievements')
            .populate('participants.user', 'name email phone bio skills achievements')
            .populate('joinRequests.user', 'name email phone bio skills achievements')
            .sort({ createdAt: -1 });
        res.json(activities);
    }
    catch (err) {
        console.error('Error in getMyActivities:', err);
        res.status(500).json({
            message: 'Failed to fetch activities',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.getMyActivities = getMyActivities;
// @desc    Get activities I've joined
// @route   GET /api/profile/joined-activities
const getJoinedActivities = async (req, res) => {
    try {
        const activities = await Activity_1.default.find({
            'participants': {
                $elemMatch: {
                    'user': req.userId,
                    'status': 'approved'
                }
            }
        })
            .populate('userId', 'name email phone bio skills achievements')
            .populate('participants.user', 'name email phone bio skills achievements')
            .sort({ createdAt: -1 });
        res.json(activities);
    }
    catch (err) {
        console.error('Error in getJoinedActivities:', err);
        res.status(500).json({
            message: 'Failed to fetch joined activities',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.getJoinedActivities = getJoinedActivities;
// @desc    Get my lost & found items
// @route   GET /api/profile/lost-items
const getMyLostItems = async (req, res) => {
    try {
        console.log('Fetching lost items for user:', req.userId);
        const items = await LostItem_1.default.find({
            $or: [
                { userId: req.userId },
                { 'userId.id': req.userId }
            ]
        })
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });
        console.log(`Found ${items.length} lost items`);
        res.json(items);
    }
    catch (err) {
        console.error('Error in getMyLostItems:', err);
        res.status(500).json({
            message: 'Failed to fetch lost items',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.getMyLostItems = getMyLostItems;
// @desc    Get pending join requests (for activities I created)
// @route   GET /api/profile/pending-requests
const getPendingRequests = async (req, res) => {
    try {
        const activities = await Activity_1.default.find({
            $or: [
                { userId: req.userId },
                { 'userId.id': req.userId }
            ],
            'joinRequests.0': { $exists: true }
        })
            .populate('userId', 'name email phone bio skills achievements')
            .populate('joinRequests.user', 'name email phone bio skills achievements')
            .sort({ createdAt: -1 });
        const allRequests = activities.flatMap(activity => activity.joinRequests.map(request => ({
            activityId: activity._id,
            activityTitle: activity.title,
            user: request.user,
            requestedAt: request.requestedAt,
            message: request.message,
            status: request.status
        }))).filter(request => request.status === 'pending');
        res.json(allRequests);
    }
    catch (err) {
        console.error('Error in getPendingRequests:', err);
        res.status(500).json({
            message: 'Failed to fetch pending requests',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.getPendingRequests = getPendingRequests;
// @desc    Get ride details with passenger info
// @route   GET /api/profile/ride/:rideId
const getRideDetails = async (req, res) => {
    try {
        const ride = await Ride_1.default.findById(req.params.rideId)
            .populate('userId', 'name email phone bio skills achievements')
            .populate('passengers.userId', 'name email phone bio skills achievements');
        if (!ride) {
            res.status(404).json({ message: 'Ride not found' });
            return;
        }
        const isCreator = ride.userId.toString() === req.userId;
        const isPassenger = ride.passengers?.some((p) => p.userId.toString() === req.userId && p.status === 'approved');
        if (!isCreator && !isPassenger) {
            res.status(403).json({ message: 'Not authorized to view this ride' });
            return;
        }
        res.json(ride);
    }
    catch (err) {
        console.error('Error in getRideDetails:', err);
        res.status(500).json({
            message: 'Failed to fetch ride details',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.getRideDetails = getRideDetails;
// @desc    Cancel a ride (creator only)
// @route   PUT /api/profile/ride/:rideId/cancel
const cancelRide = async (req, res) => {
    try {
        const ride = await Ride_1.default.findById(req.params.rideId);
        if (!ride) {
            res.status(404).json({ message: 'Ride not found' });
            return;
        }
        if (ride.userId.toString() !== req.userId) {
            res.status(403).json({ message: 'Only ride creator can cancel' });
            return;
        }
        ride.status = 'cancelled';
        await ride.save();
        res.json({ message: 'Ride cancelled successfully', ride });
    }
    catch (err) {
        console.error('Error in cancelRide:', err);
        res.status(500).json({
            message: 'Failed to cancel ride',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.cancelRide = cancelRide;
// @desc    Leave a ride (passenger only)
// @route   PUT /api/profile/ride/:rideId/leave
const leaveRide = async (req, res) => {
    try {
        const ride = await Ride_1.default.findById(req.params.rideId);
        if (!ride) {
            res.status(404).json({ message: 'Ride not found' });
            return;
        }
        ride.passengers = ride.passengers?.filter((p) => p.userId.toString() !== req.userId);
        await ride.save();
        res.json({ message: 'Left ride successfully', ride });
    }
    catch (err) {
        console.error('Error in leaveRide:', err);
        res.status(500).json({
            message: 'Failed to leave ride',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.leaveRide = leaveRide;
