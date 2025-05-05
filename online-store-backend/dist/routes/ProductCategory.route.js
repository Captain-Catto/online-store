"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductCategory_controller_1 = require("../controllers/ProductCategory.controller");
const router = (0, express_1.Router)();
// Thêm danh mục vào sản phẩm
router.post("/", ProductCategory_controller_1.addCategoryToProduct);
// Xóa danh mục khỏi sản phẩm
router.delete("/", ProductCategory_controller_1.removeCategoryFromProduct);
exports.default = router;
