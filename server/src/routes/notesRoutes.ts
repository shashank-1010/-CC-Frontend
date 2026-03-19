import { Router } from 'express';
import { getNotes, createNote, getNote, updateNote, deleteNote } from '../controllers/notesController';
import { protect } from '../middleware/authMiddleware';

const router = Router();
router.get('/', getNotes);
router.post('/', protect, createNote);
router.get('/:id', getNote);
router.put('/:id', protect, updateNote);
router.delete('/:id', protect, deleteNote);
export default router;
