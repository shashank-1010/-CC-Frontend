"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.getItem = exports.createItem = exports.getItems = void 0;
const Item_1 = __importDefault(require("../models/Item"));
const AdminLog_1 = __importDefault(require("../models/AdminLog"));
const getItems = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status)
            filter.status = String(req.query.status);
        const items = await Item_1.default.find(filter).populate('userId', 'name email phone').sort({ createdAt: -1 });
        res.json(items);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.getItems = getItems;
const createItem = async (req, res) => {
    try {
        const item = await Item_1.default.create({ ...req.body, userId: req.userId });
        await item.populate('userId', 'name email phone');
        res.status(201).json(item);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.createItem = createItem;
const getItem = async (req, res) => {
    try {
        const item = await Item_1.default.findById(req.params.id).populate('userId', 'name email phone');
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        res.json(item);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.getItem = getItem;
const updateItem = async (req, res) => {
    try {
        const item = await Item_1.default.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        if (String(item.userId) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const updated = await Item_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('userId', 'name email phone');
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.updateItem = updateItem;
const deleteItem = async (req, res) => {
    try {
        const item = await Item_1.default.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        if (String(item.userId) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        if (req.userRole === 'admin') {
            await AdminLog_1.default.create({ adminId: req.userId, action: 'delete_post', targetId: String(item._id), targetType: 'item', details: `Deleted item: ${item.title}` });
        }
        await item.deleteOne();
        res.json({ message: 'Deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.deleteItem = deleteItem;
