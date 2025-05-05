"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductDetail_controller_1 = require("../controllers/ProductDetail.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Tạo chi tiết sản phẩm (chỉ admin)
router.post("/", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), ProductDetail_controller_1.createProductDetail);
// Lấy danh sách chi tiết sản phẩm
router.get("/", ProductDetail_controller_1.getProductDetails);
// Lấy chi tiết sản phẩm theo ID
router.get("/:id", ProductDetail_controller_1.getProductDetailById);
// lấy chi tiết sản phẩm theo ID sản phẩm
router.get("/product/:productId", ProductDetail_controller_1.getProductDetailsByProductId);
// Cập nhật chi tiết sản phẩm (chỉ admin)
router.put("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), ProductDetail_controller_1.updateProductDetail);
// Xóa chi tiết sản phẩm (chỉ admin)
router.delete("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), ProductDetail_controller_1.deleteProductDetail);
exports.default = router;
