"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserAddress_controller_1 = require("../controllers/UserAddress.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Tất cả các routes đều cần authentication
router.use(authMiddleware_1.authMiddleware);
// Get all addresses for current user
router.get("/", UserAddress_controller_1.getUserAddresses);
// Get specific address
router.get("/:id", UserAddress_controller_1.getAddressById);
// Create new address
router.post("/", UserAddress_controller_1.createAddress);
// Update address
router.put("/:id", UserAddress_controller_1.updateAddress);
// Set address as default
router.put("/:id/default", UserAddress_controller_1.setDefaultAddress);
// Delete address
router.delete("/:id", UserAddress_controller_1.deleteAddress);
exports.default = router;
