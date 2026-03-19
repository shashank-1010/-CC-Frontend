import { Request, Response } from 'express';
import Note from '../models/Note';
import AdminLog from '../models/AdminLog';
import { AuthRequest } from '../middleware/authMiddleware';

export const getNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: Record<string, string> = {};
    if (req.query.status) filter.status = String(req.query.status);
    const notes = await Note.find(filter).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await Note.create({ ...req.body, userId: req.userId });
    await note.populate('userId', 'name email');
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id).populate('userId', 'name email');
    if (!note) { res.status(404).json({ message: 'Note not found' }); return; }
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) { res.status(404).json({ message: 'Note not found' }); return; }
    if (String(note.userId) !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    const updated = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('userId', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) { res.status(404).json({ message: 'Note not found' }); return; }
    if (String(note.userId) !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    if (req.userRole === 'admin') {
      await AdminLog.create({ adminId: req.userId, action: 'delete_post', targetId: String(note._id), targetType: 'note', details: `Deleted note: ${note.title}` });
    }
    await note.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
