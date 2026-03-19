import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  createSkill,
  getSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
  getUserSkills,
  getCategories
} from '../controllers/skillController';

const router = express.Router();

// Public routes
router.get('/', getSkills);
router.get('/categories', getCategories);
router.get('/:id', getSkillById);

// Protected routes
router.post('/', protect, createSkill);
router.get('/user/my-skills', protect, getUserSkills);
router.put('/:id', protect, updateSkill);
router.delete('/:id', protect, deleteSkill);

export default router;