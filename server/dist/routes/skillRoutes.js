"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const skillController_1 = require("../controllers/skillController");
const router = express_1.default.Router();
// Public routes
router.get('/', skillController_1.getSkills);
router.get('/categories', skillController_1.getCategories);
router.get('/:id', skillController_1.getSkillById);
// Protected routes
router.post('/', authMiddleware_1.protect, skillController_1.createSkill);
router.get('/user/my-skills', authMiddleware_1.protect, skillController_1.getUserSkills);
router.put('/:id', authMiddleware_1.protect, skillController_1.updateSkill);
router.delete('/:id', authMiddleware_1.protect, skillController_1.deleteSkill);
exports.default = router;
