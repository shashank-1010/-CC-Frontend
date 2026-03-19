import { Router } from 'express';
import {
  getMessages,
  sendMessage,
  deleteAllMessages,
  deleteMessage
} from '../controllers/chatController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Public routes (anyone can read)
router.get('/messages', getMessages);

// Protected routes (any logged in user)
router.post('/messages', protect, sendMessage);

// Admin only routes
router.delete('/messages/all', protect, adminOnly, deleteAllMessages);
router.delete('/messages/:messageId', protect, adminOnly, deleteMessage);

export default router;