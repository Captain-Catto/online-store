import { Request, Response } from "express";
import Voucher from "../models/Voucher";

// tạo voucher
export const createVoucher = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, type, value, expirationDate } = req.body;

    // Kiểm tra nếu voucher đã tồn tại
    const existingVoucher = await Voucher.findOne({ where: { code } });
    if (existingVoucher) {
      res.status(400).json({ message: "Voucher đã tồn tại" });
      return;
    }

    const newVoucher = await Voucher.create({
      code,
      type,
      value,
      expirationDate,
    });
    res.status(201).json(newVoucher);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// lấy danh sách tất cả các Voucher
export const getVouchers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const vouchers = await Voucher.findAll();
    res.status(200).json(vouchers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// lấy chi tiết một voucher theo code
export const getVoucherByCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.params;
    const voucher = await Voucher.findOne({ where: { code } });

    if (!voucher) {
      res.status(404).json({ message: "Voucher không tồn tại" });
      return;
    }

    res.status(200).json(voucher);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// cập nhật một voucher
export const updateVoucher = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { code, type, value, expirationDate } = req.body;

    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      res.status(404).json({ message: "Voucher không tồn tại" });
      return;
    }

    // Cập nhật voucher
    await voucher.update({ code, type, value, expirationDate });
    res.status(200).json(voucher);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa một voucher
export const deleteVoucher = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      res.status(404).json({ message: "Voucher không tồn tại" });
      return;
    }

    // Xóa Voucher
    await voucher.destroy();
    res.status(200).json({ message: "Xóa Voucher thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
