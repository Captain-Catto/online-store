import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/User.controller";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Đăng ký
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

// Làm mới Access Token
router.post("/refresh-token", refreshToken);

// Đăng xuất
router.post("/logout", authMiddleware, logout);

// api admin, check role = 1 (admin)
router.get("/admin", authMiddleware, roleMiddleware([1]), (req, res) => {
  res.json({ message: "chào mừng, admin" });
});

export default router;
