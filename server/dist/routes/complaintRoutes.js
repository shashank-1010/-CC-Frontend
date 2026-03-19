"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaintController_1 = require("../controllers/complaintController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All routes are protected
router.use(authMiddleware_1.protect);
// User routes
router.post('/', complaintController_1.createComplaint);
router.get('/my-complaints', complaintController_1.getMyComplaints);
router.get('/:id', complaintController_1.getComplaintById);
// Admin only routes
router.get('/', authMiddleware_1.adminOnly, complaintController_1.getAllComplaints);
router.get('/stats/dashboard', authMiddleware_1.adminOnly, complaintController_1.getComplaintStats); // Add this line
router.put('/:id/status', authMiddleware_1.adminOnly, complaintController_1.updateComplaintStatus);
router.delete('/:id', authMiddleware_1.adminOnly, complaintController_1.deleteComplaint);
exports.default = router;
