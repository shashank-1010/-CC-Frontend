import { Request, Response } from 'express';
import ChatMessage from '../models/ChatMessage';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all chat messages
// @route   GET /api/chat/messages
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const messages = await ChatMessage.find()
      .sort({ createdAt: 1 }); // Oldest first for chat flow
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Send a chat message
// @route   POST /api/chat/messages
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    
    const chatMessage = await ChatMessage.create({
      message,
      userId: req.userId,
      isAnonymous: true
    });

    res.status(201).json(chatMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete all messages (admin only)
// @route   DELETE /api/chat/messages/all
export const deleteAllMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await ChatMessage.deleteMany({});
    res.json({ message: 'All messages deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete a specific message (admin only)
// @route   DELETE /api/chat/messages/:messageId
export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const message = await ChatMessage.findById(req.params.messageId);
    
    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};