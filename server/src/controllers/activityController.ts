import { Request, Response } from 'express';
import Activity from '../models/Activity';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all activities
// @route   GET /api/activities
export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const activities = await Activity.find()
      .populate('userId', 'name email phone bio skills achievements')
      .populate('participants.user', 'name email phone bio skills achievements')
      .populate('joinRequests.user', 'name email phone bio skills achievements')
      .sort({ createdAt: -1 });
    
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Create activity
// @route   POST /api/activities
export const createActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Create activity payload:', req.body);
    
    // Validate based on activity type
    if (req.body.activityType === 'limited' && !req.body.maxParticipants) {
      res.status(400).json({ message: 'Max participants is required for limited activities' });
      return;
    }

    const activity = await Activity.create({
      title: req.body.title,
      description: req.body.description,
      requiredParticipants: req.body.requiredParticipants,
      deadline: req.body.deadline,
      contact: req.body.contact,
      whatsappLink: req.body.whatsappLink,
      location: req.body.location,
      activityType: req.body.activityType || 'whatsapp',
      maxParticipants: req.body.maxParticipants,
      status: req.body.status || 'open',
      userId: req.userId,
      participants: [],
      joinRequests: []
    });
    
    const populatedActivity = await Activity.findById(activity._id)
      .populate('userId', 'name email phone bio skills achievements');
      
    res.status(201).json(populatedActivity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
export const updateActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }
    
    if (String(activity.userId) !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    
    const updated = await Activity.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        requiredParticipants: req.body.requiredParticipants,
        deadline: req.body.deadline,
        contact: req.body.contact,
        whatsappLink: req.body.whatsappLink,
        location: req.body.location,
        activityType: req.body.activityType,
        maxParticipants: req.body.maxParticipants,
        status: req.body.status
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone bio skills achievements')
     .populate('participants.user', 'name email phone bio skills achievements')
     .populate('joinRequests.user', 'name email phone bio skills achievements');
    
    res.json(updated);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
export const deleteActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }
    
    if (String(activity.userId) !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    
    await activity.deleteOne();
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Request to join activity
// @route   POST /api/activities/:id/request
export const requestToJoin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    // Check if activity is open
    if (activity.status !== 'open') {
      res.status(400).json({ message: 'Activity is not open for joining' });
      return;
    }

    // Check if already requested
    const alreadyRequested = activity.joinRequests.some(
      request => String(request.user) === req.userId
    );
    
    if (alreadyRequested) {
      res.status(400).json({ message: 'Already requested to join' });
      return;
    }

    // Check if already a participant
    const alreadyParticipant = activity.participants.some(
      p => String(p.user) === req.userId && p.status === 'approved'
    );
    
    if (alreadyParticipant) {
      res.status(400).json({ message: 'Already a participant' });
      return;
    }

    // For WhatsApp activities, auto-approve
    if (activity.activityType === 'whatsapp') {
      activity.participants.push({
        user: req.userId as any,
        joinedAt: new Date(),
        status: 'approved'
      });
      
      await activity.save();
      
      const updated = await Activity.findById(activity._id)
        .populate('userId', 'name email phone bio skills achievements')
        .populate('participants.user', 'name email phone bio skills achievements')
        .populate('joinRequests.user', 'name email phone bio skills achievements');
      
      res.json({ 
        message: 'Successfully joined activity',
        activity: updated 
      });
      return;
    }

    // For limited activities, add to join requests
    activity.joinRequests.push({
      user: req.userId as any,
      requestedAt: new Date(),
      message: req.body.message || ''
    });

    await activity.save();

    const updated = await Activity.findById(activity._id)
      .populate('userId', 'name email phone bio skills achievements')
      .populate('participants.user', 'name email phone bio skills achievements')
      .populate('joinRequests.user', 'name email phone bio skills achievements');

    res.json({ 
      message: 'Join request sent successfully',
      activity: updated 
    });

  } catch (error) {
    console.error('Request to join error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Accept join request
// @route   POST /api/activities/:id/accept/:userId
export const acceptRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    // Check if user is creator
    if (String(activity.userId) !== req.userId) {
      res.status(403).json({ message: 'Only creator can accept requests' });
      return;
    }

    // Check if activity has reached max participants
    if (activity.activityType === 'limited' && activity.maxParticipants) {
      const approvedCount = activity.participants.filter(p => p.status === 'approved').length;
      if (approvedCount >= activity.maxParticipants) {
        res.status(400).json({ message: 'Activity has reached maximum participants' });
        return;
      }
    }

    // Find and remove from join requests
    const requestIndex = activity.joinRequests.findIndex(
      r => String(r.user) === req.params.userId
    );

    if (requestIndex === -1) {
      res.status(404).json({ message: 'Join request not found' });
      return;
    }

    const request = activity.joinRequests[requestIndex];
    activity.joinRequests.splice(requestIndex, 1);

    // Add to participants
    activity.participants.push({
      user: request.user,
      joinedAt: new Date(),
      status: 'approved'
    });

    await activity.save();

    const updated = await Activity.findById(activity._id)
      .populate('userId', 'name email phone bio skills achievements')
      .populate('participants.user', 'name email phone bio skills achievements')
      .populate('joinRequests.user', 'name email phone bio skills achievements');

    res.json({ 
      message: 'Request accepted successfully',
      activity: updated 
    });

  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Decline join request
// @route   POST /api/activities/:id/decline/:userId
export const declineRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    // Check if user is creator
    if (String(activity.userId) !== req.userId) {
      res.status(403).json({ message: 'Only creator can decline requests' });
      return;
    }

    // Remove from join requests
    activity.joinRequests = activity.joinRequests.filter(
      r => String(r.user) !== req.params.userId
    );

    await activity.save();

    const updated = await Activity.findById(activity._id)
      .populate('userId', 'name email phone bio skills achievements')
      .populate('participants.user', 'name email phone bio skills achievements')
      .populate('joinRequests.user', 'name email phone bio skills achievements');

    res.json({ 
      message: 'Request declined',
      activity: updated 
    });

  } catch (error) {
    console.error('Decline request error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Get activity participants
// @route   GET /api/activities/:id/participants
export const getParticipants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('participants.user', 'name email phone bio skills achievements')
      .populate('joinRequests.user', 'name email phone bio skills achievements');

    if (!activity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    // Calculate counts
    const approvedCount = activity.participants?.filter(p => p.status === 'approved').length || 0;
    const pendingCount = activity.joinRequests?.length || 0;
    
    let availableSpots = null;
    let isFull = false;
    
    if (activity.activityType === 'limited' && activity.maxParticipants) {
      availableSpots = activity.maxParticipants - approvedCount;
      isFull = approvedCount >= activity.maxParticipants;
    }

    res.json({
      participants: activity.participants,
      joinRequests: activity.joinRequests,
      approvedCount,
      pendingCount,
      availableSpots,
      isFull,
      activityType: activity.activityType,
      maxParticipants: activity.maxParticipants
    });

  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Leave activity
// @route   DELETE /api/activities/:id/leave
export const leaveActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    // Remove from participants
    activity.participants = activity.participants.filter(
      p => String(p.user) !== req.userId
    );

    await activity.save();

    const updated = await Activity.findById(activity._id)
      .populate('userId', 'name email phone bio skills achievements')
      .populate('participants.user', 'name email phone bio skills achievements');

    res.json({ 
      message: 'Left activity successfully',
      activity: updated 
    });

  } catch (error) {
    console.error('Leave activity error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add this function to your activityController.ts file

// @desc    Remove participant from activity
// @route   DELETE /api/activities/:id/participants/:userId
export const removeParticipant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      res.status(404).json({ 
        success: false, 
        error: 'Activity not found' 
      });
      return;
    }
    
    // Check if user is creator or admin
    const isCreator = activity.userId.toString() === req.userId;
    const isAdmin = req.userRole === 'admin';
    
    if (!isCreator && !isAdmin) {
      res.status(403).json({ 
        success: false, 
        error: 'Not authorized to remove participants' 
      });
      return;
    }
    
    // Check if participant exists
    const participantExists = activity.participants?.some(
      (p: any) => p.user.toString() === req.params.userId && p.status === 'approved'
    );
    
    if (!participantExists) {
      res.status(404).json({ 
        success: false, 
        error: 'Participant not found' 
      });
      return;
    }
    
    // Remove participant
    activity.participants = activity.participants?.filter(
      (p: any) => !(p.user.toString() === req.params.userId && p.status === 'approved')
    );
    
    await activity.save();
    
    // Populate user data before sending response
    await activity.populate('userId', 'name email phone');
    await activity.populate('participants.user', 'name email phone');
    
    res.json({
      success: true,
      message: 'Participant removed successfully',
      activity
    });
    
  } catch (error) {
    console.error('❌ Remove participant error:', error);
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id/profile
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email phone bio skills achievements createdAt role');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};