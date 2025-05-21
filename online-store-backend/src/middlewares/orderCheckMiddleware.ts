import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import Order from "../models/Order";
import OrderDetail from "../models/OrderDetail";
import ProductInventory from "../models/ProductInventory";
import ProductDetail from "../models/ProductDetail";
import Product from "../models/Product";
import sequelize from "../config/db";

/**
 * Middleware kiểm tra và hủy tự động các đơn hàng quá hạn thanh toán
 *
 * - Chạy mỗi khi có request đến API /orders hoặc /admin/*
 * - Chỉ kiểm tra mỗi 15 phút một lần để tránh ảnh hưởng đến hiệu suất
 *
 * @param req - Request
 * @param res - Response
 * @param next - NextFunction
 */
export const checkExpiredPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Biến static để lưu trữ thời gian kiểm tra gần nhất
    const LAST_CHECK_KEY = "last_check_expired_orders";

    // Lấy thời gian kiểm tra gần nhất từ global
    const lastCheck = (global as any)[LAST_CHECK_KEY] || 0;
    const now = Date.now();

    // Chỉ kiểm tra mỗi 15 phút một lần
    const INTERVAL = 15 * 60 * 1000; // 15 phút

    if (now - lastCheck < INTERVAL) {
      return next();
    }

    // Cập nhật thời gian kiểm tra gần nhất
    (global as any)[LAST_CHECK_KEY] = now;

    console.log(
      `[${new Date().toISOString()}] Kiểm tra đơn hàng quá hạn thanh toán...`
    );

    // Tạo một ngày trước từ thời điểm hiện tại
    const oneDayBefore = new Date();
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);

    // Sử dụng transaction để đảm bảo tính nhất quán
    const t = await sequelize.transaction();

    try {
      // Tìm các đơn hàng cần hủy: không phải COD (paymentMethodId != 1),
      // đơn ở trạng thái pending và được tạo cách đây hơn 1 ngày
      const pendingOrders = await Order.findAll({
        where: {
          paymentMethodId: { [Op.ne]: 1 }, // Không phải COD
          status: "pending", // Đơn hàng đang ở trạng thái pending
          createdAt: { [Op.lt]: oneDayBefore }, // Tạo cách đây hơn 1 ngày
        },
        include: [
          {
            model: OrderDetail,
            as: "orderDetails",
          },
        ],
        transaction: t,
      });

      if (pendingOrders.length === 0) {
        await t.commit();
        console.log(
          `[${new Date().toISOString()}] Không có đơn hàng nào cần hủy tự động`
        );
        return next();
      }

      const updatedProductIds = new Set<number>();
      let cancelledCount = 0;

      // Xử lý từng đơn hàng
      for (const order of pendingOrders) {
        // Cập nhật trạng thái đơn hàng thành cancelled và trạng thái thanh toán thành cancelled (5)
        await order.update(
          {
            status: "cancelled",
            paymentStatusId: 5, // Cancelled payment status
            cancelNote: "Tự động hủy do không thanh toán sau 24 giờ",
          },
          { transaction: t }
        );

        // Hoàn trả số lượng tồn kho
        const orderDetails = (order as any).orderDetails || [];
        for (const detail of orderDetails) {
          const productId = detail.productId;
          updatedProductIds.add(productId);

          // Tìm ProductDetail dựa trên productDetailId hoặc productId và color
          let productDetail;
          if (detail.productDetailId) {
            productDetail = await ProductDetail.findByPk(
              detail.productDetailId,
              {
                transaction: t,
              }
            );
          } else {
            productDetail = await ProductDetail.findOne({
              where: { productId, color: detail.color },
              transaction: t,
            });
          }

          if (!productDetail) {
            continue;
          }

          // Cập nhật lại tồn kho
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

        cancelledCount++;
      }

      // Cập nhật lại trạng thái sản phẩm dựa trên tồn kho
      for (const productId of updatedProductIds) {
        try {
          // Logic cập nhật trạng thái sản phẩm giữ nguyên...
          const product = await Product.findByPk(productId, { transaction: t });
          if (!product) continue;

          // Tính tổng tồn kho
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
            await product.update({ status: "active" }, { transaction: t });
          } else if (totalStock === 0 && product.status !== "outofstock") {
            await product.update({ status: "outofstock" }, { transaction: t });
          }
        } catch (error) {
          console.error(
            `[ERROR] Lỗi khi cập nhật sản phẩm ID ${productId}:`,
            error
          );
        }
      }

      // Commit transaction
      await t.commit();

      console.log(
        `[${new Date().toISOString()}] Đã hủy ${cancelledCount} đơn hàng quá hạn thanh toán`
      );
    } catch (error: any) {
      await t.rollback();
      console.error("[ERROR] Lỗi khi hủy đơn hàng tự động:", {
        message: error.message,
        stack: error.stack,
      });
    }

    next();
  } catch (error) {
    // Đảm bảo middleware không làm gián đoạn request
    console.error("Error in checkExpiredPayments middleware:", error);
    next();
  }
};
