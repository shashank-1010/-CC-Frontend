import { Router } from 'express';
import {
  getLostItems,
  getLostItemById,
  createLostItem,
  updateLostItem,
  deleteLostItem,
  resolveItem
} from '../controllers/lostItemController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getLostItems);
router.get('/:id', getLostItemById);

// Protected routes
router.post('/', protect, createLostItem);
router.put('/:id', protect, updateLostItem);
router.delete('/:id', protect, deleteLostItem);
router.put('/:id/resolve', protect, resolveItem);

export default router;