"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductImage_controller_1 = require("../controllers/ProductImage.controller");
const imageUpload_1 = require("../services/imageUpload");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Upload nhiều ảnh cho một ProductDetail
router.post("/:productDetailId", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), imageUpload_1.upload.array("images", 10), ProductImage_controller_1.uploadProductImages);
// Xóa một ảnh
router.delete("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), ProductImage_controller_1.deleteProductImage);
// Đặt ảnh làm ảnh chính
router.put("/:id/main", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), ProductImage_controller_1.setMainImage);
exports.default = router;
