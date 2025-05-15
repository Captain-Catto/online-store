"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStockAvailability = exports.mergeCartFromCookies = exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.addItemToCart = exports.getUserCart = void 0;
const Cart_1 = __importDefault(require("../models/Cart"));
const CartItem_1 = __importDefault(require("../models/CartItem"));
const Product_1 = __importDefault(require("../models/Product"));
const ProductDetail_1 = __importDefault(require("../models/ProductDetail"));
const ProductImage_1 = __importDefault(require("../models/ProductImage"));
const ProductInventory_1 = __importDefault(require("../models/ProductInventory"));
// Lấy giỏ hàng của người dùng đăng nhập
const getUserCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Tìm hoặc tạo giỏ hàng cho người dùng
        const [cart] = await Cart_1.default.findOrCreate({
            where: { userId },
            defaults: { userId },
        });
        // Lấy tất cả items trong giỏ hàng với thông tin sản phẩm
        const cartItems = await CartItem_1.default.findAll({
            where: { cartId: cart.id },
            include: [
                {
                    model: Product_1.default,
                    as: "product",
                    attributes: ["id", "name", "sku"],
                },
                {
                    model: ProductDetail_1.default,
                    as: "productDetail",
                    attributes: ["id", "price", "originalPrice"],
                    include: [
                        {
                            model: ProductImage_1.default,
                            as: "images",
                            where: { isMain: true },
                            required: false,
                            attributes: ["url"],
                            limit: 1,
                        },
                    ],
                },
            ],
        });
        // Format dữ liệu trả về
        const formattedItems = cartItems.map((item) => {
            const product = item.get("product");
            const productDetail = item.get("productDetail");
            const image = productDetail?.images?.[0]?.url || null;
            return {
                id: `${item.productId}-${item.color}-${item.size}`,
                cartItemId: item.id,
                productId: item.productId,
                productDetailId: productDetail.id,
                name: product.name,
                price: productDetail.price,
                originalPrice: productDetail.originalPrice,
                quantity: item.quantity,
                color: item.color,
                size: item.size,
                image: image,
            };
        });
        res.status(200).json({
            cartId: cart.id,
            items: formattedItems,
            totalItems: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        });
    }
    catch (error) {
        console.error("Error getting cart:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getUserCart = getUserCart;
// Thêm sản phẩm vào giỏ hàng
const addItemToCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { productId, productDetailId, quantity, color, size } = req.body;
        if (!productId || !productDetailId || !quantity || !color || !size) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        // Tìm hoặc tạo giỏ hàng
        const [cart] = await Cart_1.default.findOrCreate({
            where: { userId },
            defaults: { userId },
        });
        // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
        const existingItem = await CartItem_1.default.findOne({
            where: {
                cartId: cart.id,
                productId,
                color,
                size,
            },
        });
        if (existingItem) {
            // Cập nhật số lượng
            existingItem.quantity += quantity;
            await existingItem.save();
            res.status(200).json({
                message: "Updated item quantity",
                item: existingItem,
            });
        }
        else {
            // Thêm mới
            const newItem = await CartItem_1.default.create({
                cartId: cart.id,
                productId,
                productDetailId,
                quantity,
                color,
                size,
            });
            res.status(201).json({
                message: "Item added to cart",
                item: newItem,
            });
        }
    }
    catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.addItemToCart = addItemToCart;
// Cập nhật số lượng sản phẩm
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user?.id;
        const itemId = parseInt(req.params.id);
        const { quantity } = req.body;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (isNaN(itemId) || quantity === undefined) {
            res.status(400).json({ message: "Invalid request" });
            return;
        }
        // Tìm cart của user
        const cart = await Cart_1.default.findOne({ where: { userId } });
        if (!cart) {
            res.status(404).json({ message: "Cart not found" });
            return;
        }
        // Tìm cartItem
        const cartItem = await CartItem_1.default.findOne({
            where: { id: itemId, cartId: cart.id },
        });
        if (!cartItem) {
            res.status(404).json({ message: "Item not found in cart" });
            return;
        }
        if (quantity <= 0) {
            // Xóa item nếu số lượng <= 0
            await cartItem.destroy();
            res.status(200).json({ message: "Item removed from cart" });
        }
        else {
            // Cập nhật số lượng
            cartItem.quantity = quantity;
            await cartItem.save();
            res
                .status(200)
                .json({ message: "Item quantity updated", item: cartItem });
        }
    }
    catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateCartItem = updateCartItem;
// Xóa sản phẩm khỏi giỏ hàng
const removeCartItem = async (req, res) => {
    try {
        const userId = req.user?.id;
        const itemId = parseInt(req.params.id);
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Tìm cart của user
        const cart = await Cart_1.default.findOne({ where: { userId } });
        if (!cart) {
            res.status(404).json({ message: "Cart not found" });
            return;
        }
        // Tìm và xóa cartItem
        const cartItem = await CartItem_1.default.findOne({
            where: { id: itemId, cartId: cart.id },
        });
        if (!cartItem) {
            res.status(404).json({ message: "Item not found in cart" });
            return;
        }
        await cartItem.destroy();
        res.status(200).json({ message: "Item removed from cart" });
    }
    catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.removeCartItem = removeCartItem;
// Xóa toàn bộ giỏ hàng
const clearCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Tìm cart của user
        const cart = await Cart_1.default.findOne({ where: { userId } });
        if (!cart) {
            res.status(404).json({ message: "Cart not found" });
            return;
        }
        // Xóa tất cả items trong cart
        await CartItem_1.default.destroy({ where: { cartId: cart.id } });
        res.status(200).json({ message: "Cart cleared" });
    }
    catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.clearCart = clearCart;
