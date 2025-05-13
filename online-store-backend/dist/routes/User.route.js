"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_controller_1 = require("../controllers/User.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Lấy thông tin người dùng hiện tại
router.get("/me", authMiddleware_1.authMiddleware, User_controller_1.getCurrentUser);
// Cập nhật thông tin người dùng
router.put("/me", authMiddleware_1.authMiddleware, User_controller_1.updateUser);
// Lấy danh sách người dùng (admin only)
router.get("/", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1, 2]), User_controller_1.getAllUsers);
// Lấy thông tin người dùng theo ID (admin only)
router.get("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1, 2]), User_controller_1.getUserById);
// Cập nhật thông tin người dùng theo ID (admin only)
router.put("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.permissionMiddleware)([roleMiddleware_1.Permission.EDIT_USERS]), User_controller_1.updateUserByAdmin);
// mở/khóa tài khoản (âdmin only)
// xài patch vì nó chỉ thay đổi một thuộc tính trong bảng user
router.patch("/:id/toggle-status", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.permissionMiddleware)([roleMiddleware_1.Permission.TOGGLE_USER_STATUS]), User_controller_1.toggleUserStatus);
exports.default = router;
