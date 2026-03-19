import { Request, Response } from 'express';
import StudyGroup from '../models/StudyGroup';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all study groups
// @route   GET /api/studygroups
export const getStudyGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: Record<string, string> = {};
    if (req.query.status) filter.status = String(req.query.status);
    
    const groups = await StudyGroup.find(filter)
      .populate('userId', 'name email phone')
      .populate('members', 'name email phone')
      .sort({ createdAt: -1 });
      
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// @desc    Get single study group
// @route   GET /api/studygroups/:id
export const getStudyGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('members', 'name email phone');
      
    if (!group) { 
      res.status(404).json({ message: 'Study group not found' }); 
      return; 
    }
    
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// @desc    Create study group
// @route   POST /api/studygroups
export const createStudyGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get user's phone number
    const user = await User.findById(req.userId);
    
    const groupData = {
      ...req.body,
      userId: req.userId,
      members: [req.userId] // Creator automatically joins
    };
    
    const group = await StudyGroup.create(groupData);
    
    await group.populate('userId', 'name email phone');
    await group.populate('members', 'name email phone');
    
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// @desc    Update study group
// @route   PUT /api/studygroups/:id
export const updateStudyGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) { 
      res.status(404).json({ message: 'Study group not found' }); 
      return; 
    }
    
    // Check if user is creator or admin
    if (String(group.userId) !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Forbidden' }); 
      return;
    }
    
    const updated = await StudyGroup.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    )
    .populate('userId', 'name email phone')
    .populate('members', 'name email phone');
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// @desc    Delete study group
// @route   DELETE /api/studygroups/:id
export const deleteStudyGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
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
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// @desc    Join study group
// @route   POST /api/studygroups/:id/join
export const joinStudyGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
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
    
    const updatedGroup = await StudyGroup.findById(group._id)
      .populate('userId', 'name email phone')
      .populate('members', 'name email phone');
    
    res.json({ 
      message: 'Successfully joined the group',
      group: updatedGroup 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// @desc    Leave study group
// @route   POST /api/studygroups/:id/leave
export const leaveStudyGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
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
    group.members = group.members.filter(
      id => id.toString() !== req.userId
    );
    await group.save();
    
    const updatedGroup = await StudyGroup.findById(group._id)
      .populate('userId', 'name email phone')
      .populate('members', 'name email phone');
    
    res.json({ 
      message: 'Successfully left the group',
      group: updatedGroup 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// @desc    Remove member from group (creator or admin only)
// @route   DELETE /api/studygroups/:id/members/:memberId
export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
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
    
    const updatedGroup = await StudyGroup.findById(group._id)
      .populate('userId', 'name email phone')
      .populate('members', 'name email phone');
    
    res.json({ 
      message: 'Member removed successfully',
      group: updatedGroup 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};