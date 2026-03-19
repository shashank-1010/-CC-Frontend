import { Router } from 'express';
import { 
  getStudyGroups, 
  createStudyGroup, 
  getStudyGroup, 
  updateStudyGroup, 
  deleteStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  removeMember
} from '../controllers/studyGroupController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getStudyGroups);
router.get('/:id', getStudyGroup);

// Protected routes
router.post('/', protect, createStudyGroup);
router.put('/:id', protect, updateStudyGroup);
router.delete('/:id', protect, deleteStudyGroup);
router.post('/:id/join', protect, joinStudyGroup);
router.post('/:id/leave', protect, leaveStudyGroup);
router.delete('/:id/members/:memberId', protect, removeMember);

export default router;