"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProductSuitability = exports.addProductSuitability = exports.deleteSuitability = exports.updateSuitability = exports.getAllSuitabilities = exports.updateSuitabilityOrder = exports.createSuitability = void 0;
const Suitability_1 = __importDefault(require("../models/Suitability"));
const ProductSuitability_1 = __importDefault(require("../models/ProductSuitability"));
const db_1 = __importDefault(require("../config/db"));
// Tạo mới một suitability
const createSuitability = async (req, res) => {
    try {
        const { name, description, slug } = req.body;
        const newSuitability = await Suitability_1.default.create({
            name,
            description,
            slug,
        });
        res.status(201).json(newSuitability);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createSuitability = createSuitability;
const updateSuitabilityOrder = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            await t.rollback();
            res.status(400).json({ message: "Items phải là một mảng" });
            return;
        }
        // Sử dụng bulkCreate với updateOnDuplicate để hiệu quả hơn
        await Suitability_1.default.bulkCreate(items.map((item) => ({
            id: item.id,
            sortOrder: item.sortOrder,
        })), {
            updateOnDuplicate: ["sortOrder"],
            transaction: t,
        });
        await t.commit();
        res.status(200).json({ message: "Cập nhật thứ tự thành công" });
    }
    catch (error) {
        await t.rollback();
        console.error("Lỗi khi cập nhật thứ tự:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateSuitabilityOrder = updateSuitabilityOrder;
const getAllSuitabilities = async (req, res) => {
    try {
        const suitabilities = await Suitability_1.default.findAll({
            order: [
                ["sortOrder", "ASC"],
                ["id", "ASC"],
            ],
        });
        res.status(200).json(suitabilities);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllSuitabilities = getAllSuitabilities;
// Cập nhật suitability
const updateSuitability = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, slug } = req.body;
        const suitability = await Suitability_1.default.findByPk(id);
        if (!suitability) {
            res.status(404).json({ message: "Suitability không tồn tại" });
            return;
        }
        await suitability.update({ name, description, slug });
        res.json({ message: "Cập nhật thành công", suitability });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateSuitability = updateSuitability;
// Xóa suitability
const deleteSuitability = async (req, res) => {
    try {
        const { id } = req.params;
        const suitability = await Suitability_1.default.findByPk(id);
        if (!suitability) {
            res.status(404).json({ message: "Suitability không tồn tại" });
            return;
        }
        await suitability.destroy();
        res.json({ message: "Xóa thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteSuitability = deleteSuitability;
// Thêm suitability cho sản phẩm
const addProductSuitability = async (req, res) => {
    try {
        const { productId, suitabilityId } = req.body;
        await ProductSuitability_1.default.create({ productId, suitabilityId });
        res.status(201).json({ message: "Thêm thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addProductSuitability = addProductSuitability;
// Xóa suitability khỏi sản phẩm
const removeProductSuitability = async (req, res) => {
    try {
        const { productId, suitabilityId } = req.params;
        await ProductSuitability_1.default.destroy({
            where: { productId, suitabilityId },
        });
        res.json({ message: "Xóa thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.removeProductSuitability = removeProductSuitability;
