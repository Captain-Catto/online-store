"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Suitability_controller_1 = require("../controllers/Suitability.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Tạo mới suitability (chỉ admin)
router.post("/", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Suitability_controller_1.createSuitability);
// Lấy tất cả suitabilities
router.get("/", Suitability_controller_1.getAllSuitabilities);
// Cập nhật order của suitabilities
router.put("/reorder", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Suitability_controller_1.updateSuitabilityOrder);
// Cập nhật suitability (chỉ admin)
router.put("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Suitability_controller_1.updateSuitability);
// Xóa suitability (chỉ admin)
router.delete("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Suitability_controller_1.deleteSuitability);
exports.default = router;
