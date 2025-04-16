import { Router } from "express";
import {
  getProductsWithVariants,
  getProductById,
  createProductWithDetails,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getSuitabilities,
  getSubtypes,
  getProductVariantsById,
} from "../controllers/Product.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();

// Public routes
router.get("/", getProductsWithVariants);
router.get("/suitabilities", getSuitabilities);
router.get("/variants/:id", getProductVariantsById);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/subtypes", getSubtypes);
// luôn để route này ở dưới cùng vì khi để /subtypes thì nó đang hiểu là
// id = subtypes và ko tìm ra
router.get("/:id", getProductById);

// Protected routes
router.post("/", authMiddleware, roleMiddleware([1]), createProductWithDetails);
router.put("/:id", authMiddleware, roleMiddleware([1]), updateProduct);
router.delete("/:id", authMiddleware, roleMiddleware([1]), deleteProduct);

export default router;
