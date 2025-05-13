"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementVoucherUsage = exports.validateVoucher = exports.deleteVoucher = exports.updateVoucher = exports.getVoucherByCode = exports.getVouchers = exports.createVoucher = void 0;
const Voucher_1 = __importDefault(require("../models/Voucher"));
const sequelize_1 = require("sequelize");
// tạo voucher
const createVoucher = async (req, res) => {
    try {
        const { code, type, value, expirationDate, minOrderValue = 0, description = "", usageLimit = 0, status = "active", } = req.body;
        // Kiểm tra nếu voucher đã tồn tại
        const existingVoucher = await Voucher_1.default.findOne({ where: { code } });
        if (existingVoucher) {
            res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
            return;
        }
        const newVoucher = await Voucher_1.default.create({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createVoucher = createVoucher;
// lấy danh sách tất cả các Voucher
const getVouchers = async (req, res) => {
    try {
        // Thêm tùy chọn lọc theo trạng thái hoạt động
        const { status } = req.query;
        const where = {};
        if (status === "active") {
            Object.assign(where, {
                status: "active",
                expirationDate: { [sequelize_1.Op.gt]: new Date() },
            });
        }
        else if (status) {
            Object.assign(where, { status });
        }
        const vouchers = await Voucher_1.default.findAll({ where });
        res.status(200).json(vouchers);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getVouchers = getVouchers;
// lấy chi tiết một voucher theo code
const getVoucherByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const voucher = await Voucher_1.default.findOne({ where: { code } });
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getVoucherByCode = getVoucherByCode;
// cập nhật một voucher
const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, type, value, expirationDate, minOrderValue, status, description, usageLimit, } = req.body;
        const voucher = await Voucher_1.default.findByPk(id);
        if (!voucher) {
            res.status(404).json({ message: "Voucher không tồn tại" });
            return;
        }
        // Kiểm tra nếu thay đổi code và code mới đã tồn tại
        if (code !== voucher.code) {
            const existingVoucher = await Voucher_1.default.findOne({ where: { code } });
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateVoucher = updateVoucher;
// Xóa một voucher
const deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const voucher = await Voucher_1.default.findByPk(id);
        if (!voucher) {
            res.status(404).json({ message: "Voucher không tồn tại" });
            return;
        }
        // Xóa Voucher
        await voucher.destroy();
        res.status(200).json({ message: "Xóa Voucher thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteVoucher = deleteVoucher;
// Áp dụng voucher vào đơn hàng (kiểm tra giá trị đơn hàng)
const validateVoucher = async (req, res) => {
    try {
        const { code, orderTotal } = req.body;
        if (!code) {
            res.status(400).json({ message: "Vui lòng nhập mã giảm giá" });
            return;
        }
        const voucher = await Voucher_1.default.findOne({ where: { code } });
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
                message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString("vi-VN")}đ để áp dụng mã này`,
            });
            return;
        }
        // Tính số tiền giảm giá
        let discountAmount = 0;
        if (voucher.type === "percentage") {
            discountAmount = Math.floor((orderTotal * voucher.value) / 100);
        }
        else {
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.validateVoucher = validateVoucher;
// Cập nhật lượng sử dụng voucher
const incrementVoucherUsage = async (req, res) => {
    try {
        const { id } = req.params;
        const voucher = await Voucher_1.default.findByPk(id);
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.incrementVoucherUsage = incrementVoucherUsage;
