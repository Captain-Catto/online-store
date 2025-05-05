"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Voucher_controller_1 = require("../controllers/Voucher.controller");
const router = (0, express_1.Router)();
// Lấy danh sách tất cả các Voucher
router.get("/", Voucher_controller_1.getVouchers);
// Lấy chi tiết một Voucher theo mã code
router.get("/:code", Voucher_controller_1.getVoucherByCode);
// Thêm mới một Voucher (chỉ admin)
router.post("/", Voucher_controller_1.createVoucher);
// Cập nhật một Voucher (chỉ admin)
router.put("/:id", Voucher_controller_1.updateVoucher);
// Xóa một Voucher (chỉ admin)
router.delete("/:id", Voucher_controller_1.deleteVoucher);
exports.default = router;