// Merge giỏ hàng từ cookies vào database (cho trường hợp user vừa đăng nhập)
const mergeCartFromCookies = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { cartItems } = req.body;
        if (!userId || !cartItems || !Array.isArray(cartItems)) {
            res.status(400).json({ message: "Invalid request" });
            return;
        }
        // Tìm hoặc tạo cart cho user
        const [cart] = await Cart_1.default.findOrCreate({
            where: { userId },
            defaults: { userId },
        });
        // Xử lý từng item trong cookie cart
        for (const item of cartItems) {
            const { productId, color, size, quantity } = item;
            // Tìm ProductDetail để lưu vào cart
            const productDetail = await ProductDetail_1.default.findOne({
                where: { productId, color },
            });
            if (!productDetail)
                continue;
            // Kiểm tra item đã tồn tại trong db cart chưa
            const existingItem = await CartItem_1.default.findOne({
                where: {
                    cartId: cart.id,
                    productId,
                    color,
                    size,
                },
            });
            if (existingItem) {
                // Cập nhật số lượng
                existingItem.quantity += quantity;
                await existingItem.save();
            }
            else {
                // Thêm mới
                await CartItem_1.default.create({
                    cartId: cart.id,
                    productId,
                    productDetailId: productDetail.id,
                    quantity,
                    color,
                    size,
                });
            }
        }
        // Lấy lại giỏ hàng đã cập nhật
        const updatedCartItems = await CartItem_1.default.findAll({
            where: { cartId: cart.id },
            include: [
                {
                    model: Product_1.default,
                    as: "product",
                    attributes: ["id", "name", "sku"],
                },
                {
                    model: ProductDetail_1.default,
                    as: "productDetail",
                    attributes: ["id", "price", "originalPrice"],
                    include: [
                        {
                            model: ProductImage_1.default,
                            as: "images",
                            where: { isMain: true },
                            required: false,
                            attributes: ["url"],
                            limit: 1,
                        },
                    ],
                },
            ],
        });
        res.status(200).json({
            message: "Cart merged successfully",
            cartId: cart.id,
            itemCount: updatedCartItems.length,
        });
    }
    catch (error) {
        console.error("Error merging cart:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.mergeCartFromCookies = mergeCartFromCookies;
// Kiểm tra tồn kho sản phẩm trong giỏ hàng
const checkStockAvailability = async (req, res) => {
    try {
        // đổi flow, ng dùng ko cần đăng nhập vẫn có thể kiểm tra tồn kho
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            res.status(400).json({ message: "Invalid items data" });
            return;
        }
        const invalidItems = [];
        // Kiểm tra từng sản phẩm
        for (const item of items) {
            const { productDetailId, size, quantity } = item;
            // Kiểm tra dữ liệu đầu vào
            if (!productDetailId || !size || !quantity) {
                continue; // Bỏ qua item không hợp lệ
            }
            // Lấy thông tin chi tiết sản phẩm
            const productDetail = await ProductDetail_1.default.findByPk(productDetailId, {
                include: [
                    {
                        model: Product_1.default,
                        as: "product",
                        attributes: ["id", "name"],
                    },
                ],
            });
            if (!productDetail) {
                invalidItems.push({
                    id: productDetailId,
                    name: "Sản phẩm không xác định",
                    available: 0,
                    requested: quantity,
                });
                continue;
            }
            // Lấy thông tin tồn kho
            const inventory = await ProductInventory_1.default.findOne({
                where: {
                    productDetailId,
                    size,
                },
            });
            // Nếu không tìm thấy thông tin tồn kho
            if (!inventory) {
                invalidItems.push({
                    id: productDetailId,
                    name: productDetail.getDataValue("product").name,
                    color: productDetail.getDataValue("color"),
                    size: size,
                    available: 0,
                    requested: quantity,
                    message: `Size ${size} cho sản phẩm không tồn tại`,
                });
                continue;
            }
            // Kiểm tra số lượng tồn kho - sử dụng getDataValue như trong createOrder
            const availableStock = inventory.getDataValue("stock");
            if (availableStock === 0) {
                invalidItems.push({
                    id: productDetailId,
                    name: productDetail.getDataValue("product").name,
                    color: productDetail.getDataValue("color"),
                    size: size,
                    available: 0,
                    requested: quantity,
                    message: `Sản phẩm đã hết hàng`,
                });
                continue;
            }
            // Kiểm tra số lượng
            if (availableStock < quantity) {
                invalidItems.push({
                    id: productDetailId,
                    name: productDetail.getDataValue("product").name,
                    color: productDetail.getDataValue("color"),
                    size: size,
                    available: availableStock,
                    requested: quantity,
                    message: `Chỉ còn ${availableStock} sản phẩm có sẵn`,
                });
            }
        }
        // Trả về kết quả
        res.status(200).json({
            valid: invalidItems.length === 0,
            invalidItems,
        });
    }
    catch (error) {
        console.error("Error checking stock availability:", error);
        res.status(500).json({
            message: "Server error khi kiểm tra tồn kho",
            error: error.message,
        });
    }
};
exports.checkStockAvailability = checkStockAvailability;
