import { Router } from "express";
import {
  getAllSubtypes,
  getSubtypeById,
  getSubtypesByCategory,
  createSubtype,
  updateSubtype,
  deleteSubtype,
} from "../controllers/Subtype.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();

// Public routes - Ai cũng có thể xem
router.get("/", getAllSubtypes);
router.get("/:id", getSubtypeById);
router.get("/category/:categoryId", getSubtypesByCategory);

// Protected routes - Chỉ admin mới thao tác được
router.post("/", authMiddleware, roleMiddleware([1]), createSubtype);
router.put("/:id", authMiddleware, roleMiddleware([1]), updateSubtype);
router.delete("/:id", authMiddleware, roleMiddleware([1]), deleteSubtype);

export default router;
