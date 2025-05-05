"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkWishlistItem = exports.removeFromWishlist = exports.addToWishlist = exports.getUserWishlist = void 0;
const Wishlist_1 = __importDefault(require("../models/Wishlist"));
const Product_1 = __importDefault(require("../models/Product"));
const ProductDetail_1 = __importDefault(require("../models/ProductDetail"));
const ProductImage_1 = __importDefault(require("../models/ProductImage"));
const ProductInventory_1 = __importDefault(require("../models/ProductInventory"));
const Category_1 = __importDefault(require("../models/Category"));
// Lấy danh sách yêu thích của người dùng đang đăng nhập (có phân trang)
const getUserWishlist = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Parse query parameters for pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        // Count total wishlist items for pagination
        const totalItems = await Wishlist_1.default.count({
            where: { userId: req.user.id },
        });
        // Fetch wishlist items with pagination và đầy đủ thông tin
        const wishlistItems = await Wishlist_1.default.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Product_1.default,
                    as: "product",
                    attributes: [
                        "id",
                        "name",
                        "sku",
                        "description",
                        "brand",
                        "material",
                        "featured",
                        "status",
                    ],
                    include: [
                        {
                            model: ProductDetail_1.default,
                            as: "details",
                            attributes: ["id", "color", "price", "originalPrice"],
                            include: [
                                {
                                    model: ProductImage_1.default,
                                    as: "images",
                                    attributes: ["id", "url", "isMain"],
                                },
                                {
                                    model: ProductInventory_1.default,
                                    as: "inventories",
                                    attributes: ["id", "size", "stock"],
                                },
                            ],
                        },
                        {
                            model: Category_1.default,
                            as: "categories",
                            through: { attributes: [] },
                            attributes: ["id", "name", "slug"],
                        },
                    ],
                },
            ],
            limit,
            offset,
            order: [["createdAt", "DESC"]], // Sắp xếp theo thời gian tạo mới nhất
        });
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalItems / limit);
        res.status(200).json({
            items: wishlistItems,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    }
    catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getUserWishlist = getUserWishlist;
// Thêm sản phẩm vào danh sách yêu thích
const addToWishlist = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { productId } = req.body;
        if (!productId) {
            res.status(400).json({ message: "Product ID is required" });
            return;
        }
        // Kiểm tra sự tồn tại của sản phẩm
        const productExists = await Product_1.default.findByPk(productId);
        if (!productExists) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Kiểm tra nếu sản phẩm đã có trong danh sách yêu thích
        const existingItem = await Wishlist_1.default.findOne({
            where: {
                userId: req.user.id,
                productId,
            },
        });
        if (existingItem) {
            res.status(400).json({ message: "Product already in wishlist" });
            return;
        }
        // Thêm vào danh sách yêu thích
        const wishlistItem = await Wishlist_1.default.create({
            userId: req.user.id,
            productId,
        });
        res.status(201).json({
            message: "Product added to wishlist successfully",
            data: wishlistItem,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addToWishlist = addToWishlist;
// Xóa sản phẩm khỏi danh sách yêu thích
const removeFromWishlist = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { productId } = req.params;
        // Tìm và xóa mục yêu thích
        const deleted = await Wishlist_1.default.destroy({
            where: {
                userId: req.user.id,
                productId,
            },
        });
        if (deleted === 0) {
            res.status(404).json({ message: "Item not found in wishlist" });
            return;
        }
        res
            .status(200)
            .json({ message: "Item removed from wishlist successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.removeFromWishlist = removeFromWishlist;
// Kiểm tra xem sản phẩm có trong danh sách yêu thích không
const checkWishlistItem = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { productId } = req.params;
        const item = await Wishlist_1.default.findOne({
            where: {
                userId: req.user.id,
                productId,
            },
        });
        res.status(200).json({
            inWishlist: !!item,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.checkWishlistItem = checkWishlistItem;
