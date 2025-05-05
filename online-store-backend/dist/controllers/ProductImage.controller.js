"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMainImage = exports.deleteProductImage = exports.uploadProductImages = void 0;
const ProductImage_1 = __importDefault(require("../models/ProductImage"));
const ProductDetail_1 = __importDefault(require("../models/ProductDetail"));
const imageUpload_1 = require("../services/imageUpload");
// Upload ảnh cho một ProductDetail
const uploadProductImages = async (req, res) => {
    try {
        const { productDetailId } = req.params;
        // Đây là kiểu của multer-s3 v3
        const files = req.files;
        const { isMain } = req.body;
        // Kiểm tra ProductDetail có tồn tại không
        const productDetail = await ProductDetail_1.default.findByPk(productDetailId);
        if (!productDetail) {
            res.status(404).json({ message: "Chi tiết sản phẩm không tồn tại" });
            return;
        }
        // Nếu đánh dấu là hình ảnh chính, reset tất cả các hình ảnh khác
        if (isMain) {
            await ProductImage_1.default.update({ isMain: false }, { where: { productDetailId } });
        }
        // Xác định displayOrder cho các hình ảnh mới
        const lastImage = await ProductImage_1.default.findOne({
            where: { productDetailId },
            order: [["displayOrder", "DESC"]],
        });
        const startOrder = lastImage
            ? lastImage.getDataValue("displayOrder") + 1
            : 0;
        // Lưu thông tin các file đã upload
        const savedImages = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i]; // Vì multer-s3 thêm trường không có trong Express.Multer.File
            // URL của ảnh trên S3
            const url = file.location; // multer-s3 tự động cung cấp location
            console.log("File uploaded to S3:", {
                name: file.originalname,
                size: file.size,
                location: url,
            });
            const image = await ProductImage_1.default.create({
                productDetailId,
                url,
                isMain: isMain && i === 0, // Chỉ file đầu tiên là main nếu có yêu cầu
                displayOrder: startOrder + i,
            });
            savedImages.push({
                id: image.id,
                url: image.getDataValue("url"),
                isMain: image.getDataValue("isMain"),
                displayOrder: image.getDataValue("displayOrder"),
            });
        }
        res.status(201).json({
            message: "Upload ảnh thành công",
            images: savedImages,
        });
    }
    catch (error) {
        console.error("Error in uploadProductImages:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.uploadProductImages = uploadProductImages;
// Xóa một ảnh sản phẩm
const deleteProductImage = async (req, res) => {
    try {
        const { id } = req.params;
        const image = await ProductImage_1.default.findByPk(id);
        if (!image) {
            res.status(404).json({ message: "Không tìm thấy ảnh" });
            return;
        }
        // Lấy URL để xóa file từ S3
        const imageUrl = image.getDataValue("url");
        // Xóa record trong database
        await image.destroy();
        // Xóa file từ S3
        await (0, imageUpload_1.deleteFile)(imageUrl);
        res.status(200).json({ message: "Xóa ảnh thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteProductImage = deleteProductImage;
// Đặt một ảnh làm ảnh chính
const setMainImage = async (req, res) => {
    try {
        const { id } = req.params;
        const image = await ProductImage_1.default.findByPk(id);
        if (!image) {
            res.status(404).json({ message: "Không tìm thấy ảnh" });
            return;
        }
        const productDetailId = image.getDataValue("productDetailId");
        // Reset tất cả ảnh của productDetail này
        await ProductImage_1.default.update({ isMain: false }, { where: { productDetailId } });
        // Đặt ảnh này làm ảnh chính
        await image.update({ isMain: true });
        res.status(200).json({
            message: "Đã đặt làm ảnh chính",
            image: {
                id: image.id,
                url: image.getDataValue("url"),
                isMain: true,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.setMainImage = setMainImage;
