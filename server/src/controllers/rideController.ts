import { Request, Response } from 'express';
import Ride from '../models/Ride';
import AdminLog from '../models/AdminLog';
import { AuthRequest } from '../middleware/authMiddleware';

export const getRides = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: Record<string, string> = {};
    if (req.query.status) filter.status = String(req.query.status);
    const rides = await Ride.find(filter).populate('userId', 'name phone').sort({ createdAt: -1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const createRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ride = await Ride.create({ ...req.body, userId: req.userId });
    await ride.populate('userId', 'name phone');
    res.status(201).json(ride);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getRide = async (req: Request, res: Response): Promise<void> => {
  try {
    const ride = await Ride.findById(req.params.id).populate('userId', 'name phone');
    if (!ride) { res.status(404).json({ message: 'Ride not found' }); return; }
    res.json(ride);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const updateRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) { res.status(404).json({ message: 'Ride not found' }); return; }
    if (String(ride.userId) !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    const updated = await Ride.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('userId', 'name phone');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const deleteRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) { res.status(404).json({ message: 'Ride not found' }); return; }
    if (String(ride.userId) !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    if (req.userRole === 'admin') {
      await AdminLog.create({ adminId: req.userId, action: 'delete_post', targetId: String(ride._id), targetType: 'ride', details: `Deleted ride: ${ride.from} → ${ride.to}` });
    }
    await ride.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
