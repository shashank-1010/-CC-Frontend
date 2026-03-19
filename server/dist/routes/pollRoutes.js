"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pollController_1 = require("../controllers/pollController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', pollController_1.getPolls);
// Protected routes (any logged in user)
router.post('/', authMiddleware_1.protect, pollController_1.createPoll);
router.post('/:id/vote', authMiddleware_1.protect, pollController_1.votePoll);
router.post('/:id/comment', authMiddleware_1.protect, pollController_1.addComment);
// Admin only routes
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.adminOnly, pollController_1.deletePoll);
router.delete('/:id/comments', authMiddleware_1.protect, authMiddleware_1.adminOnly, pollController_1.deleteAllComments);
router.delete('/:id/comments/:commentId', authMiddleware_1.protect, authMiddleware_1.adminOnly, pollController_1.deleteComment);
router.delete('/all', authMiddleware_1.protect, authMiddleware_1.adminOnly, pollController_1.deleteAllPolls);
exports.default = router;
