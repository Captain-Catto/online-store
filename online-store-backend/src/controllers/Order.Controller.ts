import { Request, Response } from "express";
import sequelize from "../config/db";
import { Op, QueryTypes } from "sequelize";
import Order from "../models/Order";
import OrderDetail from "../models/OrderDetail";
import ProductInventory from "../models/ProductInventory";
import ProductDetail from "../models/ProductDetail";
import Voucher from "../models/Voucher";
import Product from "../models/Product";
import ProductImage from "../models/ProductImage";
import Users from "../models/Users";
/**
 * Create a new order
 */
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const {
      items,
      paymentMethodId,
      voucherId,
      shippingFullName,
      shippingPhoneNumber,
      shippingStreetAddress,
      shippingWard,
      shippingDistrict,
      shippingCity,
    } = req.body;
    console.log("bắt đầu tạo đơn hàng");
    // đổi flow, người dùng không đăng nhập vẫn có thể đặt hàng
    // Lấy user ID từ token
    const userId = req.user?.id || null;
    console.log("userId", userId);

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
          message: `Số lượng sản phẩm không đủ. Hiện sản phẩm ${
            productDetail.getDataValue("product").name
          } chỉ còn ${inventory.getDataValue("stock")} sản phẩm.`,
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
    const shippingCalculation = calculateShippingFee(total, shippingCity);
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
        shippingFullName,
        shippingPhoneNumber,
        shippingStreetAddress,
        shippingWard,
        shippingDistrict,
        shippingCity,
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

    // Kiểm tra tồn kho và xác định trạng thái của từng sản phẩm
    const updatedProductIds = new Set();

    // Lưu biến thể hết hàng để kiểm tra sau
    const outOfStockDetails = new Set();

    // Kiểm tra tồn kho của các biến thể sản phẩm
    for (const item of orderItems) {
      // Kiểm tra tồn kho của biến thể hiện tại
      const totalVariantStock = await ProductInventory.sum("stock", {
        where: { productDetailId: item.productDetailId },
        transaction: t,
      });

      // Lưu lại thông tin về biến thể hết hàng
      if (totalVariantStock === 0) {
        outOfStockDetails.add(item.productDetailId);
      }

      // Lấy thông tin về productId của biến thể này
      const productDetail = await ProductDetail.findByPk(item.productDetailId, {
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
      const details = await ProductDetail.findAll({
        where: { productId },
        attributes: ["id"],
        transaction: t,
      });

      // Kiểm tra tồn kho của từng biến thể
      const totalDetailCount = details.length;
      let outOfStockCount = 0;

      for (const detail of details) {
        const stockSum = await ProductInventory.sum("stock", {
          where: { productDetailId: detail.id },
          transaction: t,
        });

        if (stockSum === 0) {
          outOfStockCount++;
        }
      }
      console.log("totalDetailCount", totalDetailCount);
      // Nếu tất cả biến thể đều hết hàng, cập nhật trạng thái sản phẩm thành "outofstock"
      if (totalDetailCount > 0 && totalDetailCount === outOfStockCount) {
        await Product.update(
          { status: "outofstock" },
          { where: { id: productId }, transaction: t }
        );
        console.log(
          `Sản phẩm ID ${productId} đã được cập nhật thành hết hàng.`
        );
      } else {
        // Nếu còn ít nhất một biến thể còn hàng, đảm bảo sản phẩm ở trạng thái "active"
        const product = await Product.findByPk(productId as number, {
          transaction: t,
        });
        if (product && product.status === "outofstock") {
          await Product.update(
            { status: "active" },
            { where: { id: productId }, transaction: t }
          );
          console.log(
            `Sản phẩm ID ${productId} đã được cập nhật thành còn hàng.`
          );
        }
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

    // Phân trang
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Điều kiện lọc theo trạng thái (nếu có)
    const where: any = { userId };
    if (req.query.status) {
      where.status = req.query.status;
    }

    // Đếm tổng số đơn hàng
    const count = await Order.count({ where });

    // Lấy danh sách đơn hàng
    const orders = await Order.findAll({
      where,
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
    const orderId = parseInt(req.params.id);

    const order = await Order.findByPk(orderId, {
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
 * Hủy đơn hàng và hoàn trả tồn kho
 */
/**
 * Cancel order and update product stock and status
 */
export const cancelOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { cancelNote } = req.body;

    if (!req.user) {
      await t.rollback();
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;

    // Tìm đơn hàng với chi tiết của nó
    const order = await Order.findByPk(id, {
      transaction: t,
      include: [{ model: OrderDetail, as: "orderDetails" }],
    });

    // Kiểm tra đơn hàng tồn tại
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

    // Danh sách sản phẩm cần kiểm tra sau khi cập nhật tồn kho
    const updatedProductIds = new Set<number>();
    const orderDetails = (order as any).orderDetails || [];

    console.log(
      `[INFO] Đơn hàng ${id} có ${orderDetails.length} chi tiết để hoàn trả`
    );

    // BƯỚC 1: Hoàn trả tồn kho
    for (const detail of orderDetails) {
      const productId = detail.productId;
      console.log(
        `[INFO] Xử lý hoàn trả cho sản phẩm ID ${productId}, màu ${detail.color}, size ${detail.size}, quantity ${detail.quantity}`
      );

      // Lưu lại ID để kiểm tra sau
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
        console.warn(
          `[WARN] Không tìm thấy chi tiết sản phẩm ID ${productId}, màu ${detail.color}, productDetailId ${detail.productDetailId}`
        );
        continue;
      }

      const inventory = await ProductInventory.findOne({
        where: { productDetailId: productDetail.id, size: detail.size },
        transaction: t,
      });

      if (inventory) {
        const currentStock = inventory.getDataValue("stock");
        const newStock = currentStock + detail.quantity;

        console.log(
          `[INFO] Cập nhật tồn kho sản phẩm ID ${productId}: ${currentStock} + ${detail.quantity} = ${newStock}`
        );

        await inventory.update({ stock: newStock }, { transaction: t });
      } else {
        console.log(
          `[INFO] Tạo mới tồn kho cho sản phẩm ID ${productId}, màu ${detail.color}, kích cỡ ${detail.size}`
        );
        await ProductInventory.create(
          {
            productDetailId: productDetail.id,
            size: detail.size,
            stock: detail.quantity,
          },
          { transaction: t }
        );
      }

      console.log(
        `[INFO] Đã cập nhật tồn kho thành công cho sản phẩm ID ${productId}`
      );
    }

    // BƯỚC 2: Truy vấn và cập nhật trạng thái sản phẩm
    console.log(
      `[INFO] Có ${updatedProductIds.size} sản phẩm cần kiểm tra trạng thái`
    );
    for (const productId of updatedProductIds) {
      try {
        // Truy vấn trạng thái sản phẩm
        const product = await Product.findByPk(productId, { transaction: t });
        if (!product) {
          console.warn(`[WARN] Sản phẩm ID ${productId} không tồn tại`);
          continue;
        }

        console.log(
          `[INFO] Kiểm tra sản phẩm ID ${productId}, trạng thái hiện tại: ${product.status}`
        );

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

        console.log(
          `[INFO] Tổng tồn kho sản phẩm ID ${productId}: ${totalStock}`
        );

        // Cập nhật trạng thái sản phẩm
        if (totalStock > 0 && product.status !== "active") {
          console.log(
            `[INFO] Cập nhật trạng thái sản phẩm ID ${productId} từ ${product.status} sang active`
          );
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
          console.log(
            `[INFO] Cập nhật trạng thái sản phẩm ID ${productId} từ ${product.status} sang outofstock`
          );
          await product.update({ status: "outofstock" }, { transaction: t });
        } else {
          console.log(
            `[INFO] Không cần cập nhật trạng thái sản phẩm ID ${productId} (trạng thái hiện tại: ${product.status}, totalStock: ${totalStock})`
          );
        }
      } catch (error) {
        console.error(
          `[ERROR] Lỗi khi cập nhật trạng thái sản phẩm ID ${productId}:`,
          error
        );
      }
    }

    // Commit transaction
    await t.commit();
    console.log("[INFO] Transaction đã commit thành công");

    // Trả về response
    res.status(200).json({ message: "Hủy đơn hàng thành công" });
  } catch (error: any) {
    await t.rollback();
    console.error("[ERROR] Lỗi khi hủy đơn hàng:", {
      message: error.message,
      stack: error.stack,
      orderId: req.params.id,
    });
    res.status(500).json({
      message: "Đã xảy ra lỗi khi hủy đơn hàng",
      error: error.message,
    });
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

// Lấy đơn hàng của một user cụ thể (chỉ dành cho admin)
export const getUserOrdersByAdmin = async (req: Request, res: Response) => {
  try {
    // Kiểm tra quyền admin và employee
    if (!req.user || (req.user.role !== 1 && req.user.role !== 2)) {
      res.status(403).json({ message: "Không có quyền truy cập" });
      return;
    }

    const { userId } = req.params;

    // Lấy thông tin user
    const user = await Users.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      res.status(404).json({ message: "Người dùng không tồn tại" });
      return;
    }

    // Phân trang
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Điều kiện lọc theo trạng thái (nếu có)
    const where: any = { userId };
    if (req.query.status) {
      where.status = req.query.status;
    }
    // điều kiện lọc id đơn hàng orderId (nếu có)
    if (req.query.orderId) {
      where.id = req.query.orderId;
    }
    // điều kiện lọc theo khoảng thời gian (nếu có)
    if (req.query.startDate || req.query.endDate) {
      where.createdAt = {};

      // Nếu có startDate
      if (req.query.startDate) {
        const startDate = new Date(req.query.startDate as string);
        startDate.setHours(0, 0, 0, 0);
        where.createdAt[Op.gte] = startDate;
      }

      // Nếu có endDate
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate as string);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = endDate;
      }
    }
    // Nếu chỉ có orderDate
    else if (req.query.orderDate) {
      const orderDate = new Date(req.query.orderDate as string);
      where.createdAt = {
        [Op.gte]: new Date(orderDate.setHours(0, 0, 0, 0)),
        [Op.lte]: new Date(orderDate.setHours(23, 59, 59, 999)),
      };
    }

    // Đếm tổng số đơn hàng
    const count = await Order.count({ where });

    // Lấy đơn hàng với phân trang
    const orders = await Order.findAll({
      where,
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
  } catch (error: any) {
    console.error("Error in getUserOrdersByAdmin:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * get all order by employee
 */
// employee chỉ xem được 4 chữ đầu email và 4 chữ cuối email trước @
// xem được 4 số đầu và 3 số cuối của sdt
export const getAllOrdersByEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

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
      distinct: true,
      include: includeOptions,
    });

    // Lấy danh sách đơn hàng
    const orders = await Order.findAll({
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

    // Chỉ lấy 4 chữ đầu và 4 chữ cuối của email và 4 số đầu và 3 số cuối của sdt
    const modifiedOrders = orders.map((order) => {
      const user = (order as any).user || {};
      const userEmail = user.email || "";
      const userPhoneNumber = order.phoneNumber || "";

      return {
        ...order.get(),
        user: {
          id: user.id,
          username: user.username,
          // KHÔNG trả về email đầy đủ!
          email:
            userEmail.length > 8
              ? `${userEmail.slice(0, 4)}...${userEmail.slice(
                  userEmail.indexOf("@") - 4
                )}`
              : userEmail,
        },
        // Nếu muốn, có thể bỏ luôn trường userEmail ở ngoài
        phoneNumber:
          userPhoneNumber.length > 7
            ? `${userPhoneNumber.slice(0, 4)}...${userPhoneNumber.slice(-3)}`
            : userPhoneNumber,
      };
    });
    res.status(200).json({
      orders: modifiedOrders,
      pagination: {
        total: count,
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        perPage: Number(limit),
      },
    });
  } catch (error: any) {
    console.error("Error in getAllOrdersByEmployee:", error);
    res.status(500).json({ message: error.message });
  }
};
