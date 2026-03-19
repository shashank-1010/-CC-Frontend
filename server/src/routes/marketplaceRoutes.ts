import { Router } from 'express';
import { getItems, createItem, getItem, updateItem, deleteItem } from '../controllers/marketplaceController';
import { protect } from '../middleware/authMiddleware';

const router = Router();
router.get('/', getItems);
router.post('/', protect, createItem);
router.get('/:id', getItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);
export default router;
