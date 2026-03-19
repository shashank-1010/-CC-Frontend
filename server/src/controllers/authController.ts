import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const signToken = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'campusconnectsecret', { expiresIn: '7d' });

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: passwordHash, phone, role: 'user' });
    const token = signToken(String(user._id), user.role);
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, isBanned: user.isBanned, createdAt: user.createdAt } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Admin hardcoded check
    if (email === 'shashankadmin@gmail.com' && password === 'shashan8115067311admin') {
      let admin = await User.findOne({ email });
      if (!admin) {
        const hash = await bcrypt.hash(password, 10);
        admin = await User.create({ name: 'Admin', email, password: hash, role: 'admin' });
      }
      const token = signToken(String(admin._id), admin.role);
      res.json({ token, user: { _id: admin._id, name: admin.name, email: admin.email, phone: admin.phone, role: admin.role, isBanned: admin.isBanned, createdAt: admin.createdAt } });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    if (user.isBanned) {
      res.status(403).json({ message: 'Account is banned' });
      return;
    }
    const token = signToken(String(user._id), user.role);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, isBanned: user.isBanned, createdAt: user.createdAt } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getMe = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
