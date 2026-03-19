"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComplaint = exports.getComplaintStats = exports.updateComplaintStatus = exports.getComplaintById = exports.getMyComplaints = exports.getAllComplaints = exports.createComplaint = void 0;
const Complaint_1 = __importDefault(require("../models/Complaint"));
// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res) => {
    try {
        console.log('Creating complaint:', req.body);
        const complaint = await Complaint_1.default.create({
            ...req.body,
            userId: req.userId,
            status: 'pending'
        });
        const populatedComplaint = await Complaint_1.default.findById(complaint._id)
            .populate('userId', 'name email phone');
        res.status(201).json({
            success: true,
            message: 'Your complaint has been submitted successfully! Admin will review it shortly.',
            complaint: populatedComplaint
        });
    }
    catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit complaint',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createComplaint = createComplaint;
// @desc    Get all complaints (admin only)
// @route   GET /api/complaints
// @access  Private/Admin
const getAllComplaints = async (req, res) => {
    try {
        const { status, category, priority } = req.query;
        let query = {};
        if (status)
            query.status = status;
        if (category)
            query.category = category;
        if (priority)
            query.priority = priority;
        const complaints = await Complaint_1.default.find(query)
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: complaints.length,
            complaints
        });
    }
    catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaints',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getAllComplaints = getAllComplaints;
// @desc    Get user's complaints
// @route   GET /api/complaints/my-complaints
// @access  Private
const getMyComplaints = async (req, res) => {
    try {
        console.log('Fetching complaints for user:', req.userId);
        const complaints = await Complaint_1.default.find({ userId: req.userId })
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });
        console.log(`Found ${complaints.length} complaints for user`);
        res.json({
            success: true,
            count: complaints.length,
            complaints
        });
    }
    catch (error) {
        console.error('Get my complaints error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your complaints',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getMyComplaints = getMyComplaints;
// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint_1.default.findById(req.params.id)
            .populate('userId', 'name email phone');
        if (!complaint) {
            res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
            return;
        }
        // Check if user is owner or admin
        if (String(complaint.userId._id) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to view this complaint'
            });
            return;
        }
        res.json({
            success: true,
            complaint
        });
    }
    catch (error) {
        console.error('Get complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getComplaintById = getComplaintById;
// @desc    Update complaint status (admin only)
// @route   PUT /api/complaints/:id/status
// @access  Private/Admin
const updateComplaintStatus = async (req, res) => {
    try {
        const { status, adminRemarks, priority } = req.body;
        const complaint = await Complaint_1.default.findById(req.params.id);
        if (!complaint) {
            res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
            return;
        }
        // Update fields
        if (status)
            complaint.status = status;
        if (adminRemarks)
            complaint.adminRemarks = adminRemarks;
        if (priority)
            complaint.priority = priority;
        // If resolved, set resolvedAt
        if (status === 'resolved') {
            complaint.resolvedAt = new Date();
        }
        await complaint.save();
        const updatedComplaint = await Complaint_1.default.findById(complaint._id)
            .populate('userId', 'name email phone');
        res.json({
            success: true,
            message: 'Complaint status updated successfully',
            complaint: updatedComplaint
        });
    }
    catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update complaint',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateComplaintStatus = updateComplaintStatus;
// @desc    Get complaint statistics (admin only)
// @route   GET /api/complaints/stats/dashboard
// @access  Private/Admin
const getComplaintStats = async (req, res) => {
    try {
        const total = await Complaint_1.default.countDocuments();
        const pending = await Complaint_1.default.countDocuments({ status: 'pending' });
        const inProgress = await Complaint_1.default.countDocuments({ status: 'in-progress' });
        const resolved = await Complaint_1.default.countDocuments({ status: 'resolved' });
        const rejected = await Complaint_1.default.countDocuments({ status: 'rejected' });
        // Category wise
        const byCategory = await Complaint_1.default.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);
        // Priority wise
        const byPriority = await Complaint_1.default.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);
        // Recent complaints (last 7 days)
        const last7Days = await Complaint_1.default.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        res.json({
            success: true,
            stats: {
                total,
                pending,
                inProgress,
                resolved,
                rejected,
                byCategory,
                byPriority,
                last7Days
            }
        });
    }
    catch (error) {
        console.error('Get complaint stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint statistics',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getComplaintStats = getComplaintStats;
// @desc    Delete complaint (admin only)
// @route   DELETE /api/complaints/:id
// @access  Private/Admin
const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint_1.default.findById(req.params.id);
        if (!complaint) {
            res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
            return;
        }
        await complaint.deleteOne();
        res.json({
            success: true,
            message: 'Complaint deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete complaint',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deleteComplaint = deleteComplaint;
