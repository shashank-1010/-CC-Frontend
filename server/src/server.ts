import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db';
import { testSupabaseConnection } from './config/supabase'; // ✅ ADD THIS
import authRoutes from './routes/authRoutes';
import marketplaceRoutes from './routes/marketplaceRoutes'; // ✅ Updated
import notesRoutes from './routes/notesRoutes';
import rideRoutes from './routes/rideRoutes';
import studyGroupRoutes from './routes/studyGroupRoutes';
import activityRoutes from './routes/activityRoutes';
import pollRoutes from './routes/pollRoutes';
import adminRoutes from './routes/adminRoutes';
import profileRoutes from './routes/profileRoutes';
import uploadRoutes from './routes/uploadRoutes';
import chatRoutes from './routes/chatRoutes';
import lostItemRoutes from './routes/lostItemRoutes';
import complaintRoutes from './routes/complaintRoutes';
import skillRoutes from './routes/skillRoutes';

// Load env from server folder
dotenv.config({ path: path.join(__dirname, '.env') }); // ✅ CHANGE: ab server folder mein .env

const app = express();

// Connect to database
connectDB();

// Test Supabase connection
testSupabaseConnection(); // ✅ ADD THIS

// Create uploads directory (local backup)
const uploadsDir = path.resolve(__dirname, '../uploads');
console.log('📁 Uploads directory path:', uploadsDir);

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created successfully');
  } else {
    console.log('✅ Uploads directory already exists');
  }
  
  // Test write permission
  const testFile = path.join(uploadsDir, 'test.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✅ Uploads directory is writable');
  
} catch (error) {
  console.error('❌ Error with uploads directory:', error);
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (for local uploads backup)
app.use('/uploads', express.static(uploadsDir));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API Routes
console.log('📝 Registering routes...');
app.use('/api/complaints', complaintRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/lost-items', lostItemRoutes);
app.use('/api/marketplace', marketplaceRoutes); // ✅ Updated marketplace routes
app.use('/api/notes', notesRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/studygroups', studyGroupRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
console.log('✅ Routes registered');

// Test route to list all registered routes
app.get('/api/routes', (req, res) => {
  const routes = [
    '/api/auth',
    '/api/marketplace', 
    '/api/notes',
    '/api/rides',
    '/api/studygroups',
    '/api/activities',
    '/api/polls',
    '/api/admin',
    '/api/profile',
    '/api/upload'
  ];
  res.json({ 
    message: 'Available routes',
    routes: routes,
    uploadRouteExists: true,
    supabase: 'Connected'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working',
    uploadsDir: uploadsDir,
    exists: fs.existsSync(uploadsDir),
    supabase: 'Configured'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 Not Found:', req.originalUrl);
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🔗 Test upload at: http://localhost:${PORT}/api/upload/test`);
  console.log(`🔗 Check routes at: http://localhost:${PORT}/api/routes`);
  console.log(`🖼️ Marketplace upload: http://localhost:${PORT}/api/marketplace/upload`);
});

export default app;