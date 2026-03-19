"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminLogs = exports.deleteUser = exports.unbanUser = exports.banUser = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const AdminLog_1 = __importDefault(require("../models/AdminLog"));
const getAllUsers = async (_req, res) => {
    try {
        const users = await User_1.default.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.getAllUsers = getAllUsers;
const banUser = async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await AdminLog_1.default.create({ adminId: req.userId, action: 'ban_user', targetId: String(user._id), targetType: 'user', details: `Banned user: ${user.email}` });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.banUser = banUser;
const unbanUser = async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await AdminLog_1.default.create({ adminId: req.userId, action: 'unban_user', targetId: String(user._id), targetType: 'user', details: `Unbanned user: ${user.email}` });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.unbanUser = unbanUser;
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await AdminLog_1.default.create({ adminId: req.userId, action: 'delete_user', targetId: String(user._id), targetType: 'user', details: `Deleted user: ${user.email}` });
        res.json({ message: 'User deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.deleteUser = deleteUser;
const getAdminLogs = async (_req, res) => {
    try {
        const logs = await AdminLog_1.default.find().populate('adminId', 'name email').sort({ createdAt: -1 });
        res.json(logs);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.getAdminLogs = getAdminLogs;
