"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studyGroupController_1 = require("../controllers/studyGroupController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', studyGroupController_1.getStudyGroups);
router.get('/:id', studyGroupController_1.getStudyGroup);
// Protected routes
router.post('/', authMiddleware_1.protect, studyGroupController_1.createStudyGroup);
router.put('/:id', authMiddleware_1.protect, studyGroupController_1.updateStudyGroup);
router.delete('/:id', authMiddleware_1.protect, studyGroupController_1.deleteStudyGroup);
router.post('/:id/join', authMiddleware_1.protect, studyGroupController_1.joinStudyGroup);
router.post('/:id/leave', authMiddleware_1.protect, studyGroupController_1.leaveStudyGroup);
router.delete('/:id/members/:memberId', authMiddleware_1.protect, studyGroupController_1.removeMember);
exports.default = router;
