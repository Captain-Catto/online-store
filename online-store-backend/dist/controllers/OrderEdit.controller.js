"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRefund = exports.getAllOrders = exports.updateShippingAddress = exports.updatePaymentStatus = exports.cancelOrder = exports.updateOrderStatus = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const Order_1 = __importDefault(require("../models/Order"));
const OrderDetail_1 = __importDefault(require("../models/OrderDetail"));
const ProductInventory_1 = __importDefault(require("../models/ProductInventory"));
const ProductDetail_1 = __importDefault(require("../models/ProductDetail"));
const PaymentStatus_1 = __importDefault(require("../models/PaymentStatus"));
const Product_1 = __importDefault(require("../models/Product"));
const Users_1 = __importDefault(require("../models/Users"));
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
        // Không cho phép thay đổi trạng thái từ cancelled
        if (order.getDataValue("status") === "cancelled" &&
            status !== "cancelled") {
            await t.rollback();
            res
                .status(400)
                .json({ message: "Không thể thay đổi trạng thái đơn hàng đã hủy" });
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
 * Cancel order (admin override)
 */
const cancelOrder = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { id } = req.params;
        const { cancelNote } = req.body;
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
        // Kiểm tra nếu đơn hàng đã ở trạng thái "cancelled"
        if (order.getDataValue("status") === "cancelled") {
            await t.rollback();
            res.status(400).json({ message: "Đơn hàng đã được hủy trước đó" });
            return;
        }
        // Kiểm tra nếu đơn hàng đã ở trạng thái "delivered"
        if (order.getDataValue("status") === "delivered") {
            await t.rollback();
            res.status(400).json({ message: "Không thể hủy đơn hàng đã giao" });
            return;
        }
        // Cập nhật trạng thái đơn hàng thành "cancelled"
        await order.update({
            status: "cancelled",
            cancelNote: cancelNote || "Hủy bởi Admin",
        }, { transaction: t });
        // Hoàn trả số lượng vào kho hàng
        const orderDetails = order.orderDetails || [];
        for (const detail of orderDetails) {
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
                    await inventory.update({
                        stock: inventory.getDataValue("stock") + detail.quantity,
                    }, { transaction: t });
                }
            }
        }
        await t.commit();
        res.status(200).json({
            message: "Hủy đơn hàng thành công",
            orderId: order.id,
            status: "cancelled",
        });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
exports.cancelOrder = cancelOrder;
/**
 * Update payment status (admin only)
 */
const updatePaymentStatus = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { id } = req.params;
        const { paymentStatusId } = req.body;
        if (!paymentStatusId) {
            await t.rollback();
            res
                .status(400)
                .json({ message: "Thiếu thông tin trạng thái thanh toán" });
            return;
        }
        // Kiểm tra payment status có tồn tại không
        const paymentStatus = await PaymentStatus_1.default.findByPk(paymentStatusId, {
            transaction: t,
        });
        if (!paymentStatus) {
            await t.rollback();
            res.status(404).json({ message: "Trạng thái thanh toán không tồn tại" });
            return;
        }
        const order = await Order_1.default.findByPk(id, { transaction: t });
        if (!order) {
            await t.rollback();
            res.status(404).json({ message: "Đơn hàng không tồn tại" });
            return;
        }
        await order.update({ paymentStatusId }, { transaction: t });
        // Nếu thanh toán thành công (status = 2) và đơn chưa đang xử lý, thì chuyển sang đang xử lý
        if (paymentStatusId === 2 && order.getDataValue("status") === "pending") {
            await order.update({ status: "processing" }, { transaction: t });
        }
        await t.commit();
        res.status(200).json({
            message: "Cập nhật trạng thái thanh toán thành công",
            order,
        });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
/**
 * Update shipping address (admin only)
 */
