import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Get absolute path for uploads directory
const uploadsDir = path.resolve(__dirname, '../../uploads');
console.log('📁 Upload routes - uploads directory:', uploadsDir);

// Ensure uploads directory exists
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    console.log('✅ Upload directory created');
  }
} catch (error) {
  console.error('❌ Error creating upload directory:', error);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uniqueSuffix}${ext}`;
    console.log('📝 Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// @desc    Upload image
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create URL for the uploaded file
    const imageUrl = `/uploads/${req.file.filename}`;
    
    console.log('✅ File uploaded successfully:', {
      filename: req.file.filename,
      url: imageUrl,
      size: req.file.size
    });
    
    res.status(201).json({ 
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// @desc    Test route
// @route   GET /api/upload/test
// @access  Public
router.get('/test', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;
  
  let files: string[] = [];
  try {
    if (fs.existsSync(uploadsDir)) {
      files = fs.readdirSync(uploadsDir);
    }
  } catch (error) {
    console.error('Error reading uploads directory:', error);
  }
  
  res.json({ 
    message: 'Upload route is working',
    uploadsDir: uploadsDir,
    baseUrl: baseUrl,
    exists: fs.existsSync(uploadsDir),
    fileCount: files.length,
    recentFiles: files.slice(-5)
  });
});

export default router;