import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  calculateShippingFeeForCart,
} from "../controllers/Order.Controller";
import {
  updateOrderStatus,
  cancelOrder,
  updatePaymentStatus,
  updateShippingAddress,
  getAllOrders,
  processRefund,
} from "../controllers/OrderEdit.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();

// Tạo đơn hàng mới (cần đăng nhập)
router.post("/", authMiddleware, createOrder);

// Lấy danh sách đơn hàng của người dùng
router.get("/my-orders", authMiddleware, getUserOrders);

// Lấy chi tiết đơn hàng theo ID
router.get("/:id", authMiddleware, getOrderById);

// ADMIN ROUTES (Tất cả đều yêu cầu quyền admin)
// Lấy tất cả đơn hàng (Admin)
router.get("/admin/all", authMiddleware, roleMiddleware([1]), getAllOrders);

// Cập nhật trạng thái đơn hàng
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware([1]),
  updateOrderStatus
);

// Cập nhật trạng thái thanh toán
router.put(
  "/:id/payment-status",
  authMiddleware,
  roleMiddleware([1]),
  updatePaymentStatus
);

// Cập nhật địa chỉ giao hàng
router.put(
  "/:id/shipping",
  authMiddleware,
  roleMiddleware([1]),
  updateShippingAddress
);

// Xử lý hoàn tiền
router.post("/:id/refund", authMiddleware, roleMiddleware([1]), processRefund);

// Hủy đơn hàng (user và admin)
router.put("/:id/cancel", authMiddleware, cancelOrder);

// Tính phí vận chuyển cho giỏ hàng
router.post("/shipping-fee", calculateShippingFeeForCart);

export default router;
