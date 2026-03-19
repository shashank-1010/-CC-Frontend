"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.updateNote = exports.getNote = exports.createNote = exports.getNotes = void 0;
const Note_1 = __importDefault(require("../models/Note"));
const AdminLog_1 = __importDefault(require("../models/AdminLog"));
const getNotes = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status)
            filter.status = String(req.query.status);
        const notes = await Note_1.default.find(filter).populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(notes);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.getNotes = getNotes;
const createNote = async (req, res) => {
    try {
        const note = await Note_1.default.create({ ...req.body, userId: req.userId });
        await note.populate('userId', 'name email');
        res.status(201).json(note);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.createNote = createNote;
const getNote = async (req, res) => {
    try {
        const note = await Note_1.default.findById(req.params.id).populate('userId', 'name email');
        if (!note) {
            res.status(404).json({ message: 'Note not found' });
            return;
        }
        res.json(note);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.getNote = getNote;
const updateNote = async (req, res) => {
    try {
        const note = await Note_1.default.findById(req.params.id);
        if (!note) {
            res.status(404).json({ message: 'Note not found' });
            return;
        }
        if (String(note.userId) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const updated = await Note_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('userId', 'name email');
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.updateNote = updateNote;
const deleteNote = async (req, res) => {
    try {
        const note = await Note_1.default.findById(req.params.id);
        if (!note) {
            res.status(404).json({ message: 'Note not found' });
            return;
        }
        if (String(note.userId) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        if (req.userRole === 'admin') {
            await AdminLog_1.default.create({ adminId: req.userId, action: 'delete_post', targetId: String(note._id), targetType: 'note', details: `Deleted note: ${note.title}` });
        }
        await note.deleteOne();
        res.json({ message: 'Deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.deleteNote = deleteNote;
