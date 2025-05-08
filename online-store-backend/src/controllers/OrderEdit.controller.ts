import { Request, Response } from "express";
import { Op, QueryTypes } from "sequelize";
import sequelize from "../config/db";
import Order from "../models/Order";
import OrderDetail from "../models/OrderDetail";
import ProductInventory from "../models/ProductInventory";
import ProductDetail from "../models/ProductDetail";
import PaymentStatus from "../models/PaymentStatus";
import Product from "../models/Product";
import Users from "../models/Users";
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

    // Danh sách sản phẩm cần kiểm tra sau khi cập nhật tồn kho
    const updatedProductIds = new Set<number>();
    const orderDetails = (order as any).orderDetails || [];

    // BƯỚC 1: Hoàn trả tồn kho
    for (const detail of orderDetails) {
      const productId = detail.productId;
      updatedProductIds.add(productId);

      // Tìm ProductDetail dựa trên productDetailId (ưu tiên) hoặc productId và color
      let productDetail;
      if (detail.productDetailId) {
        productDetail = await ProductDetail.findByPk(detail.productDetailId, {
          transaction: t,
        });
      } else {
        productDetail = await ProductDetail.findOne({
          where: { productId, color: detail.color },
          transaction: t,
        });
      }

      if (!productDetail) {
        continue;
      }

      const inventory = await ProductInventory.findOne({
        where: { productDetailId: productDetail.id, size: detail.size },
        transaction: t,
      });

      if (inventory) {
        const currentStock = inventory.getDataValue("stock");
        const newStock = currentStock + detail.quantity;
        await inventory.update({ stock: newStock }, { transaction: t });
      } else {
        await ProductInventory.create(
          {
            productDetailId: productDetail.id,
            size: detail.size,
            stock: detail.quantity,
          },
          { transaction: t }
        );
      }
    }

    // BƯỚC 2: Truy vấn và cập nhật trạng thái sản phẩm
    for (const productId of updatedProductIds) {
      try {
        // Truy vấn trạng thái sản phẩm
        const product = await Product.findByPk(productId, { transaction: t });
        if (!product) {
          continue;
        }

        // Tính tổng tồn kho bằng Sequelize
        const totalStock =
          (await ProductInventory.sum("stock", {
            where: {
              productDetailId: {
                [Op.in]: sequelize.literal(
                  `(SELECT id FROM product_details WHERE productId = ${productId})`
                ),
              },
            },
            transaction: t,
          })) || 0;

        // Cập nhật trạng thái sản phẩm
        if (totalStock > 0 && product.status !== "active") {
          await sequelize.query(
            `UPDATE products SET status = 'active', updatedAt = NOW() 
             WHERE id = :productId AND status = 'outofstock'`,
            {
              replacements: { productId },
              type: QueryTypes.UPDATE,
              transaction: t,
            }
          );
        } else if (totalStock === 0 && product.status !== "outofstock") {
          await product.update({ status: "outofstock" }, { transaction: t });
        }
      } catch (error) {
        // Giữ lại log lỗi cho mục đích debug
        console.error(
          `[ERROR] Lỗi khi cập nhật trạng thái sản phẩm ID ${productId}:`,
          error
        );
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
    console.error("[ERROR] Lỗi khi hủy đơn hàng:", {
      message: error.message,
      stack: error.stack,
      orderId: req.params.id,
    });
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
    const {
      page = 1,
      limit = 10,
      status,
      search,
      fromDate,
      toDate,
    } = req.query;
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
    const baseConditions: any = {};

    // Thêm điều kiện status nếu có
    if (status && status !== "all") {
      baseConditions.status = status;
    }

    // Xử lý điều kiện ngày tháng đúng cách
    if (fromDate || toDate) {
      baseConditions.createdAt = {};

      if (fromDate) {
        baseConditions.createdAt[Op.gte] = new Date(fromDate as string);
      }

      if (toDate) {
        baseConditions.createdAt[Op.lte] = new Date(
          new Date(toDate as string).setHours(23, 59, 59)
        );
      }
    }

    // Điều kiện tìm kiếm cơ bản
    let where = { ...baseConditions };

    // Điều kiện tìm kiếm nâng cao
    if (search) {
      const searchTerm = `%${search}%`;
      const searchConditions: {
        [Op.or]: Array<{ phoneNumber?: { [Op.like]: string }; id?: number }>;
      } = {
        [Op.or]: [{ phoneNumber: { [Op.like]: searchTerm } }],
      };

      // Nếu search là số, thêm điều kiện tìm theo ID
      if (!isNaN(Number(search))) {
        searchConditions[Op.or].push({ id: Number(search) });
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
        model: OrderDetail,
        as: "orderDetails",
        required: false,
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name"],
            required: false,
          },
        ],
      },
      {
        model: Users,
        as: "user",
        attributes: ["id", "email", "username"],
        required: false,
      },
    ];

    // Đếm tổng số đơn hàng
    let count = await Order.count({
      where,
      distinct: true,
      include: includeOptions,
    });

    // Tìm kiếm nâng cao theo email và tên sản phẩm
    if (search && search.toString().length > 0) {
      const searchTerm = `%${search}%`;

      // Tìm theo email người dùng
      const ordersWithUserEmail = await Order.findAll({
        attributes: ["id"],
        where: baseConditions, // Giữ điều kiện cơ bản (status, date)
        include: [
          {
            model: Users,
            as: "user",
            where: {
              email: { [Op.like]: searchTerm },
            },
            required: true,
          },
        ],
      });

      // Tìm theo tên sản phẩm
      const ordersWithProductName = await Order.findAll({
        attributes: ["id"],
        where: baseConditions, // Giữ điều kiện cơ bản (status, date)
        include: [
          {
            model: OrderDetail,
            as: "orderDetails",
            include: [
              {
                model: Product,
                as: "product",
                where: {
                  [Op.or]: [
                    { name: { [Op.like]: searchTerm } },
                    { slug: { [Op.like]: searchTerm } },
                  ],
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
        if (where[Op.or]) {
          where[Op.or].push({ id: { [Op.in]: relationIds } });
        } else {
          // Giữ điều kiện cơ bản và thêm điều kiện ID
          where = {
            ...baseConditions,
            id: { [Op.in]: relationIds },
          };
        }

        // Đếm lại với điều kiện mới
        count = await Order.count({
          where,
          distinct: true,
        });
      } else if (search && !where[Op.or] && Object.keys(where).length === 0) {
        // Nếu không tìm thấy kết quả nào và không có điều kiện khác => trả về rỗng
        where = { id: -1 };
        count = 0;
      }
    }

    // Log điều kiện cuối cùng để debug
    console.log("Final where condition:", JSON.stringify(where, null, 2));

    // Lấy danh sách đơn hàng
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
            {
              model: Product,
              as: "product",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Users,
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
  } catch (error: any) {
    console.error("Error in getAllOrders:", error);
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
  console.log("processRefund called");
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
