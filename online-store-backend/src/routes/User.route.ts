import { Router } from "express";
import {
  getCurrentUser,
  getUserById,
  getAllUsers,
  updateUser,
  toggleUserStatus,
} from "../controllers/User.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();

// Lấy thông tin người dùng hiện tại
router.get("/me", authMiddleware, getCurrentUser);

// Cập nhật thông tin người dùng
router.put("/me", authMiddleware, updateUser);

// Lấy danh sách người dùng (admin only)
router.get("/", authMiddleware, roleMiddleware([1]), getAllUsers);

// Lấy thông tin người dùng theo ID (admin only)
router.get("/:id", authMiddleware, roleMiddleware([1]), getUserById);

// mở/khóa tài khoản (âdmin only)
// xài patch vì nó chỉ thay đổi một thuộc tính trong bảng user
router.patch(
  "/:id/toggle-status",
  authMiddleware,
  roleMiddleware([1]),
  toggleUserStatus
);

export default router;
