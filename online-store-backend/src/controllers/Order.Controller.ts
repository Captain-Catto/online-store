import { Request, Response } from "express";
import sequelize from "../config/db";
import Order from "../models/Order";
import OrderDetail from "../models/OrderDetail";
import ProductInventory from "../models/ProductInventory";
import ProductDetail from "../models/ProductDetail";
import Voucher from "../models/Voucher";
import Product from "../models/Product";
import ProductImage from "../models/ProductImage";

/**
 * Create a new order
 */
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { items, paymentMethodId, voucherId, shippingAddress, phoneNumber } =
      req.body;

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
      const productDetail = await ProductDetail.findOne({
        where: { productId: item.productId, color: item.color },
        transaction: t,
        include: [
          { model: Product, as: "product" },
          {
            model: ProductImage,
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
      const inventory = await ProductInventory.findOne({
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
          message: `Số lượng sản phẩm không đủ. Hiện chỉ còn ${inventory.getDataValue(
            "stock"
          )} sản phẩm.`,
        });
        return;
      }

      // Lấy giá sản phẩm
      const price = productDetail.getDataValue("price");
      const originalPrice =
        productDetail.getDataValue("originalPrice") || price;

      // Tính phần trăm giảm giá
      const discountPercent =
        originalPrice > 0 ? Math.round((1 - price / originalPrice) * 100) : 0;

      // Tính tổng tiền cho item
      const itemTotal = price * item.quantity;
      total += itemTotal;

      // Image URL
      const mainImage =
        (productDetail as any).images &&
        (productDetail as any).images.length > 0
          ? (productDetail as any).images[0].url
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
      const voucher = await Voucher.findByPk(voucherId, { transaction: t });

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
      } else {
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
    const newOrder = await Order.create(
      {
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
      },
      { transaction: t }
    );

    // Tạo chi tiết đơn hàng
    for (const item of orderItems) {
      await OrderDetail.create(
        {
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
        },
        { transaction: t }
      );

      // Cập nhật tồn kho
      const inventory = await ProductInventory.findByPk(item.inventoryId, {
        transaction: t,
      });
      if (inventory) {
        await inventory.update(
          {
            stock: inventory.getDataValue("stock") - item.quantity,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    res.status(201).json({
      message: "Đặt hàng thành công",
      orderId: newOrder.id,
    });
  } catch (error: any) {
    await t.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi tạo đơn hàng",
      error: error.message,
    });
  }
};

/**
 * Get orders for current user
 */
export const getUserOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderDetail,
          as: "orderDetails",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get order details by ID
 */
export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id },
      include: [
        {
          model: OrderDetail,
          as: "orderDetails",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "sku"],
            },
            {
              model: Voucher,
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

    // Kiểm tra quyền truy cập (chỉ admin hoặc chủ đơn hàng mới được xem)
    if (order.getDataValue("userId") !== userId && req.body.user.role !== 1) {
      res.status(403).json({ message: "Không có quyền truy cập đơn hàng này" });
      return;
    }

    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

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
 * Cancel order
 */
export const cancelOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { cancelNote } = req.body; // Thêm lý do hủy đơn

    if (!req.user) {
      await t.rollback();
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const userId = req.user.id;

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
    await order.update(
      {
        status: "cancelled",
        cancelNote: cancelNote || "Người dùng hủy đơn hàng",
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

        // FIX: Thêm kiểm tra null trước khi update
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

    res.status(200).json({ message: "Hủy đơn hàng thành công" });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Calculate shipping fee based on order total and shipping address
 */
const calculateShippingFee = (
  subtotal: number,
  shippingAddress: string
): { baseFee: number; discount: number; finalFee: number } => {
  // Tính phí giao hàng cơ bản dựa trên địa điểm
  let baseFee = 30000;

  // Phí cao hơn cho các tỉnh xa
  if (
    shippingAddress.toLowerCase().includes("hồ chí minh") ||
    shippingAddress.toLowerCase().includes("ho chi minh") ||
    shippingAddress.toLowerCase().includes("hcm")
  ) {
    baseFee = 50000; // Phí trong TP.HCM
  } else if (
    shippingAddress.toLowerCase().includes("hà nội") ||
    shippingAddress.toLowerCase().includes("ha noi")
  ) {
    baseFee = 100000; // Phí giao đến Hà Nội
  } else {
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
export const calculateShippingFeeForCart = async (
  req: Request,
  res: Response
): Promise<void> => {
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
