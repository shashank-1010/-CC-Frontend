import { Response } from 'express';
import User from '../models/User';
import AdminLog from '../models/AdminLog';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true }).select('-password');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    await AdminLog.create({ adminId: req.userId, action: 'ban_user', targetId: String(user._id), targetType: 'user', details: `Banned user: ${user.email}` });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const unbanUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).select('-password');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    await AdminLog.create({ adminId: req.userId, action: 'unban_user', targetId: String(user._id), targetType: 'user', details: `Unbanned user: ${user.email}` });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    await AdminLog.create({ adminId: req.userId, action: 'delete_user', targetId: String(user._id), targetType: 'user', details: `Deleted user: ${user.email}` });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getAdminLogs = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await AdminLog.find().populate('adminId', 'name email').sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
