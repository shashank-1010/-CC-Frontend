"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lostItemController_1 = require("../controllers/lostItemController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', lostItemController_1.getLostItems);
router.get('/:id', lostItemController_1.getLostItemById);
// Protected routes
router.post('/', authMiddleware_1.protect, lostItemController_1.createLostItem);
router.put('/:id', authMiddleware_1.protect, lostItemController_1.updateLostItem);
router.delete('/:id', authMiddleware_1.protect, lostItemController_1.deleteLostItem);
router.put('/:id/resolve', authMiddleware_1.protect, lostItemController_1.resolveItem);
exports.default = router;
