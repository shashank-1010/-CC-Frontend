import { Request, Response } from 'express';
import Item from '../models/Item';
import AdminLog from '../models/AdminLog';
import { AuthRequest } from '../middleware/authMiddleware';

export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: Record<string, string> = {};
    if (req.query.status) filter.status = String(req.query.status);
    const items = await Item.find(filter).populate('userId', 'name email phone').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const createItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Item.create({ ...req.body, userId: req.userId });
    await item.populate('userId', 'name email phone');
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id).populate('userId', 'name email phone');
    if (!item) { res.status(404).json({ message: 'Item not found' }); return; }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const updateItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) { res.status(404).json({ message: 'Item not found' }); return; }
    if (String(item.userId) !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('userId', 'name email phone');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const deleteItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) { res.status(404).json({ message: 'Item not found' }); return; }
    if (String(item.userId) !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    if (req.userRole === 'admin') {
      await AdminLog.create({ adminId: req.userId, action: 'delete_post', targetId: String(item._id), targetType: 'item', details: `Deleted item: ${item.title}` });
    }
    await item.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
