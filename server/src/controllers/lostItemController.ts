import { Request, Response } from 'express';
import LostItem from '../models/LostItem';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all lost/found items
// @route   GET /api/lost-items
export const getLostItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status, search } = req.query;
    
    let query: any = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { itemType: { $regex: search, $options: 'i' } }
      ];
    }
    
    const items = await LostItem.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(items);
  } catch (error) {
    console.error('Get lost items error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Get single lost/found item
// @route   GET /api/lost-items/:id
export const getLostItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await LostItem.findById(req.params.id)
      .populate('userId', 'name email phone');
    
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    res.json(item);
  } catch (error) {
    console.error('Get lost item error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Create lost/found item
// @route   POST /api/lost-items
export const createLostItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Create lost item payload:', req.body);
    
    const item = await LostItem.create({
      ...req.body,
      userId: req.userId
    });
    
    const populatedItem = await LostItem.findById(item._id)
      .populate('userId', 'name email phone');
    
    res.status(201).json(populatedItem);
  } catch (error) {
    console.error('Create lost item error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Update lost/found item
// @route   PUT /api/lost-items/:id
export const updateLostItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await LostItem.findById(req.params.id);
    
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    // Check if user is creator or admin
    if (String(item.userId) !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    
    const updated = await LostItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');
    
    res.json(updated);
  } catch (error) {
    console.error('Update lost item error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete lost/found item
// @route   DELETE /api/lost-items/:id
export const deleteLostItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await LostItem.findById(req.params.id);
    
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    // Check if user is creator or admin
    if (String(item.userId) !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    
    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete lost item error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Mark item as resolved
// @route   PUT /api/lost-items/:id/resolve
export const resolveItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await LostItem.findById(req.params.id);
    
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    // Check if user is creator or admin
    if (String(item.userId) !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    
    item.status = 'resolved';
    await item.save();
    
    const updated = await LostItem.findById(item._id)
      .populate('userId', 'name email phone');
    
    res.json(updated);
  } catch (error) {
    console.error('Resolve item error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};