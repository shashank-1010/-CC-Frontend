"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveItem = exports.deleteLostItem = exports.updateLostItem = exports.createLostItem = exports.getLostItemById = exports.getLostItems = void 0;
const LostItem_1 = __importDefault(require("../models/LostItem"));
// @desc    Get all lost/found items
// @route   GET /api/lost-items
const getLostItems = async (req, res) => {
    try {
        const { category, status, search } = req.query;
        let query = {};
        if (category)
            query.category = category;
        if (status)
            query.status = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { itemType: { $regex: search, $options: 'i' } }
            ];
        }
        const items = await LostItem_1.default.find(query)
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(items);
    }
    catch (error) {
        console.error('Get lost items error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getLostItems = getLostItems;
// @desc    Get single lost/found item
// @route   GET /api/lost-items/:id
const getLostItemById = async (req, res) => {
    try {
        const item = await LostItem_1.default.findById(req.params.id)
            .populate('userId', 'name email phone');
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        res.json(item);
    }
    catch (error) {
        console.error('Get lost item error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getLostItemById = getLostItemById;
// @desc    Create lost/found item
// @route   POST /api/lost-items
const createLostItem = async (req, res) => {
    try {
        console.log('Create lost item payload:', req.body);
        const item = await LostItem_1.default.create({
            ...req.body,
            userId: req.userId
        });
        const populatedItem = await LostItem_1.default.findById(item._id)
            .populate('userId', 'name email phone');
        res.status(201).json(populatedItem);
    }
    catch (error) {
        console.error('Create lost item error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createLostItem = createLostItem;
// @desc    Update lost/found item
// @route   PUT /api/lost-items/:id
const updateLostItem = async (req, res) => {
    try {
        const item = await LostItem_1.default.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        // Check if user is creator or admin
        if (String(item.userId) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const updated = await LostItem_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('userId', 'name email phone');
        res.json(updated);
    }
    catch (error) {
        console.error('Update lost item error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateLostItem = updateLostItem;
// @desc    Delete lost/found item
// @route   DELETE /api/lost-items/:id
const deleteLostItem = async (req, res) => {
    try {
        const item = await LostItem_1.default.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        // Check if user is creator or admin
        if (String(item.userId) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        await item.deleteOne();
        res.json({ message: 'Item deleted successfully' });
    }
    catch (error) {
        console.error('Delete lost item error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteLostItem = deleteLostItem;
// @desc    Mark item as resolved
// @route   PUT /api/lost-items/:id/resolve
const resolveItem = async (req, res) => {
    try {
        const item = await LostItem_1.default.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        // Check if user is creator or admin
        if (String(item.userId) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        item.status = 'resolved';
        await item.save();
        const updated = await LostItem_1.default.findById(item._id)
            .populate('userId', 'name email phone');
        res.json(updated);
    }
    catch (error) {
        console.error('Resolve item error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.resolveItem = resolveItem;
