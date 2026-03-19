import { Router } from 'express';
import {
  getPolls,
  createPoll,
  votePoll,
  addComment,
  deletePoll,
  deleteAllComments,
  deleteComment,
  deleteAllPolls
} from '../controllers/pollController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getPolls);

// Protected routes (any logged in user)
router.post('/', protect, createPoll);
router.post('/:id/vote', protect, votePoll);
router.post('/:id/comment', protect, addComment);

// Admin only routes
router.delete('/:id', protect, adminOnly, deletePoll);
router.delete('/:id/comments', protect, adminOnly, deleteAllComments);
router.delete('/:id/comments/:commentId', protect, adminOnly, deleteComment);
router.delete('/all', protect, adminOnly, deleteAllPolls);

export default router;