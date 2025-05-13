"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserAddress_controller_1 = require("../controllers/UserAddress.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Tất cả các routes đều cần authentication
router.use(authMiddleware_1.authMiddleware);
// ROUTES CHO NGƯỜI DÙNG THÔNG THƯỜNG
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
// ROUTES CHO ADMIN
// Get all addresses for a specific user
router.get("/admin/users/:userId/addresses", (0, roleMiddleware_1.permissionMiddleware)([roleMiddleware_1.Permission.VIEW_USERS, roleMiddleware_1.Permission.VIEW_FULL_USER_INFO]), UserAddress_controller_1.getAddressesByUserId);
// Get specific address for admin
router.get("/admin/addresses/:id", (0, roleMiddleware_1.permissionMiddleware)([roleMiddleware_1.Permission.VIEW_USERS, roleMiddleware_1.Permission.VIEW_FULL_USER_INFO]), UserAddress_controller_1.getAddressByIdForAdmin);
// Create address for user by admin
router.post("/admin/users/:userId/addresses", (0, roleMiddleware_1.permissionMiddleware)([roleMiddleware_1.Permission.EDIT_USERS_ADDRESS]), UserAddress_controller_1.createAddressByAdmin);
// Update address by admin
router.put("/admin/addresses/:id", (0, roleMiddleware_1.permissionMiddleware)([roleMiddleware_1.Permission.EDIT_USERS_ADDRESS]), UserAddress_controller_1.updateAddressByAdmin);
// Set address as default by admin
router.put("/admin/addresses/:id/default", (0, roleMiddleware_1.permissionMiddleware)([roleMiddleware_1.Permission.EDIT_USERS_ADDRESS]), UserAddress_controller_1.setDefaultAddressByAdmin);
// Delete address by admin
router.delete("/admin/addresses/:id", (0, roleMiddleware_1.permissionMiddleware)([roleMiddleware_1.Permission.EDIT_USERS_ADDRESS]), UserAddress_controller_1.deleteAddressByAdmin);
exports.default = router;
