"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = __importDefault(require("./config/db"));
const supabase_1 = require("./config/supabase"); // ✅ ADD THIS
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const marketplaceRoutes_1 = __importDefault(require("./routes/marketplaceRoutes")); // ✅ Updated
const notesRoutes_1 = __importDefault(require("./routes/notesRoutes"));
const rideRoutes_1 = __importDefault(require("./routes/rideRoutes"));
const studyGroupRoutes_1 = __importDefault(require("./routes/studyGroupRoutes"));
const activityRoutes_1 = __importDefault(require("./routes/activityRoutes"));
const pollRoutes_1 = __importDefault(require("./routes/pollRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const lostItemRoutes_1 = __importDefault(require("./routes/lostItemRoutes"));
const complaintRoutes_1 = __importDefault(require("./routes/complaintRoutes"));
const skillRoutes_1 = __importDefault(require("./routes/skillRoutes"));
// Load env from server folder
dotenv_1.default.config({ path: path_1.default.join(__dirname, '.env') }); // ✅ CHANGE: ab server folder mein .env
const app = (0, express_1.default)();
// Connect to database
(0, db_1.default)();
// Test Supabase connection
(0, supabase_1.testSupabaseConnection)(); // ✅ ADD THIS
// Create uploads directory (local backup)
const uploadsDir = path_1.default.resolve(__dirname, '../uploads');
console.log('📁 Uploads directory path:', uploadsDir);
try {
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        console.log('✅ Uploads directory created successfully');
    }
    else {
        console.log('✅ Uploads directory already exists');
    }
    // Test write permission
    const testFile = path_1.default.join(uploadsDir, 'test.txt');
    fs_1.default.writeFileSync(testFile, 'test');
    fs_1.default.unlinkSync(testFile);
    console.log('✅ Uploads directory is writable');
}
catch (error) {
    console.error('❌ Error with uploads directory:', error);
}
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Serve static files (for local uploads backup)
app.use('/uploads', express_1.default.static(uploadsDir));
// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// API Routes
console.log('📝 Registering routes...');
app.use('/api/complaints', complaintRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/lost-items', lostItemRoutes_1.default);
app.use('/api/marketplace', marketplaceRoutes_1.default); // ✅ Updated marketplace routes
app.use('/api/notes', notesRoutes_1.default);
app.use('/api/rides', rideRoutes_1.default);
app.use('/api/studygroups', studyGroupRoutes_1.default);
app.use('/api/activities', activityRoutes_1.default);
app.use('/api/polls', pollRoutes_1.default);
app.use('/api/skills', skillRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/profile', profileRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
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
        exists: fs_1.default.existsSync(uploadsDir),
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
exports.default = app;