const updateShippingAddress = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { id } = req.params;
        const { shippingAddress, phoneNumber } = req.body;
        if (!shippingAddress && !phoneNumber) {
            await t.rollback();
            res.status(400).json({ message: "Không có thông tin cần cập nhật" });
            return;
        }
        const order = await Order_1.default.findByPk(id, { transaction: t });
        if (!order) {
            await t.rollback();
            res.status(404).json({ message: "Đơn hàng không tồn tại" });
            return;
        }
        // Chỉ cho phép cập nhật khi đơn hàng chưa giao hoặc chưa hủy
        if (order.getDataValue("status") === "delivered" ||
            order.getDataValue("status") === "cancelled") {
            await t.rollback();
            res
                .status(400)
                .json({ message: "Không thể cập nhật đơn hàng đã giao hoặc đã hủy" });
            return;
        }
        // Cập nhật thông tin
        const updateData = {};
        if (shippingAddress)
            updateData.shippingAddress = shippingAddress;
        if (phoneNumber)
            updateData.phoneNumber = phoneNumber;
        await order.update(updateData, { transaction: t });
        await t.commit();
        res.status(200).json({
            message: "Cập nhật thông tin giao hàng thành công",
            order,
        });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
exports.updateShippingAddress = updateShippingAddress;
/**
 * Get all orders (admin only)
 */
