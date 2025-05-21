import { Request, Response } from "express";
import Voucher from "../models/Voucher";
import { Op } from "sequelize";

// tạo voucher
export const createVoucher = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      code,
      type,
      value,
      expirationDate,
      minOrderValue = 0,
      description = "",
      usageLimit = 0,
      status = "active",
    } = req.body;

    // Kiểm tra nếu voucher đã tồn tại
    const existingVoucher = await Voucher.findOne({ where: { code } });
    if (existingVoucher) {
      res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
      return;
    }

    const newVoucher = await Voucher.create({
      code,
      type,
      value,
      expirationDate,
      minOrderValue,
      description,
      usageLimit,
      status,
      usageCount: 0,
    });

    res.status(201).json({
      id: newVoucher.id,
      code: newVoucher.code,
      type: newVoucher.type,
      value: newVoucher.value,
      minOrderValue: newVoucher.minOrderValue,
      expirationDate: newVoucher.expirationDate,
      status: newVoucher.status,
      description: newVoucher.description,
    });
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
    // Thêm tùy chọn lọc theo trạng thái hoạt động
    const { status } = req.query;
    const where = {};

    if (status === "active") {
      Object.assign(where, {
        status: "active",
        expirationDate: { [Op.gt]: new Date() },
      });
    } else if (status) {
      Object.assign(where, { status });
    }

    const vouchers = await Voucher.findAll({ where });
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
      res.status(404).json({ message: "Mã giảm giá không tồn tại" });
      return;
    }

    // Kiểm tra xem voucher có hết hạn không
    const currentDate = new Date();
    if (voucher.expirationDate < currentDate) {
      res.status(400).json({ message: "Mã giảm giá đã hết hạn" });
      return;
    }

    // Kiểm tra trạng thái
    if (voucher.status !== "active") {
      res.status(400).json({ message: "Mã giảm giá không khả dụng" });
      return;
    }

    // Kiểm tra giới hạn sử dụng
    if (voucher.usageLimit > 0 && voucher.usageCount >= voucher.usageLimit) {
      res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });
      return;
    }

    res.status(200).json({
      id: voucher.id,
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      minOrderValue: voucher.minOrderValue,
      expirationDate: voucher.expirationDate,
      description: voucher.description,
    });
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
    const {
      code,
      type,
      value,
      expirationDate,
      minOrderValue,
      status,
      description,
      usageLimit,
    } = req.body;

    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      res.status(404).json({ message: "Voucher không tồn tại" });
      return;
    }

    // Kiểm tra nếu thay đổi code và code mới đã tồn tại
    if (code !== voucher.code) {
      const existingVoucher = await Voucher.findOne({ where: { code } });
      if (existingVoucher) {
        res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
        return;
      }
    }

    // Cập nhật voucher
    await voucher.update({
      code,
      type,
      value,
      expirationDate,
      minOrderValue,
      status,
      description,
      usageLimit,
    });

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

// Áp dụng voucher vào đơn hàng (kiểm tra giá trị đơn hàng)
export const validateVoucher = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      res.status(400).json({ message: "Vui lòng nhập mã giảm giá" });
      return;
    }

    const voucher = await Voucher.findOne({ where: { code } });

    // Kiểm tra các điều kiện
    if (!voucher) {
      res.status(404).json({ message: "Mã giảm giá không tồn tại" });
      return;
    }

    if (voucher.status !== "active") {
      res.status(400).json({ message: "Mã giảm giá không khả dụng" });
      return;
    }

    const currentDate = new Date();
    if (voucher.expirationDate < currentDate) {
      res.status(400).json({ message: "Mã giảm giá đã hết hạn" });
      return;
    }

    if (voucher.usageLimit > 0 && voucher.usageCount >= voucher.usageLimit) {
      res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });
      return;
    }

    if (orderTotal < voucher.minOrderValue) {
      res.status(400).json({
        message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString(
          "vi-VN"
        )}đ để áp dụng mã này`,
      });
      return;
    }

    // Tính số tiền giảm giá
    let discountAmount = 0;
    if (voucher.type === "percentage") {
      discountAmount = Math.floor((orderTotal * voucher.value) / 100);
    } else {
      discountAmount = voucher.value;
    }

    res.status(200).json({
      id: voucher.id,
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      minOrderValue: voucher.minOrderValue,
      discountAmount: discountAmount,
      description: voucher.description,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật lượng sử dụng voucher
export const incrementVoucherUsage = async (
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

    // Tăng số lần sử dụng
    await voucher.update({
      usageCount: voucher.usageCount + 1,
    });

    res.status(200).json({
      message: "Đã cập nhật lượt sử dụng voucher",
      newCount: voucher.usageCount + 1,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách voucher khả dụng cho người dùng
export const getUserAvailableVouchers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Lấy tất cả voucher còn hiệu lực và active
    const currentDate = new Date();
    const vouchers = await Voucher.findAll({
      where: {
        status: "active",
        expirationDate: { [Op.gt]: currentDate },
        [Op.or]: [
          { usageLimit: 0 }, // không giới hạn sử dụng
          { usageCount: { [Op.lt]: Voucher.sequelize!.col("usageLimit") } }, // số lần dùng < giới hạn
        ],
      },
      order: [["expirationDate", "ASC"]], // Sắp xếp theo ngày hết hạn gần nhất
    });

    // Chuyển đổi dữ liệu voucher sang định dạng phù hợp với client
    const formattedVouchers = vouchers.map((voucher) => ({
      id: voucher.id,
      title: formatVoucherTitle(voucher),
      expiry: new Date(voucher.expirationDate).toLocaleDateString("vi-VN"),
      code: voucher.code,
      minOrderValue: voucher.minOrderValue,
      description: voucher.description || "",
      type: voucher.type,
      value: voucher.value,
    }));

    res.status(200).json(formattedVouchers);
  } catch (error: any) {
    console.error("Error fetching user vouchers:", error);
    res.status(500).json({ message: error.message });
  }
};

// Hàm hỗ trợ format tiêu đề voucher
function formatVoucherTitle(voucher: any): string {
  if (voucher.type === "percentage") {
    return `Giảm ${voucher.value}% cho đơn hàng`;
  } else {
    return `Giảm ${voucher.value.toLocaleString("vi-VN")}đ cho đơn hàng`;
  }
}
