"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCategoryFromProduct = exports.addCategoryToProduct = void 0;
const ProductCategory_1 = __importDefault(require("../models/ProductCategory"));
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
// Thêm danh mục vào sản phẩm
const addCategoryToProduct = async (req, res) => {
    try {
        const { productId, categoryId } = req.body;
        // Kiểm tra sản phẩm và danh mục có tồn tại không
        const product = await Product_1.default.findByPk(productId);
        const category = await Category_1.default.findByPk(categoryId);
        if (!product || !category) {
            res.status(404).json({ message: "Sản phẩm hoặc danh mục không tồn tại" });
            return;
        }
        // nếu danh mục có rồi thì báo lỗi
        const existingProductCategory = await ProductCategory_1.default.findOne({
            where: { productId, categoryId },
        });
        // nếu đã có rồi thì thông báo là đã có rồi
        if (existingProductCategory) {
            res.status(400).json({
                message: "Danh mục đã được thêm vào sản phẩm này",
            });
            return;
        }
        // Thêm danh mục vào sản phẩm
        await ProductCategory_1.default.create({ productId, categoryId });
        res.status(201).json({
            message: "Thêm danh mục vào sản phẩm thành công",
            productId,
            categoryId,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addCategoryToProduct = addCategoryToProduct;
// Xóa danh mục khỏi sản phẩm
const removeCategoryFromProduct = async (req, res) => {
    try {
        const { productId, categoryId } = req.body;
        // Xóa mối quan hệ giữa sản phẩm và danh mục
        const result = await ProductCategory_1.default.destroy({
            where: { productId, categoryId },
        });
        if (result === 0) {
            res.status(404).json({ message: "Không tìm thấy mối quan hệ để xóa" });
            return;
        }
        res.status(200).json({ message: "Xóa danh mục khỏi sản phẩm thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.removeCategoryFromProduct = removeCategoryFromProduct;
