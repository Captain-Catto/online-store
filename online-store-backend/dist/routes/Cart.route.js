"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Cart_controller_1 = require("../controllers/Cart.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Kiểm tra tồn kho cho sản phẩm trong giỏ hàng
router.post("/check-stock", Cart_controller_1.checkStockAvailability);
// Tất cả routes ở dưới đều yêu cầu đăng nhập
router.use(authMiddleware_1.authMiddleware);
// Lấy giỏ hàng của user hiện tại
router.get("/", Cart_controller_1.getUserCart);
// Thêm sản phẩm vào giỏ hàng
router.post("/items", Cart_controller_1.addItemToCart);
// Cập nhật số lượng sản phẩm
router.put("/items/:id", Cart_controller_1.updateCartItem);
// Xóa sản phẩm khỏi giỏ hàng
router.delete("/items/:id", Cart_controller_1.removeCartItem);
// Xóa toàn bộ giỏ hàng
router.delete("/", Cart_controller_1.clearCart);
// Merge giỏ hàng từ cookies vào database
router.post("/merge", Cart_controller_1.mergeCartFromCookies);
exports.default = router;
