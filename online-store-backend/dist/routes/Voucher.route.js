"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Voucher_controller_1 = require("../controllers/Voucher.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Lấy danh sách tất cả các Voucher (admin)
router.get("/", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Voucher_controller_1.getVouchers);
// Lấy chi tiết một Voucher theo mã code
router.get("/:code", Voucher_controller_1.getVoucherByCode);
// Kiểm tra và áp dụng voucher
router.post("/validate", Voucher_controller_1.validateVoucher);
// Tăng lượt sử dụng voucher
router.post("/:id/increment-usage", Voucher_controller_1.incrementVoucherUsage);
// Thêm mới một Voucher (chỉ admin)
router.post("/", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Voucher_controller_1.createVoucher);
// Cập nhật một Voucher (chỉ admin)
router.put("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Voucher_controller_1.updateVoucher);
// Xóa một Voucher (chỉ admin)
router.delete("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), Voucher_controller_1.deleteVoucher);
exports.default = router;
