import { Router } from "express";
import {
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "../controllers/UserAddress.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Tất cả các routes đều cần authentication
router.use(authMiddleware);

// Get all addresses for current user
router.get("/", getUserAddresses);

// Get specific address
router.get("/:id", getAddressById);

// Create new address
router.post("/", createAddress);

// Update address
router.put("/:id", updateAddress);

// Set address as default
router.put("/:id/default", setDefaultAddress);

// Delete address
router.delete("/:id", deleteAddress);

export default router;
