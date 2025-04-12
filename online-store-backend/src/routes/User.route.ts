import { Router } from "express";
import {
  getCurrentUser,
  getUserById,
  getAllUsers,
  updateUser,
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

export default router;
