import { Router } from 'express';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  requestToJoin,
  acceptRequest,
  declineRequest,
  getParticipants,
  leaveActivity,
  getUserProfile,
  removeParticipant  // 👈 YEH IMPORT KARO
} from '../controllers/activityController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getActivities);
router.get('/users/:id/profile', getUserProfile); // Get user profile

// Protected routes
router.post('/', protect, createActivity);
router.put('/:id', protect, updateActivity);
router.delete('/:id', protect, deleteActivity);

// Join request routes
router.post('/:id/request', protect, requestToJoin);
router.post('/:id/accept/:userId', protect, acceptRequest);
router.post('/:id/decline/:userId', protect, declineRequest);
router.get('/:id/participants', protect, getParticipants);
router.delete('/:id/leave', protect, leaveActivity);

// 👈 REMOVE PARTICIPANT ROUTE - YEH ADD KARO
router.delete('/:id/participants/:userId', protect, removeParticipant);

export default router;