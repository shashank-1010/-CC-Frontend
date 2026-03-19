"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activityController_1 = require("../controllers/activityController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', activityController_1.getActivities);
router.get('/users/:id/profile', activityController_1.getUserProfile); // Get user profile
// Protected routes
router.post('/', authMiddleware_1.protect, activityController_1.createActivity);
router.put('/:id', authMiddleware_1.protect, activityController_1.updateActivity);
router.delete('/:id', authMiddleware_1.protect, activityController_1.deleteActivity);
// Join request routes
router.post('/:id/request', authMiddleware_1.protect, activityController_1.requestToJoin);
router.post('/:id/accept/:userId', authMiddleware_1.protect, activityController_1.acceptRequest);
router.post('/:id/decline/:userId', authMiddleware_1.protect, activityController_1.declineRequest);
router.get('/:id/participants', authMiddleware_1.protect, activityController_1.getParticipants);
router.delete('/:id/leave', authMiddleware_1.protect, activityController_1.leaveActivity);
// 👈 REMOVE PARTICIPANT ROUTE - YEH ADD KARO
router.delete('/:id/participants/:userId', authMiddleware_1.protect, activityController_1.removeParticipant);
exports.default = router;
