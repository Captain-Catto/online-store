import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/Category.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();

// Lấy danh sách tất cả các Category
router.get("/", getCategories);

// Lấy chi tiết một Category theo ID
router.get("/:id", getCategoryById);

// Thêm mới một Category (chỉ admin)
router.post("/", createCategory);

// Cập nhật một Category (chỉ admin)
router.put("/:id", updateCategory);

// Xóa một Category (chỉ admin)
router.delete("/:id", deleteCategory);

export default router;