const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search, fromDate, toDate, } = req.query;
        console.log("Query params:", {
            page,
            limit,
            status,
            search,
            fromDate,
            toDate,
        });
        const offset = (Number(page) - 1) * Number(limit);
        // Xây dựng điều kiện tìm kiếm cơ bản
        const baseConditions = {};
        // Thêm điều kiện status nếu có
        if (status && status !== "all") {
            baseConditions.status = status;
        }
        // Xử lý điều kiện ngày tháng đúng cách
        if (fromDate || toDate) {
            baseConditions.createdAt = {};
            if (fromDate) {
                baseConditions.createdAt[sequelize_1.Op.gte] = new Date(fromDate);
            }
            if (toDate) {
                baseConditions.createdAt[sequelize_1.Op.lte] = new Date(new Date(toDate).setHours(23, 59, 59));
            }
        }
        // Điều kiện tìm kiếm cơ bản
        let where = { ...baseConditions };
        // Điều kiện tìm kiếm nâng cao
        if (search) {
            const searchTerm = `%${search}%`;
            const searchConditions = {
                [sequelize_1.Op.or]: [{ phoneNumber: { [sequelize_1.Op.like]: searchTerm } }],
            };
            // Nếu search là số, thêm điều kiện tìm theo ID
            if (!isNaN(Number(search))) {
                searchConditions[sequelize_1.Op.or].push({ id: Number(search) });
            }
            // Kết hợp điều kiện cơ bản với điều kiện tìm kiếm
            where = {
                ...baseConditions,
                ...searchConditions,
            };
        }
        // Định nghĩa include
        const includeOptions = [
            {
                model: OrderDetail_1.default,
                as: "orderDetails",
                required: false,
                include: [
                    {
                        model: Product_1.default,
                        as: "product",
                        attributes: ["id", "name"],
                        required: false,
                    },
                ],
            },
            {
                model: Users_1.default,
                as: "user",
                attributes: ["id", "email", "username"],
                required: false,
            },
        ];
        // Đếm tổng số đơn hàng
        let count = await Order_1.default.count({
            where,
            distinct: true,
            include: includeOptions,
        });
        // Tìm kiếm nâng cao theo email và tên sản phẩm
        if (search && search.toString().length > 0) {
            const searchTerm = `%${search}%`;
            // Tìm theo email người dùng
            const ordersWithUserEmail = await Order_1.default.findAll({
                attributes: ["id"],
                where: baseConditions, // Giữ điều kiện cơ bản (status, date)
                include: [
                    {
                        model: Users_1.default,
                        as: "user",
                        where: {
                            email: { [sequelize_1.Op.like]: searchTerm },
                        },
                        required: true,
                    },
                ],
            });
            // Tìm theo tên sản phẩm
            const ordersWithProductName = await Order_1.default.findAll({
                attributes: ["id"],
                where: baseConditions, // Giữ điều kiện cơ bản (status, date)
                include: [
                    {
                        model: OrderDetail_1.default,
                        as: "orderDetails",
                        include: [
                            {
                                model: Product_1.default,
                                as: "product",
                                where: {
                                    name: { [sequelize_1.Op.like]: searchTerm },
                                },
                                required: true,
                            },
                        ],
                        required: true,
                    },
                ],
            });
            // Gộp kết quả từ 2 truy vấn
            const userEmailIds = ordersWithUserEmail.map((order) => order.id);
            const productNameIds = ordersWithProductName.map((order) => order.id);
            const relationIds = [...new Set([...userEmailIds, ...productNameIds])];
            if (relationIds.length > 0) {
                // Thêm điều kiện ID vào điều kiện OR hiện có
                if (where[sequelize_1.Op.or]) {
                    where[sequelize_1.Op.or].push({ id: { [sequelize_1.Op.in]: relationIds } });
                }
                else {
                    // Giữ điều kiện cơ bản và thêm điều kiện ID
                    where = {
                        ...baseConditions,
                        id: { [sequelize_1.Op.in]: relationIds },
                    };
                }
                // Đếm lại với điều kiện mới
                count = await Order_1.default.count({
                    where,
                    distinct: true,
                });
            }
            else if (search && !where[sequelize_1.Op.or] && Object.keys(where).length === 0) {
                // Nếu không tìm thấy kết quả nào và không có điều kiện khác => trả về rỗng
                where = { id: -1 };
                count = 0;
            }
        }
        // Log điều kiện cuối cùng để debug
        console.log("Final where condition:", JSON.stringify(where, null, 2));
        // Lấy danh sách đơn hàng
        const orders = await Order_1.default.findAll({
            where,
            include: [
                {
                    model: OrderDetail_1.default,
                    as: "orderDetails",
                    include: [
                        {
                            model: ProductDetail_1.default,
                            as: "productDetail",
                            attributes: ["id", "color"],
                        },
                        {
                            model: Product_1.default,
                            as: "product",
                            attributes: ["id", "name"],
                        },
                    ],
                },
                {
                    model: Users_1.default,
                    as: "user",
                    attributes: ["id", "email", "username"],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit: Number(limit),
            offset,
        });
        res.status(200).json({
            orders,
            pagination: {
                total: count,
                currentPage: Number(page),
                totalPages: Math.ceil(count / Number(limit)),
                perPage: Number(limit),
            },
        });
    }
    catch (error) {
        console.error("Error in getAllOrders:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAllOrders = getAllOrders;
/**
 * Process refund (admin only)
 */
const processRefund = async (req, res) => {
    const t = await db_1.default.transaction();
    console.log("processRefund called");
    try {
        const { id } = req.params;
        const { amount, reason } = req.body;
        if (!amount || amount <= 0) {
            await t.rollback();
            res.status(400).json({ message: "Số tiền hoàn trả không hợp lệ" });
            return;
        }
        const order = await Order_1.default.findByPk(id, { transaction: t });
        if (!order) {
            await t.rollback();
            res.status(404).json({ message: "Đơn hàng không tồn tại" });
            return;
        }
        // Chỉ cho phép hoàn tiền đơn hàng đã thanh toán
        if (order.getDataValue("paymentStatusId") !== 2) {
            // 2 là "Paid"
            await t.rollback();
            res
                .status(400)
                .json({ message: "Chỉ có thể hoàn tiền cho đơn hàng đã thanh toán" });
            return;
        }
        // Đặt trạng thái thanh toán thành "refunded"
        await order.update({
            paymentStatusId: 4, // 4 là "Refunded"
            refundAmount: amount,
            refundReason: reason || "Hoàn tiền",
        }, { transaction: t });
        await t.commit();
        res.status(200).json({
            message: "Hoàn tiền thành công",
            order: {
                id: order.id,
                refundAmount: amount,
                paymentStatus: "Refunded",
            },
        });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
exports.processRefund = processRefund;
