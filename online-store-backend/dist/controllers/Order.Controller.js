"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOrdersByAdmin = exports.calculateShippingFeeForCart = exports.cancelOrder = exports.updateOrderStatus = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const db_1 = __importDefault(require("../config/db"));
const Order_1 = __importDefault(require("../models/Order"));
const OrderDetail_1 = __importDefault(require("../models/OrderDetail"));
const ProductInventory_1 = __importDefault(require("../models/ProductInventory"));
const ProductDetail_1 = __importDefault(require("../models/ProductDetail"));
const Voucher_1 = __importDefault(require("../models/Voucher"));
const Product_1 = __importDefault(require("../models/Product"));
const ProductImage_1 = __importDefault(require("../models/ProductImage"));
const Users_1 = __importDefault(require("../models/Users"));
/**
 * Create a new order
 */
const createOrder = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { items, paymentMethodId, voucherId, shippingAddress, phoneNumber } = req.body;
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Lấy user ID từ token
        const userId = req.user.id;
        if (!items || !items.length) {
            await t.rollback();
            res.status(400).json({ message: "Giỏ hàng trống" });
            return;
        }
        // Validate items và tính tổng giá
        let total = 0;
        const orderItems = [];
        for (const item of items) {
            // Kiểm tra productDetail tồn tại và có màu phù hợp
            const productDetail = await ProductDetail_1.default.findOne({
                where: { productId: item.productId, color: item.color },
                transaction: t,
                include: [
                    { model: Product_1.default, as: "product" },
                    {
                        model: ProductImage_1.default,
                        as: "images",
                        where: { isMain: true },
                        required: false,
                        limit: 1,
                    },
                ],
            });
            if (!productDetail) {
                await t.rollback();
                res.status(404).json({
                    message: `Sản phẩm ID ${item.productId} với màu ${item.color} không tồn tại`,
                });
                return;
            }
            // Kiểm tra size và stock
            const inventory = await ProductInventory_1.default.findOne({
                where: {
                    productDetailId: productDetail.id,
                    size: item.size,
                },
                transaction: t,
            });
            if (!inventory) {
                await t.rollback();
                res.status(404).json({
                    message: `Size ${item.size} cho sản phẩm với màu ${item.color} không tồn tại`,
                });
                return;
            }
            if (inventory.getDataValue("stock") < item.quantity) {
                await t.rollback();
                res.status(400).json({
                    message: `Số lượng sản phẩm không đủ. Hiện sản phẩm ${productDetail.getDataValue("product").name} chỉ còn ${inventory.getDataValue("stock")} sản phẩm.`,
                });
                return;
            }
            // Lấy giá sản phẩm
            const price = productDetail.getDataValue("price");
            const originalPrice = productDetail.getDataValue("originalPrice") || price;
            // Tính phần trăm giảm giá
            const discountPercent = originalPrice > 0 ? Math.round((1 - price / originalPrice) * 100) : 0;
            // Tính tổng tiền cho item
            const itemTotal = price * item.quantity;
            total += itemTotal;
            // Image URL
            const mainImage = productDetail.images &&
                productDetail.images.length > 0
                ? productDetail.images[0].url
                : null;
            // Thêm vào mảng
            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                color: item.color,
                size: item.size,
                originalPrice: originalPrice,
                discountPrice: price,
                discountPercent: discountPercent,
                imageUrl: mainImage,
                productDetailId: productDetail.id,
                inventoryId: inventory.getDataValue("id"),
            });
        }
        // Áp dụng voucher nếu có
        let voucherDiscount = 0;
        let appliedVoucher = null;
        if (voucherId) {
            const voucher = await Voucher_1.default.findByPk(voucherId, { transaction: t });
            if (!voucher) {
                await t.rollback();
                res.status(404).json({ message: "Voucher không tồn tại" });
                return;
            }
            // Kiểm tra hạn sử dụng
            if (new Date(voucher.getDataValue("expirationDate")) < new Date()) {
                await t.rollback();
                res.status(400).json({ message: "Voucher đã hết hạn" });
                return;
            }
            // Tính giảm giá
            if (voucher.getDataValue("type") === "percentage") {
                voucherDiscount = (total * voucher.getDataValue("value")) / 100;
            }
            else {
                voucherDiscount = voucher.getDataValue("value");
            }
            // Không cho phép giảm giá lớn hơn tổng đơn hàng
            voucherDiscount = Math.min(voucherDiscount, total);
            appliedVoucher = voucher;
        }
        // Tính phí vận chuyển
        const shippingCalculation = calculateShippingFee(total, shippingAddress);
        const shippingFee = shippingCalculation.finalFee;
        // Tính tổng tiền sau khi áp dụng voucher
        const finalTotal = total - voucherDiscount;
        // Tạo đơn hàng mới
        const newOrder = await Order_1.default.create({
            userId,
            total: finalTotal + shippingFee,
            status: "pending",
            paymentMethodId,
            paymentStatusId: 1, // pending
            shippingAddress,
            phoneNumber,
            voucherDiscount: voucherDiscount,
            subtotal: total,
            shippingFee: shippingFee,
            shippingBasePrice: shippingCalculation.baseFee, // Lưu phí gốc
            shippingDiscount: shippingCalculation.discount, // Lưu khoản giảm giá
        }, { transaction: t });
        // Tạo chi tiết đơn hàng
        for (const item of orderItems) {
            await OrderDetail_1.default.create({
                orderId: newOrder.id,
                productId: item.productId,
                productDetailId: item.productDetailId,
                quantity: item.quantity,
                color: item.color,
                size: item.size,
                originalPrice: item.originalPrice,
                discountPrice: item.discountPrice,
                discountPercent: item.discountPercent,
                voucherId: appliedVoucher ? appliedVoucher.id : null,
                imageUrl: item.imageUrl,
            }, { transaction: t });
            // Cập nhật tồn kho
            const inventory = await ProductInventory_1.default.findByPk(item.inventoryId, {
                transaction: t,
            });
            if (inventory) {
                await inventory.update({
                    stock: inventory.getDataValue("stock") - item.quantity,
                }, { transaction: t });
            }
        }
        // Kiểm tra tồn kho và xác định trạng thái của từng sản phẩm
        const updatedProductIds = new Set();
        // Lưu biến thể hết hàng để kiểm tra sau
        const outOfStockDetails = new Set();
        // Kiểm tra tồn kho của các biến thể sản phẩm
        for (const item of orderItems) {
            // Kiểm tra tồn kho của biến thể hiện tại
            const totalVariantStock = await ProductInventory_1.default.sum("stock", {
                where: { productDetailId: item.productDetailId },
                transaction: t,
            });
            // Lưu lại thông tin về biến thể hết hàng
            if (totalVariantStock === 0) {
                outOfStockDetails.add(item.productDetailId);
            }
            // Lấy thông tin về productId của biến thể này
            const productDetail = await ProductDetail_1.default.findByPk(item.productDetailId, {
                attributes: ["productId"],
                transaction: t,
            });
            if (productDetail) {
                updatedProductIds.add(productDetail.productId);
            }
        }
        // Kiểm tra và cập nhật trạng thái của từng sản phẩm chính
        for (const productId of updatedProductIds) {
            // Lấy tất cả biến thể của sản phẩm
            const details = await ProductDetail_1.default.findAll({
                where: { productId },
                attributes: ["id"],
                transaction: t,
            });
            // Kiểm tra tồn kho của từng biến thể
            const totalDetailCount = details.length;
            let outOfStockCount = 0;
            for (const detail of details) {
                const stockSum = await ProductInventory_1.default.sum("stock", {
                    where: { productDetailId: detail.id },
                    transaction: t,
                });
                if (stockSum === 0) {
                    outOfStockCount++;
                }
            }
            // Nếu tất cả biến thể đều hết hàng, cập nhật trạng thái sản phẩm thành "outofstock"
            if (totalDetailCount > 0 && totalDetailCount === outOfStockCount) {
                await Product_1.default.update({ status: "outofstock" }, { where: { id: productId }, transaction: t });
                console.log(`Sản phẩm ID ${productId} đã được cập nhật thành hết hàng.`);
            }
            else {
                // Nếu còn ít nhất một biến thể còn hàng, đảm bảo sản phẩm ở trạng thái "active"
                const product = await Product_1.default.findByPk(productId, {
                    transaction: t,
                });
                if (product && product.status === "outofstock") {
                    await Product_1.default.update({ status: "active" }, { where: { id: productId }, transaction: t });
                    console.log(`Sản phẩm ID ${productId} đã được cập nhật thành còn hàng.`);
                }
            }
        }
        await t.commit();
        res.status(201).json({
            message: "Đặt hàng thành công",
            orderId: newOrder.id,
        });
    }
    catch (error) {
        await t.rollback();
        console.error("Error creating order:", error);
        res.status(500).json({
            message: "Đã xảy ra lỗi khi tạo đơn hàng",
            error: error.message,
        });
    }
};
exports.createOrder = createOrder;
/**
 * Get orders for current user
 */
