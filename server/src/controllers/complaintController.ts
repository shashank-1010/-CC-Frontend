import { Request, Response } from 'express';
import Complaint from '../models/Complaint';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Creating complaint:', req.body);

    const complaint = await Complaint.create({
      ...req.body,
      userId: req.userId,
      status: 'pending'
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Your complaint has been submitted successfully! Admin will review it shortly.',
      complaint: populatedComplaint
    });

  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get all complaints (admin only)
// @route   GET /api/complaints
// @access  Private/Admin
export const getAllComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, category, priority } = req.query;
    
    let query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });

  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get user's complaints
// @route   GET /api/complaints/my-complaints
// @access  Private
export const getMyComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Fetching complaints for user:', req.userId);
    
    const complaints = await Complaint.find({ userId: req.userId })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    console.log(`Found ${complaints.length} complaints for user`);

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });

  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your complaints',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
export const getComplaintById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const complaint = await Complaint.findById(req.params.id)
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

  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Update complaint status (admin only)
// @route   PUT /api/complaints/:id/status
// @access  Private/Admin
export const updateComplaintStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, adminRemarks, priority } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
      return;
    }

    // Update fields
    if (status) complaint.status = status;
    if (adminRemarks) complaint.adminRemarks = adminRemarks;
    if (priority) complaint.priority = priority;
    
    // If resolved, set resolvedAt
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('userId', 'name email phone');

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint
    });

  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get complaint statistics (admin only)
// @route   GET /api/complaints/stats/dashboard
// @access  Private/Admin
export const getComplaintStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'pending' });
    const inProgress = await Complaint.countDocuments({ status: 'in-progress' });
    const resolved = await Complaint.countDocuments({ status: 'resolved' });
    const rejected = await Complaint.countDocuments({ status: 'rejected' });

    // Category wise
    const byCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Priority wise
    const byPriority = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent complaints (last 7 days)
    const last7Days = await Complaint.countDocuments({
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

  } catch (error) {
    console.error('Get complaint stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Delete complaint (admin only)
// @route   DELETE /api/complaints/:id
// @access  Private/Admin
export const deleteComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const complaint = await Complaint.findById(req.params.id);

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

  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};