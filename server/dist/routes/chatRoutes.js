"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes (anyone can read)
router.get('/messages', chatController_1.getMessages);
// Protected routes (any logged in user)
router.post('/messages', authMiddleware_1.protect, chatController_1.sendMessage);
// Admin only routes
router.delete('/messages/all', authMiddleware_1.protect, authMiddleware_1.adminOnly, chatController_1.deleteAllMessages);
router.delete('/messages/:messageId', authMiddleware_1.protect, authMiddleware_1.adminOnly, chatController_1.deleteMessage);
exports.default = router;