const getUserOrders = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const userId = req.user.id;
        // Phân trang
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        // Điều kiện lọc theo trạng thái (nếu có)
        const where = { userId };
        if (req.query.status) {
            where.status = req.query.status;
        }
        // Đếm tổng số đơn hàng
        const count = await Order_1.default.count({ where });
        // Lấy danh sách đơn hàng
        const orders = await Order_1.default.findAll({
            where,
            include: [
                {
                    model: OrderDetail_1.default,
                    as: "orderDetails",
                    include: [
                        {
                            model: Product_1.default,
                            as: "product",
                            attributes: ["id", "name"],
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });
        res.status(200).json({
            orders,
            pagination: {
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                perPage: limit,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUserOrders = getUserOrders;
/**
 * Get order details by ID
 */
const getOrderById = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        // Kiểm tra và xác nhận user tồn tại
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const userId = req.user.id;
        const order = await Order_1.default.findByPk(orderId, {
            include: [
                {
                    model: OrderDetail_1.default,
                    as: "orderDetails",
                    include: [
                        {
                            model: Product_1.default,
                            as: "product",
                            attributes: ["id", "name", "sku"],
                        },
                        {
                            model: Voucher_1.default,
                            as: "voucher",
                            attributes: ["id", "code", "type", "value"],
                        },
                    ],
                },
            ],
        });
        if (!order) {
            res.status(404).json({ message: "Đơn hàng không tồn tại" });
            return;
        }
        // Kiểm tra quyền truy cập
        // Nếu không phải admin và không phải đơn hàng của người dùng đó
        if (req.user.role !== 1 && order.userId !== req.user.id) {
            res.status(403).json({ message: "Bạn không có quyền xem đơn hàng này" });
            return;
        }
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getOrderById = getOrderById;
/**
 * Update order status (admin only)
 */
const updateOrderStatus = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { id } = req.params;
        const { status, paymentStatusId } = req.body;
        const order = await Order_1.default.findByPk(id, { transaction: t });
        if (!order) {
            await t.rollback();
            res.status(404).json({ message: "Đơn hàng không tồn tại" });
            return;
        }
        // Cập nhật trạng thái
        await order.update({
            status: status || order.getDataValue("status"),
            paymentStatusId: paymentStatusId || order.getDataValue("paymentStatusId"),
        }, { transaction: t });
        await t.commit();
        res.status(200).json({
            message: "Cập nhật trạng thái đơn hàng thành công",
            order,
        });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
/**
 * Cancel order
 */
const cancelOrder = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { id } = req.params;
        const { cancelNote } = req.body;
        if (!req.user) {
            await t.rollback();
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const userId = req.user.id;
        const order = await Order_1.default.findByPk(id, {
            transaction: t,
            include: [
                {
                    model: OrderDetail_1.default,
                    as: "orderDetails",
                },
            ],
        });
        if (!order) {
            await t.rollback();
            res.status(404).json({ message: "Đơn hàng không tồn tại" });
            return;
        }
        // Kiểm tra quyền (chỉ admin hoặc chủ đơn hàng mới được hủy)
        if (order.getDataValue("userId") !== userId && req.user.role !== 1) {
            await t.rollback();
            res.status(403).json({ message: "Không có quyền hủy đơn hàng này" });
            return;
        }
        // Chỉ cho phép hủy đơn hàng ở trạng thái "pending" hoặc "processing"
        const currentStatus = order.getDataValue("status");
        if (currentStatus !== "pending" && currentStatus !== "processing") {
            await t.rollback();
            res.status(400).json({
                message: "Không thể hủy đơn hàng ở trạng thái hiện tại",
            });
            return;
        }
        // Cập nhật trạng thái đơn hàng thành "cancelled"
        await order.update({
            status: "cancelled",
            cancelNote: cancelNote || "Người dùng hủy đơn hàng",
        }, { transaction: t });
        // Khởi tạo Set để lưu các productId đã cập nhật
        const updatedProductIds = new Set();
        // Hoàn trả số lượng vào kho hàng
        const orderDetails = order.orderDetails || [];
        console.log(`Đơn hàng có ${orderDetails.length} chi tiết để hoàn trả`);
        // Xử lý hoàn trả sản phẩm và thu thập productIds
        for (const detail of orderDetails) {
            console.log(`Xử lý hoàn trả cho sản phẩm ID ${detail.productId}`);
            // Thêm productId vào bộ cập nhật ngay tại đây để đảm bảo không bỏ sót
            updatedProductIds.add(detail.productId);
            console.log(`Đã thêm sản phẩm ID ${detail.productId} vào danh sách cần cập nhật`);
            const productDetail = await ProductDetail_1.default.findOne({
                where: {
                    productId: detail.productId,
                    color: detail.color,
                },
                transaction: t,
            });
            if (productDetail) {
                const inventory = await ProductInventory_1.default.findOne({
                    where: {
                        productDetailId: productDetail.id,
                        size: detail.size,
                    },
                    transaction: t,
                });
                if (inventory) {
                    const newStock = inventory.getDataValue("stock") + detail.quantity;
                    console.log(`Cập nhật tồn kho: ${inventory.getDataValue("stock")} + ${detail.quantity} = ${newStock}`);
                    await inventory.update({ stock: newStock }, { transaction: t });
                }
            }
        }
        // Thay thế đoạn code cũ từ dòng 574-653 bằng code sau:
        console.log(`Có ${updatedProductIds.size} sản phẩm cần kiểm tra trạng thái`);
        // Xử lý cập nhật trạng thái sản phẩm
        // Xử lý cập nhật trạng thái sản phẩm
        if (updatedProductIds.size > 0) {
            const updatePromises = Array.from(updatedProductIds).map(async (productId) => {
                // Lấy sản phẩm để kiểm tra trạng thái hiện tại
                const product = await Product_1.default.findByPk(productId, {
                    transaction: t,
                });
                if (product) {
                    console.log(`Sản phẩm ID ${productId}, trạng thái hiện tại: ${product.status}`);
                    // Tính tổng tồn kho của sản phẩm
                    const productDetails = await ProductDetail_1.default.findAll({
                        where: { productId },
                        transaction: t,
                    });
                    let totalStock = 0;
                    for (const detail of productDetails) {
                        const stockSum = await ProductInventory_1.default.sum("stock", {
                            where: { productDetailId: detail.id },
                            transaction: t,
                        });
                        totalStock += stockSum || 0;
                    }
                    console.log(`Tổng tồn kho sản phẩm ID ${productId}: ${totalStock}`);
                    if (totalStock > 0 && product.status === "outofstock") {
                        console.log(`Cập nhật sản phẩm ID ${productId} từ ${product.status} sang active`);
                        // Thêm logging để xác nhận lệnh update
                        console.log(`Bắt đầu SQL UPDATE cho sản phẩm ID ${productId}`);
                        try {
                            await Product_1.default.update({ status: "active" }, { where: { id: productId }, transaction: t });
                            // Kiểm tra sau khi cập nhật
                            const updatedProduct = await Product_1.default.findByPk(productId, {
                                transaction: t,
                            });
                            console.log(`Sản phẩm ID ${productId} sau khi cập nhật có trạng thái: ${updatedProduct?.status}`);
                            // KHÔNG có return ở đây
                            return {
                                productId,
                                updated: true,
                                newStatus: updatedProduct?.status,
                            };
                        }
                        catch (updateError) {
                            console.error(`Lỗi khi cập nhật sản phẩm ID ${productId}:`, updateError);
                            return {
                                productId,
                                updated: false,
                                error: updateError instanceof Error
                                    ? updateError.message
                                    : "Unknown error",
                            };
                        }
                    }
                    return {
                        productId,
                        updated: false,
                        reason: totalStock > 0
                            ? "Sản phẩm không ở trạng thái outofstock"
                            : "Sản phẩm vẫn hết hàng",
                    };
                }
                return {
                    productId,
                    updated: false,
                    reason: "Không tìm thấy sản phẩm",
                };
            });
            await Promise.all(updatePromises);
        }
        // Đảm bảo commit chỉ xảy ra sau khi tất cả cập nhật đã hoàn thành
        console.log("Chuẩn bị commit transaction");
        await t.commit();
        console.log("Transaction đã commit thành công");
        res.status(200).json({ message: "Hủy đơn hàng thành công" });
    }
    catch (error) {
        await t.rollback();
        console.error("Error cancelling order:", error);
        res.status(500).json({
            message: "Đã xảy ra lỗi khi hủy đơn hàng",
            error: error.message,
        });
    }
};
exports.cancelOrder = cancelOrder;
/**
 * Calculate shipping fee based on order total and shipping address
 */
const calculateShippingFee = (subtotal, shippingAddress) => {
    // Tính phí giao hàng cơ bản dựa trên địa điểm
    let baseFee = 30000;
    // Phí cao hơn cho các tỉnh xa
    if (shippingAddress.toLowerCase().includes("hồ chí minh") ||
        shippingAddress.toLowerCase().includes("ho chi minh") ||
        shippingAddress.toLowerCase().includes("hcm")) {
        baseFee = 50000; // Phí trong TP.HCM
    }
    else if (shippingAddress.toLowerCase().includes("hà nội") ||
        shippingAddress.toLowerCase().includes("ha noi")) {
        baseFee = 100000; // Phí giao đến Hà Nội
    }
    else {
        baseFee = 120000; // Phí giao đến tỉnh thành khác
    }
    // Miễn phí vận chuyển cho đơn hàng từ 1,000,000đ (tối đa 100,000đ)
    let discount = 0;
    if (subtotal >= 1000000) {
        discount = Math.min(baseFee, 100000);
    }
    // Tính phí vận chuyển cuối cùng
    const finalFee = baseFee - discount;
    return {
        baseFee,
        discount,
        finalFee,
    };
};
/**
 * Calculate shipping fee for current cart
 */
const calculateShippingFeeForCart = async (req, res) => {
    try {
        const { subtotal, shippingAddress } = req.body;
        // Validate input
        if (!subtotal || !shippingAddress) {
            res.status(400).json({
                message: "Vui lòng cung cấp giá trị đơn hàng và địa chỉ giao hàng",
            });
            return;
        }
        // Tính phí vận chuyển
        const shippingCalculation = calculateShippingFee(subtotal, shippingAddress);
        // Chỉ trả về dữ liệu, không trả về message
        res.status(200).json({
            shipping: {
                baseFee: shippingCalculation.baseFee,
                discount: shippingCalculation.discount,
                finalFee: shippingCalculation.finalFee,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.calculateShippingFeeForCart = calculateShippingFeeForCart;
// Lấy đơn hàng của một user cụ thể (chỉ dành cho admin)
const getUserOrdersByAdmin = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user || req.user.role !== 1) {
            res.status(403).json({ message: "Không có quyền truy cập" });
            return;
        }
        const { userId } = req.params;
        // Lấy thông tin user
        const user = await Users_1.default.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });
        if (!user) {
            res.status(404).json({ message: "Người dùng không tồn tại" });
            return;
        }
        // Phân trang
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        // Điều kiện lọc theo trạng thái (nếu có)
        const where = { userId };
        if (req.query.status) {
            where.status = req.query.status;
        }
        // Đếm tổng số đơn hàng
        const count = await Order_1.default.count({ where });
        // Lấy đơn hàng với phân trang
        const orders = await Order_1.default.findAll({
            where,
            include: [
                {
                    model: OrderDetail_1.default,
                    as: "orderDetails",
                    include: [
                        {
                            model: Product_1.default,
                            as: "product",
                            attributes: ["id", "name"],
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });
        // Trả về dữ liệu với thông tin phân trang
        res.status(200).json({
            orders,
            pagination: {
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                perPage: limit,
            },
        });
    }
    catch (error) {
        console.error("Error in getUserOrdersByAdmin:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getUserOrdersByAdmin = getUserOrdersByAdmin;
