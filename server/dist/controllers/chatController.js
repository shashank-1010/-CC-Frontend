"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.deleteAllMessages = exports.sendMessage = exports.getMessages = void 0;
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
// @desc    Get all chat messages
// @route   GET /api/chat/messages
const getMessages = async (req, res) => {
    try {
        const messages = await ChatMessage_1.default.find()
            .sort({ createdAt: 1 }); // Oldest first for chat flow
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getMessages = getMessages;
// @desc    Send a chat message
// @route   POST /api/chat/messages
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const chatMessage = await ChatMessage_1.default.create({
            message,
            userId: req.userId,
            isAnonymous: true
        });
        res.status(201).json(chatMessage);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.sendMessage = sendMessage;
// @desc    Delete all messages (admin only)
// @route   DELETE /api/chat/messages/all
const deleteAllMessages = async (req, res) => {
    try {
        await ChatMessage_1.default.deleteMany({});
        res.json({ message: 'All messages deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteAllMessages = deleteAllMessages;
// @desc    Delete a specific message (admin only)
// @route   DELETE /api/chat/messages/:messageId
const deleteMessage = async (req, res) => {
    try {
        const message = await ChatMessage_1.default.findById(req.params.messageId);
        if (!message) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }
        await message.deleteOne();
        res.json({ message: 'Message deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteMessage = deleteMessage;
