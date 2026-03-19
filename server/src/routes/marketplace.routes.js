import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';
import {
  uploadImage,
  createItem,
  getItems,
  getItemById,
  searchItems,
  updateItem,
  deleteItem,
  getUserItems
} from '../controllers/marketplace.controller.js';

const router = express.Router();

// Multer configuration for file upload
const upload = multer({
  storage: multer.memoryStorage(), // Memory storage (buffer)
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Sirf images allow karo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Sirf images allowed hain!'), false);
    }
  }
});

// 🔓 Public Routes (No login required)
router.get('/', getItems);
router.get('/search', searchItems);
router.get('/:id', getItemById);

// 🔒 Protected Routes (Login required)
router.post(
  '/upload', 
  authMiddleware, 
  upload.single('image'), 
  uploadImage
);

router.post(
  '/', 
  authMiddleware, 
  createItem
);

router.get(
  '/user/items', 
  authMiddleware, 
  getUserItems
);

router.put(
  '/:id', 
  authMiddleware, 
  updateItem
);

router.delete(
  '/:id', 
  authMiddleware, 
  deleteItem
);

export default router;