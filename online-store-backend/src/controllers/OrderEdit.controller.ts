import { Request, Response } from "express";
import sequelize from "../config/db";
import Order from "../models/Order";
import OrderDetail from "../models/OrderDetail";
import ProductInventory from "../models/ProductInventory";
import ProductDetail from "../models/ProductDetail";
import PaymentStatus from "../models/PaymentStatus";

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, paymentStatusId } = req.body;

    const order = await Order.findByPk(id, { transaction: t });

    if (!order) {
      await t.rollback();
      res.status(404).json({ message: "Đơn hàng không tồn tại" });
      return;
    }

    // Không cho phép thay đổi trạng thái từ cancelled
    if (
      order.getDataValue("status") === "cancelled" &&
      status !== "cancelled"
    ) {
      await t.rollback();
      res
        .status(400)
        .json({ message: "Không thể thay đổi trạng thái đơn hàng đã hủy" });
      return;
    }

    // Cập nhật trạng thái
    await order.update(
      {
        status: status || order.getDataValue("status"),
        paymentStatusId:
          paymentStatusId || order.getDataValue("paymentStatusId"),
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      order,
    });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cancel order (admin override)
 */
export const cancelOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { cancelNote } = req.body;

    const order = await Order.findByPk(id, {
      transaction: t,
      include: [
        {
          model: OrderDetail,
          as: "orderDetails",
        },
      ],
    });

    if (!order) {
      await t.rollback();
      res.status(404).json({ message: "Đơn hàng không tồn tại" });
      return;
    }

    // Không cần kiểm tra quyền ở đây vì route đã được bảo vệ bởi roleMiddleware([1])

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
    await order.update(
      {
        status: "cancelled",
        cancelNote: cancelNote || "Hủy bởi Admin",
      },
      { transaction: t }
    );

    // Hoàn trả số lượng vào kho hàng
    const orderDetails = (order as any).orderDetails || [];

    for (const detail of orderDetails) {
      const productDetail = await ProductDetail.findOne({
        where: {
          productId: detail.productId,
          color: detail.color,
        },
        transaction: t,
      });

      if (productDetail) {
        const inventory = await ProductInventory.findOne({
          where: {
            productDetailId: productDetail.id,
            size: detail.size,
          },
          transaction: t,
        });

        if (inventory) {
          await inventory.update(
            {
              stock: inventory.getDataValue("stock") + detail.quantity,
            },
            { transaction: t }
          );
        }
      }
    }

    await t.commit();

    res.status(200).json({
      message: "Hủy đơn hàng thành công",
      orderId: order.id,
      status: "cancelled",
    });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update payment status (admin only)
 */
export const updatePaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

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
    const paymentStatus = await PaymentStatus.findByPk(paymentStatusId, {
      transaction: t,
    });
    if (!paymentStatus) {
      await t.rollback();
      res.status(404).json({ message: "Trạng thái thanh toán không tồn tại" });
      return;
    }

    const order = await Order.findByPk(id, { transaction: t });
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
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update shipping address (admin only)
 */
export const updateShippingAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { shippingAddress, phoneNumber } = req.body;

    if (!shippingAddress && !phoneNumber) {
      await t.rollback();
      res.status(400).json({ message: "Không có thông tin cần cập nhật" });
      return;
    }

    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      res.status(404).json({ message: "Đơn hàng không tồn tại" });
      return;
    }

    // Chỉ cho phép cập nhật khi đơn hàng chưa giao hoặc chưa hủy
    if (
      order.getDataValue("status") === "delivered" ||
      order.getDataValue("status") === "cancelled"
    ) {
      await t.rollback();
      res
        .status(400)
        .json({ message: "Không thể cập nhật đơn hàng đã giao hoặc đã hủy" });
      return;
    }

    // Cập nhật thông tin
    const updateData: any = {};
    if (shippingAddress) updateData.shippingAddress = shippingAddress;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    await order.update(updateData, { transaction: t });
    await t.commit();

    res.status(200).json({
      message: "Cập nhật thông tin giao hàng thành công",
      order,
    });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Xây dựng điều kiện tìm kiếm
    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatusId = paymentStatus;

    // Đếm tổng số đơn hàng
    const count = await Order.count({ where });

    // Lấy danh sách đơn hàng với phân trang
    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderDetail,
          as: "orderDetails",
          include: [
            {
              model: ProductDetail,
              as: "productDetail",
              attributes: ["id", "color"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
    });

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      items: orders,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Process refund (admin only)
 */
export const processRefund = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      await t.rollback();
      res.status(400).json({ message: "Số tiền hoàn trả không hợp lệ" });
      return;
    }

    const order = await Order.findByPk(id, { transaction: t });
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
    await order.update(
      {
        paymentStatusId: 4, // 4 là "Refunded"
        refundAmount: amount,
        refundReason: reason || "Hoàn tiền",
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({
      message: "Hoàn tiền thành công",
      order: {
        id: order.id,
        refundAmount: amount,
        paymentStatus: "Refunded",
      },
    });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};
