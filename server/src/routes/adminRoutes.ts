import { Router } from 'express';
import { getAllUsers, banUser, unbanUser, deleteUser, getAdminLogs } from '../controllers/adminController';
import { adminOnly } from '../middleware/adminMiddleware';

const router = Router();
router.use(adminOnly);
router.get('/users', getAllUsers);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);
router.delete('/users/:id', deleteUser);
router.get('/logs', getAdminLogs);
export default router;
