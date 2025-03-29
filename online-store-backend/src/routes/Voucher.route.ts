import { Router } from "express";
import {
  createVoucher,
  getVouchers,
  getVoucherByCode,
  updateVoucher,
  deleteVoucher,
} from "../controllers/Voucher.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();

// Lấy danh sách tất cả các Voucher
router.get("/", getVouchers);

// Lấy chi tiết một Voucher theo mã code
router.get("/:code", getVoucherByCode);

// Thêm mới một Voucher (chỉ admin)
router.post("/", createVoucher);

// Cập nhật một Voucher (chỉ admin)
router.put("/:id", updateVoucher);

// Xóa một Voucher (chỉ admin)
router.delete("/:id", deleteVoucher);

export default router;
