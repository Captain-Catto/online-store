"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVoucher = exports.updateVoucher = exports.getVoucherByCode = exports.getVouchers = exports.createVoucher = void 0;
const Voucher_1 = __importDefault(require("../models/Voucher"));
// tạo voucher
const createVoucher = async (req, res) => {
    try {
        const { code, type, value, expirationDate } = req.body;
        // Kiểm tra nếu voucher đã tồn tại
        const existingVoucher = await Voucher_1.default.findOne({ where: { code } });
        if (existingVoucher) {
            res.status(400).json({ message: "Voucher đã tồn tại" });
            return;
        }
        const newVoucher = await Voucher_1.default.create({
            code,
            type,
            value,
            expirationDate,
        });
        res.status(201).json(newVoucher);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createVoucher = createVoucher;
// lấy danh sách tất cả các Voucher
const getVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher_1.default.findAll();
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
            res.status(404).json({ message: "Voucher không tồn tại" });
            return;
        }
        res.status(200).json(voucher);
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
        const { code, type, value, expirationDate } = req.body;
        const voucher = await Voucher_1.default.findByPk(id);
        if (!voucher) {
            res.status(404).json({ message: "Voucher không tồn tại" });
            return;
        }
        // Cập nhật voucher
        await voucher.update({ code, type, value, expirationDate });
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
