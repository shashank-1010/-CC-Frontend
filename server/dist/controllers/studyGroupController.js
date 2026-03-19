"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMember = exports.leaveStudyGroup = exports.joinStudyGroup = exports.deleteStudyGroup = exports.updateStudyGroup = exports.createStudyGroup = exports.getStudyGroup = exports.getStudyGroups = void 0;
const StudyGroup_1 = __importDefault(require("../models/StudyGroup"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Get all study groups
// @route   GET /api/studygroups
const getStudyGroups = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status)
            filter.status = String(req.query.status);
        const groups = await StudyGroup_1.default.find(filter)
            .populate('userId', 'name email phone')
            .populate('members', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(groups);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.getStudyGroups = getStudyGroups;
// @desc    Get single study group
// @route   GET /api/studygroups/:id
const getStudyGroup = async (req, res) => {
    try {
        const group = await StudyGroup_1.default.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('members', 'name email phone');
        if (!group) {
            res.status(404).json({ message: 'Study group not found' });
            return;
        }
        res.json(group);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.getStudyGroup = getStudyGroup;
// @desc    Create study group
// @route   POST /api/studygroups
const createStudyGroup = async (req, res) => {
    try {
        // Get user's phone number
        const user = await User_1.default.findById(req.userId);
        const groupData = {
            ...req.body,
            userId: req.userId,
            members: [req.userId] // Creator automatically joins
        };
        const group = await StudyGroup_1.default.create(groupData);
        await group.populate('userId', 'name email phone');
        await group.populate('members', 'name email phone');
        res.status(201).json(group);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.createStudyGroup = createStudyGroup;
// @desc    Update study group
// @route   PUT /api/studygroups/:id
const updateStudyGroup = async (req, res) => {
    try {
        const group = await StudyGroup_1.default.findById(req.params.id);
        if (!group) {
            res.status(404).json({ message: 'Study group not found' });
            return;
        }
        // Check if user is creator or admin
        if (String(group.userId) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const updated = await StudyGroup_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('userId', 'name email phone')
            .populate('members', 'name email phone');
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.updateStudyGroup = updateStudyGroup;
// @desc    Delete study group
// @route   DELETE /api/studygroups/:id
const deleteStudyGroup = async (req, res) => {
    try {
        const group = await StudyGroup_1.default.findById(req.params.id);
        if (!group) {
            res.status(404).json({ message: 'Study group not found' });
            return;
        }
        // Check if user is creator or admin
        if (String(group.userId) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        await group.deleteOne();
        res.json({ message: 'Study group deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.deleteStudyGroup = deleteStudyGroup;
// @desc    Join study group
// @route   POST /api/studygroups/:id/join
const joinStudyGroup = async (req, res) => {
    try {
        const group = await StudyGroup_1.default.findById(req.params.id);
        if (!group) {
            res.status(404).json({ message: 'Study group not found' });
            return;
        }
        // Check if group is open
        if (group.status !== 'open') {
            res.status(400).json({ message: 'Group is not open for joining' });
            return;
        }
        // Check if group is full
        if (group.members.length >= group.membersLimit) {
            res.status(400).json({ message: 'Group is full' });
            return;
        }
        // Check if user is already a member
        if (group.members.includes(req.userId)) {
            res.status(400).json({ message: 'Already a member' });
            return;
        }
        // Add user to members
        group.members.push(req.userId);
        await group.save();
        const updatedGroup = await StudyGroup_1.default.findById(group._id)
            .populate('userId', 'name email phone')
            .populate('members', 'name email phone');
        res.json({
            message: 'Successfully joined the group',
            group: updatedGroup
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.joinStudyGroup = joinStudyGroup;
// @desc    Leave study group
// @route   POST /api/studygroups/:id/leave
const leaveStudyGroup = async (req, res) => {
    try {
        const group = await StudyGroup_1.default.findById(req.params.id);
        if (!group) {
            res.status(404).json({ message: 'Study group not found' });
            return;
        }
        // Check if user is the creator
        if (String(group.userId) === req.userId) {
            res.status(400).json({
                message: 'Creator cannot leave the group. Delete the group instead.'
            });
            return;
        }
        // Check if user is a member
        if (!group.members.includes(req.userId)) {
            res.status(400).json({ message: 'Not a member' });
            return;
        }
        // Remove user from members
        group.members = group.members.filter(id => id.toString() !== req.userId);
        await group.save();
        const updatedGroup = await StudyGroup_1.default.findById(group._id)
            .populate('userId', 'name email phone')
            .populate('members', 'name email phone');
        res.json({
            message: 'Successfully left the group',
            group: updatedGroup
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.leaveStudyGroup = leaveStudyGroup;
// @desc    Remove member from group (creator or admin only)
// @route   DELETE /api/studygroups/:id/members/:memberId
const removeMember = async (req, res) => {
    try {
        const group = await StudyGroup_1.default.findById(req.params.id);
        if (!group) {
            res.status(404).json({ message: 'Study group not found' });
            return;
        }
        // Check if user is creator or admin
        if (String(group.userId) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({ message: 'Only creator or admin can remove members' });
            return;
        }
        const memberId = req.params.memberId;
        // Check if trying to remove creator
        if (String(group.userId) === memberId) {
            res.status(400).json({ message: 'Cannot remove the creator' });
            return;
        }
        // Check if member exists in group
        if (!group.members.includes(memberId)) {
            res.status(400).json({ message: 'Member not found in group' });
            return;
        }
        // Remove member
        group.members = group.members.filter(id => id.toString() !== memberId);
        await group.save();
        const updatedGroup = await StudyGroup_1.default.findById(group._id)
            .populate('userId', 'name email phone')
            .populate('members', 'name email phone');
        res.json({
            message: 'Member removed successfully',
            group: updatedGroup
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.removeMember = removeMember;
