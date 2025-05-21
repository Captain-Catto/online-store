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

    // Tạo URL thanh toán theo cách mới (giống code tham khảo)
    const redirectUrl = new URL(vnp_Url);
    const searchParams = redirectUrl.searchParams;

    // Sắp xếp và thêm tham số
    Object.entries(vnpParams)
      .sort(([key1], [key2]) => key1.toString().localeCompare(key2.toString()))
      .forEach(([key, value]) => {
        // Skip empty value
        if (!value || value === "" || value === undefined || value === null) {
          return;
        }
        searchParams.append(key, value.toString());
      });

    // Tạo chữ ký
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac
      .update(Buffer.from(redirectUrl.search.slice(1).toString(), "utf-8"))
      .digest("hex");

    // Thêm chữ ký vào URL
    searchParams.append("vnp_SecureHash", signed);

    // Lấy URL đầy đủ
    const paymentUrl = redirectUrl.toString();
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
    const vnpParams = req.query;
    console.log("Request query:", vnpParams);

    const secureHash = vnpParams.vnp_SecureHash as string;
    console.log("SecureHash:", secureHash);

    if (!secureHash) {
      res.status(400).json({
        success: false,
        message: "Missing security hash",
      });
      return;
    }

    // Tạo bản sao của params và xóa vnp_SecureHash
    const params = { ...vnpParams };
    delete params.vnp_SecureHash;
    if (params.vnp_SecureHashType) {
      delete params.vnp_SecureHashType;
    }

    // Tạo URL để verify
    const redirectUrl = new URL(vnp_ReturnUrl);
    const searchParams = redirectUrl.searchParams;

    // Sắp xếp và thêm tham số
    Object.entries(params)
      .sort(([key1], [key2]) => key1.toString().localeCompare(key2.toString()))
      .forEach(([key, value]) => {
        // Skip empty value
        if (!value || value === "" || value === undefined || value === null) {
          return;
        }
        searchParams.append(key, value.toString());
      });

    // Tạo chữ ký để verify
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac
      .update(Buffer.from(redirectUrl.search.slice(1).toString(), "utf-8"))
      .digest("hex");

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

    // Phần còn lại của xử lý thanh toán giữ nguyên
    const vnp_TxnRef = vnpParams.vnp_TxnRef as string;
    const orderId = vnp_TxnRef.split("_")[0];
    // ... tiếp tục xử lý
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
    console.log("IPN Request query:", vnpParams);

    const secureHash = vnpParams.vnp_SecureHash as string;
    console.log("IPN SecureHash:", secureHash);

    if (!secureHash) {
      res.status(200).json({
        RspCode: "97",
        Message: "Missing secure hash",
      });
      return;
    }

    // Tạo bản sao của params và xóa vnp_SecureHash
    const params = { ...vnpParams };
    delete params.vnp_SecureHash;
    if (params.vnp_SecureHashType) {
      delete params.vnp_SecureHashType;
    }

    // Tạo URL để verify
    const redirectUrl = new URL(vnp_IpnUrl);
    const searchParams = redirectUrl.searchParams;

    // Sắp xếp và thêm tham số
    Object.entries(params)
      .sort(([key1], [key2]) => key1.toString().localeCompare(key2.toString()))
      .forEach(([key, value]) => {
        // Skip empty value
        if (!value || value === "" || value === undefined || value === null) {
          return;
        }
        searchParams.append(key, value.toString());
      });

    // Tạo chữ ký để verify
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac
      .update(Buffer.from(redirectUrl.search.slice(1).toString(), "utf-8"))
      .digest("hex");

    console.log("Generated hash:", signed);
    console.log("Received hash:", secureHash);

    // Verify secure hash
    if (secureHash !== signed) {
      res.status(200).json({
        RspCode: "97",
        Message: "Checksum failed",
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

function sortObject(obj: any): any {
  let sorted: any = {};
  let str: string[] = [];
  let key: string;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(key);
    }
  }

  str.sort();

  for (let i = 0; i < str.length; i++) {
    sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, "+");
  }

  return sorted;
}
