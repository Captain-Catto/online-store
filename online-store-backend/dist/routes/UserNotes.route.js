"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserNote_controller_1 = require("../controllers/UserNote.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Thêm ghi chú cho user
router.post("/users/:id/notes", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), // Chỉ admin
UserNote_controller_1.addUserNote);
// Lấy danh sách ghi chú của user
router.get("/users/:id/notes", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), // Chỉ admin
UserNote_controller_1.getUserNotes);
// Xóa ghi chú
router.delete("/notes/:noteId", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), // Chỉ admin
UserNote_controller_1.deleteUserNote);
// Cập nhật ghi chú
router.put("/notes/:noteId", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), // Chỉ admin
UserNote_controller_1.updateUserNote);
exports.default = router;
