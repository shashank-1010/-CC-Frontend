import { Router } from 'express';
import {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintStats // Add this import
} from '../controllers/complaintController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// All routes are protected
router.use(protect);

// User routes
router.post('/', createComplaint);
router.get('/my-complaints', getMyComplaints);
router.get('/:id', getComplaintById);

// Admin only routes
router.get('/', adminOnly, getAllComplaints);
router.get('/stats/dashboard', adminOnly, getComplaintStats); // Add this line
router.put('/:id/status', adminOnly, updateComplaintStatus);
router.delete('/:id', adminOnly, deleteComplaint);

export default router;