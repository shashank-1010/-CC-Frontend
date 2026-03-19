"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = void 0;
const authMiddleware_1 = require("./authMiddleware");
const adminOnly = (req, res, next) => {
    (0, authMiddleware_1.protect)(req, res, () => {
        if (req.userRole !== 'admin') {
            res.status(403).json({ message: 'Admin access required' });
            return;
        }
        next();
    });
};
exports.adminOnly = adminOnly;
