"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_controller_1 = require("../controllers/User.controller");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Đăng ký
router.post("/register", User_controller_1.register);
// Đăng nhập
router.post("/login", User_controller_1.login);
// Làm mới Access Token
router.post("/refresh-token", User_controller_1.refreshToken);
// Đăng xuất
router.post("/logout", User_controller_1.logout);
// api admin, check role = 1 (admin)
router.get("/admin", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), (req, res) => {
    res.json({ message: "chào mừng, admin" });
});
// quên mật khẩu
router.post("/forgot-password", User_controller_1.forgotPassword);
router.get("/reset-password/:token", User_controller_1.validateResetToken);
router.post("/reset-password/:token", User_controller_1.resetPassword);
exports.default = router;
