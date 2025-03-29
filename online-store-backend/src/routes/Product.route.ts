import { Router } from "express";
import {
  createProductWithDetails,
  getProductsWithVariants,
  getProductById,
} from "../controllers/Product.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();

// Tạo sản phẩm mới (chỉ admin)
router.post("/", authMiddleware, roleMiddleware([1]), createProductWithDetails);
// Lấy danh sách sản phẩm
router.get("/", getProductsWithVariants);
// lấy sản phẩm theo id
router.get("/:id", getProductById);

export default router;
