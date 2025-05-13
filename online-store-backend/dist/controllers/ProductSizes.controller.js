"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSize = exports.updateSize = exports.createSize = exports.getSizesByCategory = exports.getAllSizes = void 0;
const ProductSize_1 = require("../models/ProductSize");
const db_1 = __importDefault(require("../config/db"));
// Lấy tất cả kích thước
const getAllSizes = async (req, res) => {
    try {
        console.log("đang chạy getAllSizes");
        const sizes = await ProductSize_1.ProductSize.findAll({
            order: [["displayOrder", "ASC"]],
        });
        res.status(200).json(sizes);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllSizes = getAllSizes;
// Lấy kích thước theo danh mục
const getSizesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.query; // Lấy categoryId từ query params
        if (!categoryId) {
            res.status(400).json({ message: "ID danh mục không được để trống" });
            return;
        }
        // Chuyển đổi categoryId từ string sang number
        const categoryIdNumber = parseInt(categoryId.toString());
        if (isNaN(categoryIdNumber)) {
            res.status(400).json({ message: "ID danh mục phải là số" });
            return;
        }
        const sizes = await ProductSize_1.ProductSize.findAll({
            // Lọc theo categoryId và chỉ lấy kích thước đang hoạt động
            where: {
                categoryId: categoryIdNumber,
                active: true,
            },
            // Sắp xếp theo displayOrder tăng dần
            order: [["displayOrder", "ASC"]],
        });
        if (sizes.length === 0) {
            res
                .status(404)
                .json({ message: "Không tìm thấy kích thước cho danh mục này" });
            return;
        }
        res.status(200).json(sizes);
    }
    catch (error) {
        console.error("Lỗi khi lấy kích thước theo danh mục:", error);
        res.status(500).json({
            message: "Có lỗi xảy ra khi lấy kích thước",
            error: error.message,
        });
    }
};
exports.getSizesByCategory = getSizesByCategory;
// Thêm kích thước mới
const createSize = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { value, displayName, categoryId, displayOrder } = req.body;
        // Kiểm tra kích thước đã tồn tại chưa
        const existingSize = await ProductSize_1.ProductSize.findOne({
            where: { value },
            transaction: t,
        });
        if (existingSize) {
            await t.rollback();
            res.status(400).json({ message: "Kích thước này đã tồn tại" });
            return;
        }
        const newSize = await ProductSize_1.ProductSize.create({
            value,
            displayName: displayName || value,
            categoryId: Number(categoryId),
            displayOrder: displayOrder || 0,
            active: true,
        }, { transaction: t });
        await t.commit();
        res.status(201).json(newSize);
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
exports.createSize = createSize;
// Cập nhật kích thước
const updateSize = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { id } = req.params;
        const { value, displayName, category, displayOrder, active } = req.body;
        const size = await ProductSize_1.ProductSize.findByPk(id, { transaction: t });
        if (!size) {
            await t.rollback();
            res.status(404).json({ message: "Không tìm thấy kích thước" });
            return;
        }
        await size.update({
            value: value || size.getDataValue("value"),
            displayName: displayName || size.getDataValue("displayName"),
            category: category || size.getDataValue("category"),
            displayOrder: displayOrder !== undefined
                ? displayOrder
                : size.getDataValue("displayOrder"),
            active: active !== undefined ? active : size.getDataValue("active"),
        }, { transaction: t });
        await t.commit();
        res.status(200).json(size);
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
exports.updateSize = updateSize;
// Xóa kích thước
const deleteSize = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { id } = req.params;
        const size = await ProductSize_1.ProductSize.findByPk(id, { transaction: t });
        if (!size) {
            await t.rollback();
            res.status(404).json({ message: "Không tìm thấy kích thước" });
            return;
        }
        // Kiểm tra xem kích thước đã được sử dụng chưa
        // Nếu đã sử dụng, chỉ vô hiệu hóa thay vì xóa
        // Code kiểm tra sản phẩm sẽ được thêm ở đây
        await size.destroy({ transaction: t });
        await t.commit();
        res.status(200).json({ message: "Xóa kích thước thành công" });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
exports.deleteSize = deleteSize;
