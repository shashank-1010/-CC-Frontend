"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const signToken = (id, role) => jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET || 'campusconnectsecret', { expiresIn: '7d' });
const signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const existing = await User_1.default.findOne({ email });
        if (existing) {
            res.status(400).json({ message: 'Email already in use' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.default.create({ name, email, password: passwordHash, phone, role: 'user' });
        const token = signToken(String(user._id), user.role);
        res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, isBanned: user.isBanned, createdAt: user.createdAt } });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Admin hardcoded check
        if (email === 'shashankadmin@gmail.com' && password === 'shashan8115067311admin') {
            let admin = await User_1.default.findOne({ email });
            if (!admin) {
                const hash = await bcryptjs_1.default.hash(password, 10);
                admin = await User_1.default.create({ name: 'Admin', email, password: hash, role: 'admin' });
            }
            const token = signToken(String(admin._id), admin.role);
            res.json({ token, user: { _id: admin._id, name: admin.name, email: admin.email, phone: admin.phone, role: admin.role, isBanned: admin.isBanned, createdAt: admin.createdAt } });
            return;
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        if (user.isBanned) {
            res.status(403).json({ message: 'Account is banned' });
            return;
        }
        const token = signToken(String(user._id), user.role);
        res.json({ token, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, isBanned: user.isBanned, createdAt: user.createdAt } });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.getMe = getMe;
