"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductDetail = exports.updateProductDetail = exports.getProductDetailsByProductId = exports.getProductDetailById = exports.getProductDetails = exports.createProductDetail = void 0;
const ProductDetail_1 = __importDefault(require("../models/ProductDetail"));
const Product_1 = __importDefault(require("../models/Product"));
// Tạo chi tiết sản phẩm
const createProductDetail = async (req, res) => {
    try {
        const { productId, color, size, stock, images } = req.body;
        // Tạo đường dẫn hình ảnh tĩnh
        const imagePath = JSON.stringify(images); // Lưu các hình ảnh dưới dạng chuỗi JSON
        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product_1.default.findByPk(productId);
        if (!product) {
            res.status(404).json({ message: "Sản phẩm không tồn tại" });
            return;
        }
        // Tạo chi tiết sản phẩm
        const productDetail = await ProductDetail_1.default.create({
            productId,
            color,
            size,
            stock,
            imagePath,
        });
        res.status(201).json({
            ...productDetail.toJSON(),
            images: images,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createProductDetail = createProductDetail;
// Lấy chi tiết sản phẩm
// Lấy tất cả chi tiết sản phẩm với hình ảnh được parse
const getProductDetails = async (req, res) => {
    try {
        const productDetails = await ProductDetail_1.default.findAll();
        // Map qua mỗi productDetail để parse imagePath
        const formattedProductDetails = productDetails.map((detail) => {
            let images = [];
            try {
                images = JSON.parse(detail.getDataValue("imagePath") || "[]");
            }
            catch (e) {
                images = [];
            }
            return {
                ...detail.toJSON(),
                images,
            };
        });
        res.status(200).json(formattedProductDetails);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProductDetails = getProductDetails;
// Lấy chi tiết sản phẩm theo id
const getProductDetailById = async (req, res) => {
    try {
        const { id } = req.params;
        const productDetail = await ProductDetail_1.default.findByPk(id);
        if (!productDetail) {
            res.status(404).json({ message: "Không tìm thấy chi tiết sản phẩm" });
            return;
        }
        // Parse imagePath từ JSON string thành mảng
        let images = [];
        try {
            images = JSON.parse(productDetail.getDataValue("imagePath") || "[]");
        }
        catch (e) {
            images = [];
        }
        // Trả về response với images đã được parse
        res.status(200).json({
            ...productDetail.toJSON(),
            images,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProductDetailById = getProductDetailById;
// lấy chi tiết sản phẩm theo id sản phẩm
const getProductDetailsByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log(productId);
        if (!productId) {
            res.status(400).json({ message: "Thiếu id sản phẩm" });
            return;
        }
        const productDetails = await ProductDetail_1.default.findAll({
            where: { productId },
        });
        res.status(200).json(productDetails);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProductDetailsByProductId = getProductDetailsByProductId;
// Cập nhật chi tiết sản phẩm
const updateProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const { color, size, stock } = req.body;
        const productDetail = await ProductDetail_1.default.findByPk(id);
        if (!productDetail) {
            res.status(404).json({ message: "Không tìm thấy chi tiết sản phẩm" });
            return;
        }
        await productDetail.update({ color, size, stock });
        res.status(200).json(productDetail);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProductDetail = updateProductDetail;
// Xóa chi tiết sản phẩm
const deleteProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const productDetail = await ProductDetail_1.default.findByPk(id);
        if (!productDetail) {
            res.status(404).json({ message: "Không tìm thấy chi tiết sản phẩm" });
            return;
        }
        await productDetail.destroy();
        res.status(200).json({ message: "Xóa thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteProductDetail = deleteProductDetail;
