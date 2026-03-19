import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Item from '../models/Item';
import Note from '../models/Note';
import Ride from '../models/Ride';
import LostItem from '../models/LostItem';
import StudyGroup from '../models/StudyGroup';
import Skill from '../models/Skill';
import Activity from '../models/Activity';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get user profile
// @route   GET /api/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
      .select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my skills
// @route   GET /api/profile/skills
export const getMySkills = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Fetching skills for user:', req.userId);
    
    const skills = await Skill.find({ 
      $or: [
        { userId: req.userId },
        { 'userId._id': req.userId }
      ]
    })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });
    
    console.log(`Found ${skills.length} skills`);
    res.json(skills);
  } catch (err) {
    console.error('Error in getMySkills:', err);
    res.status(500).json({ 
      message: 'Failed to fetch skills', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// @desc    Update user profile (bio, skills, achievements)
// @route   PUT /api/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, bio, skills, achievements } = req.body;

    const user = await User.findById(req.userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) 
        ? skills 
        : skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    }
    if (achievements !== undefined) {
      user.achievements = Array.isArray(achievements) 
        ? achievements 
        : achievements.split(',').map((a: string) => a.trim()).filter((a: string) => a);
    }

    await user.save();

    const updatedUser = await User.findById(req.userId).select('-password');
    res.json(updatedUser);

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my marketplace items
// @route   GET /api/profile/items
export const getMyItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Item.find({ 
      $or: [
        { userId: req.userId },
        { 'userId.id': req.userId }
      ]
    })
    .populate('userId', 'name email phone bio skills achievements')
    .sort({ createdAt: -1 });
    
    res.json(items);
  } catch (err) {
    console.error('Error in getMyItems:', err);
    res.status(500).json({ 
      message: 'Failed to fetch items', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// @desc    Get my notes
// @route   GET /api/profile/notes
export const getMyNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notes = await Note.find({ 
      $or: [
        { userId: req.userId },
        { 'userId.id': req.userId }
      ]
    })
    .populate('userId', 'name email phone bio skills achievements')
    .sort({ createdAt: -1 });
    
    res.json(notes);
  } catch (err) {
    console.error('Error in getMyNotes:', err);
    res.status(500).json({ 
      message: 'Failed to fetch notes', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// @desc    Get my rides (both created and joined)
// @route   GET /api/profile/rides
export const getMyRides = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Fetching rides for user:', req.userId);
    
    const rides = await Ride.find({
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
        rideObj.passengers = rideObj.passengers.filter((p: any) => p.status === 'approved');
      }
      
      return rideObj;
    });
    
    res.json(transformedRides);
  } catch (err) {
    console.error('Error in getMyRides:', err);
    res.status(500).json({ 
      message: 'Failed to fetch rides', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// @desc    Get my study groups (both created and joined)
// @route   GET /api/profile/studygroups
export const getMyStudyGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Fetching study groups for user:', req.userId);
    
    // ✅ FIX: Use correct schema structure - members is array of ObjectIds
    const groups = await StudyGroup.find({
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
    
  } catch (err) {
    console.error('Error in getMyStudyGroups:', err);
    res.status(500).json({ 
      message: 'Failed to fetch study groups', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// @desc    Get my activities (created by user)
// @route   GET /api/profile/activities
export const getMyActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activities = await Activity.find({ 
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
  } catch (err) {
    console.error('Error in getMyActivities:', err);
    res.status(500).json({ 
      message: 'Failed to fetch activities', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// @desc    Get activities I've joined
// @route   GET /api/profile/joined-activities
export const getJoinedActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activities = await Activity.find({
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
  } catch (err) {
    console.error('Error in getJoinedActivities:', err);
    res.status(500).json({ 
      message: 'Failed to fetch joined activities', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// @desc    Get my lost & found items
// @route   GET /api/profile/lost-items
export const getMyLostItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Fetching lost items for user:', req.userId);
    
    const items = await LostItem.find({ 
      $or: [
        { userId: req.userId },
        { 'userId.id': req.userId }
      ]
    })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });
    
    console.log(`Found ${items.length} lost items`);
    res.json(items);
  } catch (err) {
    console.error('Error in getMyLostItems:', err);
    res.status(500).json({ 
      message: 'Failed to fetch lost items', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// @desc    Get pending join requests (for activities I created)
// @route   GET /api/profile/pending-requests
export const getPendingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activities = await Activity.find({
      $or: [
        { userId: req.userId },
        { 'userId.id': req.userId }
      ],
      'joinRequests.0': { $exists: true }
    })
    .populate('userId', 'name email phone bio skills achievements')
    .populate('joinRequests.user', 'name email phone bio skills achievements')
    .sort({ createdAt: -1 });
    
    // Define type for join request
    type JoinRequest = {
      user: any;
      requestedAt: Date;
      message?: string;
      status: 'pending' | 'approved' | 'rejected';
    };
    
    const allRequests = activities.flatMap(activity => 
      (activity.joinRequests as JoinRequest[]).map(request => ({
        activityId: activity._id,
        activityTitle: activity.title,
        user: request.user,
        requestedAt: request.requestedAt,
        message: request.message,
        status: request.status
      }))
    ).filter(request => request.status === 'pending');
    
    res.json(allRequests);
  } catch (err) {
    console.error('Error in getPendingRequests:', err);
    res.status(500).json({ 
      message: 'Failed to fetch pending requests', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// @desc    Get ride details with passenger info
// @route   GET /api/profile/ride/:rideId
export const getRideDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate('userId', 'name email phone bio skills achievements')
      .populate('passengers.userId', 'name email phone bio skills achievements');
    
    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }
    
    const isCreator = ride.userId.toString() === req.userId;
    const isPassenger = ride.passengers?.some(
      (p: any) => p.userId.toString() === req.userId && p.status === 'approved'
    );
    
    if (!isCreator && !isPassenger) {
      res.status(403).json({ message: 'Not authorized to view this ride' });
      return;
    }
    
    res.json(ride);
  } catch (err) {
    console.error('Error in getRideDetails:', err);
    res.status(500).json({ 
      message: 'Failed to fetch ride details', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// @desc    Cancel a ride (creator only)
// @route   PUT /api/profile/ride/:rideId/cancel
export const cancelRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    
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
  } catch (err) {
    console.error('Error in cancelRide:', err);
    res.status(500).json({ 
      message: 'Failed to cancel ride', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// @desc    Leave a ride (passenger only)
// @route   PUT /api/profile/ride/:rideId/leave
export const leaveRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }
    
    ride.passengers = ride.passengers?.filter(
      (p: any) => p.userId.toString() !== req.userId
    );
    
    await ride.save();
    
    res.json({ message: 'Left ride successfully', ride });
  } catch (err) {
    console.error('Error in leaveRide:', err);
    res.status(500).json({ 
      message: 'Failed to leave ride', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};