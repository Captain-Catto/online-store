"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Category_controller_1 = require("../controllers/Category.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Lấy danh sách tất cả các Category
router.get("/", Category_controller_1.getAllCategories);
// Lấy danh mục cho navigation - Thêm route mới này
router.get("/nav", Category_controller_1.getNavCategories);
// Lấy chi tiết một Category theo ID
router.get("/:id", Category_controller_1.getCategoryById);
// Lấy danh sách các Category con theo ID của Category cha
router.get("/:id/subcategories", Category_controller_1.getSubCategories);
// Thêm mới một Category (chỉ admin)
router.post("/", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Category_controller_1.createCategory);
// Cập nhật một Category (chỉ admin)
router.put("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Category_controller_1.updateCategory);
// Xóa một Category (chỉ admin)
router.delete("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Category_controller_1.deleteCategory);
// Lấy breadcrumb cho một Category
router.get("/slug/:slug/breadcrumb", Category_controller_1.getCategoryBreadcrumb);
// Lấy danh mục theo slug
router.get("/slug/:slug", Category_controller_1.getCategoryBySlug);
// Lấy danh sách sản phẩm theo slug danh mục
router.get("/slug/:slug/products", Category_controller_1.getProductsByCategorySlug);
exports.default = router;
