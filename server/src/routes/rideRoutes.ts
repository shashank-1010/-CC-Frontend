import { Router } from 'express';
import { getRides, createRide, getRide, updateRide, deleteRide } from '../controllers/rideController';
import { protect } from '../middleware/authMiddleware';

const router = Router();
router.get('/', getRides);
router.post('/', protect, createRide);
router.get('/:id', getRide);
router.put('/:id', protect, updateRide);
router.delete('/:id', protect, deleteRide);
export default router;
