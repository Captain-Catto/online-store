import { Request, Response } from "express";
import crypto from "crypto";
import qs from "qs";
import Order from "../models/Order";
import sequelize from "../config/db";
import PaymentStatus from "../models/PaymentStatus";
import { format } from "date-fns";

// VNPAY Configuration
const vnp_TmnCode = process.env.VNP_TMN_CODE || "DEMO";
const vnp_HashSecret = process.env.VNP_HASH_SECRET || "VNPAYSECRET";
const vnp_Url =
  process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl =
  process.env.VNP_RETURN_URL || "http://localhost:3000/payment/vnpay-return";
const vnp_IpnUrl =
  process.env.VNP_IPN_URL || "http://localhost:8080/api/payments/vnpay/ipn";

/**
 * Tạo URL thanh toán VNPAY
 */
export const createVNPayPaymentUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId, amount, orderInfo = "Thanh toan don hang" } = req.body;

    if (!orderId || !amount) {
      res
        .status(400)
        .json({ message: "Thiếu thông tin đơn hàng hoặc số tiền" });
      return;
    }

    // Get IP Address
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      req.ip ||
      "127.0.0.1";

    // Lấy thông tin từ Order
    const order = await Order.findByPk(orderId);
    if (!order) {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      return;
    }

    // Create VNPAY payment URL
    const createDate = format(new Date(), "yyyyMMddHHmmss");
    const vnpOrderId = orderId.toString() + "_" + createDate;
    const currCode = "VND";

    // Convert amount to VND without decimal (amount * 100)
    const amountInVND = Math.floor(amount) * 100;

    // Build payment parameters
    let vnpParams: any = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: currCode,
      vnp_TxnRef: vnpOrderId,
      vnp_OrderInfo: orderInfo,
      vnp_Amount: amountInVND,
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: ipAddr.toString(),
      vnp_CreateDate: createDate,
      vnp_OrderType: "other",
    };

    // Add expiration time - 15 minutes from now
    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 15);
    vnpParams.vnp_ExpireDate = format(expireDate, "yyyyMMddHHmmss");

    // Sort parameters by field name
    vnpParams = sortObject(vnpParams);

    // Create hash data
    const signData = qs.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnpParams.vnp_SecureHash = signed;

    // Create payment URL
    const paymentUrl =
      vnp_Url + "?" + qs.stringify(vnpParams, { encode: false });

    // Return payment URL to client
    res.status(200).json({ paymentUrl });
  } catch (error: any) {
    console.error("Error creating VNPAY payment URL:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Xử lý VNPAY Payment Return
 */
export const processVNPayReturn = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const vnpParams = req.body;
    const secureHash = vnpParams["vnp_SecureHash"];

    // Remove secure hash and hash type from params to verify
    delete vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHashType"];

    // Sort params
    const sortedParams = sortObject(vnpParams);

    // Create sign data
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // Verify secure hash
    if (secureHash !== signed) {
      res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
      return;
    }

    // Extract order ID from vnp_TxnRef (format: orderId_timestamp)
    const vnp_TxnRef = vnpParams["vnp_TxnRef"];
    const orderId = vnp_TxnRef.split("_")[0];

    // Check payment status
    const vnp_ResponseCode = vnpParams["vnp_ResponseCode"];
    const vnp_TransactionStatus = vnpParams["vnp_TransactionStatus"];
    const vnp_BankCode = vnpParams["vnp_BankCode"] || "";

    // Start transaction
    const t = await sequelize.transaction();

    try {
      // Find order
      const order = await Order.findByPk(orderId, { transaction: t });

      if (!order) {
        await t.rollback();
        res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
        return;
      }

      // Check if payment was successful (00 means success)
      if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
        // Update order payment status to Paid (2)
        await order.update(
          {
            paymentMethodId: 4, // VNPAY
            paymentStatusId: 2, // Paid
            status:
              order.getDataValue("status") === "pending"
                ? "processing"
                : order.getDataValue("status"),
          },
          { transaction: t }
        );

        await t.commit();

        // Return success data
        res.status(200).json({
          success: true,
          message: "Thanh toán thành công",
          orderId,
          paymentInfo: {
            amount: Number(vnpParams["vnp_Amount"]) / 100, // Convert back from VND cents
            bankCode: vnp_BankCode,
            transactionDate: vnpParams["vnp_PayDate"],
            transactionNo: vnpParams["vnp_TransactionNo"],
            cardType: vnpParams["vnp_CardType"],
          },
        });
      } else {
        // Payment failed
        await order.update(
          {
            paymentStatusId: 3, // Failed
          },
          { transaction: t }
        );

        await t.commit();

        res.status(200).json({
          success: false,
          message: "Thanh toán không thành công",
          orderId,
        });
      }
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error: any) {
    console.error("Error processing VNPAY return:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Xử lý VNPAY IPN (Instant Payment Notification)
 */
export const processVNPayIPN = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const vnpParams = req.query;
    const secureHash = vnpParams["vnp_SecureHash"];

    // Remove secure hash and hash type from params to verify
    delete vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHashType"];

    // Sort params
    const sortedParams = sortObject(vnpParams);

    // Create sign data
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // Verify secure hash
    if (secureHash === signed) {
      // Extract order ID from vnp_TxnRef (format: orderId_timestamp)
      const vnp_TxnRef = vnpParams["vnp_TxnRef"] as string;
      const orderId = vnp_TxnRef.split("_")[0];

      // Check payment status
      const vnp_ResponseCode = vnpParams["vnp_ResponseCode"];
      const vnp_TransactionStatus = vnpParams["vnp_TransactionStatus"];

      // Start transaction
      const t = await sequelize.transaction();

      try {
        // Find order
        const order = await Order.findByPk(orderId, { transaction: t });

        if (!order) {
          await t.rollback();
          // Return successful response with error code 01 (Order not found)
          res.status(200).json({
            RspCode: "01",
            Message: "Order not found",
          });
          return;
        }

        // Check if payment was successful (00 means success)
        if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
          // Update order payment status to Paid (2)
          await order.update(
            {
              paymentMethodId: 4, // VNPAY
              paymentStatusId: 2, // Paid
              status:
                order.getDataValue("status") === "pending"
                  ? "processing"
                  : order.getDataValue("status"),
            },
            { transaction: t }
          );
        } else {
          // Payment failed
          await order.update(
            {
              paymentStatusId: 3, // Failed
            },
            { transaction: t }
          );
        }

        await t.commit();

        // Return successful response
        res.status(200).json({
          RspCode: "00",
          Message: "Confirm Success",
        });
      } catch (error) {
        await t.rollback();
        // Return error response
        res.status(200).json({
          RspCode: "99",
          Message: "Unknown error",
        });
      }
    } else {
      // Invalid signature
      res.status(200).json({
        RspCode: "97",
        Message: "Invalid signature",
      });
    }
  } catch (error: any) {
    console.error("Error processing VNPAY IPN:", error);
    // Return error response
    res.status(200).json({
      RspCode: "99",
      Message: "Unknown error",
    });
  }
};

/**
 * Kiểm tra trạng thái thanh toán của đơn hàng
 */
export const checkPaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);

    if (!order) {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      return;
    }

    const paymentStatusId = order.getDataValue("paymentStatusId");
    const paid = paymentStatusId === 2; // 2 = Paid

    res.status(200).json({
      paid,
      paymentStatusId,
    });
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to sort object by key
function sortObject(obj: any): any {
  const sorted: any = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    if (
      obj[key] !== null &&
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key])
    ) {
      sorted[key] = sortObject(obj[key]);
    } else {
      sorted[key] = obj[key];
    }
  }

  return sorted;
}
