"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All profile routes are protected
router.use(authMiddleware_1.protect);
// Main profile routes
router.get('/', profileController_1.getProfile);
router.put('/', profileController_1.updateProfile);
// User's content routes
router.get('/items', profileController_1.getMyItems);
router.get('/notes', profileController_1.getMyNotes);
router.get('/rides', profileController_1.getMyRides);
router.get('/studygroups', profileController_1.getMyStudyGroups);
router.get('/activities', profileController_1.getMyActivities);
router.get('/lost-items', profileController_1.getMyLostItems);
router.get('/skills', profileController_1.getMySkills);
router.get('/joined-activities', profileController_1.getJoinedActivities);
router.get('/pending-requests', profileController_1.getPendingRequests);
exports.default = router;
