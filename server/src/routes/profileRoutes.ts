import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getMyItems,
  getMyNotes,
  getMyRides,
  getMyStudyGroups,
  getMySkills,
  getMyActivities,
  getMyLostItems,
  getJoinedActivities,
  getPendingRequests
} from '../controllers/profileController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All profile routes are protected
router.use(protect);

// Main profile routes
router.get('/', getProfile);
router.put('/', updateProfile);

// User's content routes
router.get('/items', getMyItems);
router.get('/notes', getMyNotes);
router.get('/rides', getMyRides);
router.get('/studygroups', getMyStudyGroups);
router.get('/activities', getMyActivities);
router.get('/lost-items', getMyLostItems);
router.get('/skills', getMySkills);   
router.get('/joined-activities', getJoinedActivities);
router.get('/pending-requests', getPendingRequests);

export default router;