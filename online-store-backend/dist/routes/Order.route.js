"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_Controller_1 = require("../controllers/Order.Controller");
const OrderEdit_controller_1 = require("../controllers/OrderEdit.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Tạo đơn hàng mới (cần đăng nhập)
router.post("/", authMiddleware_1.authMiddleware, Order_Controller_1.createOrder);
// ADMIN ROUTES (Tất cả đều yêu cầu quyền admin)
// Lấy tất cả đơn hàng (Admin)
router.get("/admin/all", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.permissionMiddleware)([roleMiddleware_1.Permission.VIEW_FULL_ORDERS]), OrderEdit_controller_1.getAllOrders);
// lấy tất cả đơn hàng (employee) - chỉ xem được 1 phần thông tin đơn hàng
router.get("/employee/all", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.permissionMiddleware)([roleMiddleware_1.Permission.VIEW_ORDERS]), Order_Controller_1.getAllOrdersByEmployee);
// Lấy danh sách đơn hàng của người dùng (chỉ người dùng đã đăng nhập)
router.get("/my-orders", authMiddleware_1.authMiddleware, Order_Controller_1.getUserOrders);
// Lấy danh sách đơn hàng của người dùng theo ID (Admin)
router.get("/user/:userId", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1, 2]), Order_Controller_1.getUserOrdersByAdmin);
// Lấy chi tiết đơn hàng theo ID
router.get("/:id", authMiddleware_1.authMiddleware, Order_Controller_1.getOrderById);
// Cập nhật trạng thái đơn hàng
router.put("/:id/status", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1, 2]), OrderEdit_controller_1.updateOrderStatus);
// Cập nhật trạng thái thanh toán
router.put("/:id/payment-status", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), OrderEdit_controller_1.updatePaymentStatus);
// Cập nhật địa chỉ giao hàng
router.put("/:id/shipping", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), OrderEdit_controller_1.updateShippingAddress);
// Xử lý hoàn tiền
router.post("/:id/refund", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), OrderEdit_controller_1.processRefund);
// Hủy đơn hàng (user và admin)
router.put("/:id/cancel", authMiddleware_1.authMiddleware, OrderEdit_controller_1.cancelOrder);
// Tính phí vận chuyển cho giỏ hàng
router.post("/shipping-fee", Order_Controller_1.calculateShippingFeeForCart);
exports.default = router;
