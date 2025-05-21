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
    console.log("Request body:", req.body);
    const {
      orderId,
      amount,
      orderInfo = "Thanh toan don hang",
      returnUrl,
    } = req.body;

    // Loại bỏ ký tự # từ orderInfo
    const sanitizedOrderInfo = orderInfo.replace(/#/g, "");

    // Build payment parameters - đảm bảo không có undefined
    const vnpParams: any = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: `${orderId}_${format(new Date(), "yyyyMMddHHmmss")}`,
      vnp_OrderInfo: sanitizedOrderInfo,
      vnp_OrderType: "other",
      vnp_Amount: Math.round(Number(amount)) * 100,
      vnp_ReturnUrl: returnUrl || vnp_ReturnUrl,
      vnp_IpAddr: req.ip || req.socket.remoteAddress || "127.0.0.1",
      vnp_CreateDate: format(new Date(), "yyyyMMddHHmmss"),
    };

    // Sort parameters by field name
    const sortedParams = sortObject(vnpParams);
    console.log("Sorted params:", sortedParams);

    // Create hash data
    const signData = qs.stringify(sortedParams, { encode: false });
    console.log("Sign data:", signData);

    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    console.log("Secure hash:", signed);

    sortedParams.vnp_SecureHash = signed;

    // Create payment URL - encode=true để đảm bảo URL an toàn
    const paymentUrl =
      vnp_Url + "?" + qs.stringify(sortedParams, { encode: true });
    console.log("Payment URL:", paymentUrl);

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
    console.log("Request body:", req.body);

    const secureHash = vnpParams["vnp_SecureHash"];
    console.log("SecureHash:", secureHash);

    // Tạo bản sao của params và xóa vnp_SecureHash
    const params = { ...vnpParams };
    delete params["vnp_SecureHash"];
    // Trong 2.1.0 không cần xóa vnp_SecureHashType vì nó không được gửi đi
    // nhưng để đảm bảo tương thích, vẫn giữ lại đoạn code này
    if (params["vnp_SecureHashType"]) {
      delete params["vnp_SecureHashType"];
    }

    // Phần còn lại của code không thay đổi
    const sortedParams = sortObject(params);

    // Create sign data
    const signData = qs.stringify(sortedParams, { encode: false });
    console.log("Sign data:", signData);

    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // Bổ sung log để debug
    console.log("Generated hash:", signed);
    console.log("Received hash:", secureHash);

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
    console.log("IPN Request body:", req.query);
    const secureHash = vnpParams["vnp_SecureHash"] as string;
    console.log("IPN SecureHash:", secureHash);

    // Remove secure hash and hash type from params to verify
    const params = { ...vnpParams };
    delete params["vnp_SecureHash"];
    delete params["vnp_SecureHashType"];

    // Sort params
    const sortedParams = sortObject(params);

    // Create sign data
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    console.log("Generated hash:", signed);

    // Verify secure hash
    if (secureHash === signed) {
      // Extract order ID from vnp_TxnRef (format: orderId_timestamp)
      const vnp_TxnRef = vnpParams["vnp_TxnRef"] as string;
      const orderId = vnp_TxnRef.split("_")[0];
      const rspCode = vnpParams["vnp_ResponseCode"] as string;

      // Check order exists
      const order = await Order.findByPk(orderId);
      if (!order) {
        res.status(200).json({ RspCode: "01", Message: "Order not found" });
        return;
      }

      // Check amount match (optional but recommended)
      const orderAmount = order.getDataValue("total");
      const paymentAmount = Number(vnpParams["vnp_Amount"]) / 100;
      if (Math.abs(orderAmount - paymentAmount) > 1) {
        // Allow small difference due to rounding
        res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
        return;
      }

      // Check payment status in your database
      const currentPaymentStatus = order.getDataValue("paymentStatusId");
      // If payment is already processed, return success but don't update again
      if (currentPaymentStatus === 2 || currentPaymentStatus === 3) {
        res.status(200).json({
          RspCode: "02",
          Message: "This order has been updated to the payment status",
        });
        return;
      }

      // Update payment status based on response code
      if (rspCode === "00") {
        // Payment successful
        await order.update({
          paymentMethodId: 4, // VNPAY
          paymentStatusId: 2, // Paid
          status:
            order.getDataValue("status") === "pending"
              ? "processing"
              : order.getDataValue("status"),
        });
      } else {
        // Payment failed
        await order.update({
          paymentStatusId: 3, // Failed
        });
      }

      // Return success response
      res.status(200).json({
        RspCode: "00",
        Message: "Confirm Success",
      });
      return;
    } else {
      // Invalid signature
      res.status(200).json({
        RspCode: "97",
        Message: "Checksum failed",
      });
      return;
    }
  } catch (error: any) {
    console.error("Error processing VNPAY IPN:", error);
    res.status(200).json({
      RspCode: "99",
      Message: "Unknown error",
    });
    return;
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
  // Sắp xếp các key theo alphabet
  const sorted: any = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      sorted[key] = obj[key];
    }
  }

  return sorted;
}
