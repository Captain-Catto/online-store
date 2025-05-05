"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Product_controller_1 = require("../controllers/Product.controller");
const ProductSizes_controller_1 = require("../controllers/ProductSizes.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const imageUpload_1 = require("../services/imageUpload");
const router = (0, express_1.Router)();
// Public routes
router.get("/", Product_controller_1.getProductsWithVariants);
router.get("/suitabilities", Product_controller_1.getSuitabilities);
router.get("/variants/:id", Product_controller_1.getProductVariantsById);
router.get("/category/:categoryId", Product_controller_1.getProductsByCategory);
router.get("/subtypes", Product_controller_1.getSubtypes);
router.get("/sizes", ProductSizes_controller_1.getAllSizes);
router.get("/by-category", ProductSizes_controller_1.getSizesByCategory);
// luôn để route này ở dưới cùng vì khi để /subtypes thì nó đang hiểu là
// id = subtypes và ko tìm ra
router.get("/:id", Product_controller_1.getProductById);
// Protected routes
router.post("/", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), imageUpload_1.upload.array("images", 50), Product_controller_1.createProductWithDetails);
router.post("/sizes", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), ProductSizes_controller_1.createSize);
router.put("/sizes/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), ProductSizes_controller_1.updateSize);
router.delete("/sizes/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), ProductSizes_controller_1.deleteSize);
// Thêm các route mới cho update sản phẩm theo từng phần
// Basic info
router.patch("/:id/basic-info", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Product_controller_1.updateProductBasicInfo);
// Inventory
router.patch("/:id/inventory", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Product_controller_1.updateProductInventory);
// Add images
router.post("/:id/images", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), imageUpload_1.upload.array("images", 20), Product_controller_1.addProductImages);
// Remove images
router.delete("/:id/images", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Product_controller_1.removeProductImages);
// Set main image
router.patch("/:id/images/:imageId/main", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Product_controller_1.setMainProductImage);
router.patch("/:id/variants", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Product_controller_1.updateProductVariants);
router.delete("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Product_controller_1.deleteProduct);
exports.default = router;
