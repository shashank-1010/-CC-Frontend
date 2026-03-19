"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Get absolute path for uploads directory
const uploadsDir = path_1.default.resolve(__dirname, '../../uploads');
console.log('📁 Upload routes - uploads directory:', uploadsDir);
// Ensure uploads directory exists
try {
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
        console.log('✅ Upload directory created');
    }
}
catch (error) {
    console.error('❌ Error creating upload directory:', error);
}
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const filename = `${uniqueSuffix}${ext}`;
        console.log('📝 Generated filename:', filename);
        cb(null, filename);
    }
});
// File filter
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'), false);
    }
};
// Configure multer
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});
// @desc    Upload image
// @route   POST /api/upload
// @access  Private
router.post('/', authMiddleware_1.protect, upload.single('image'), (req, res) => {
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
    }
    catch (error) {
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
    let files = [];
    try {
        if (fs_1.default.existsSync(uploadsDir)) {
            files = fs_1.default.readdirSync(uploadsDir);
        }
    }
    catch (error) {
        console.error('Error reading uploads directory:', error);
    }
    res.json({
        message: 'Upload route is working',
        uploadsDir: uploadsDir,
        baseUrl: baseUrl,
        exists: fs_1.default.existsSync(uploadsDir),
        fileCount: files.length,
        recentFiles: files.slice(-5)
    });
});
exports.default = router;
