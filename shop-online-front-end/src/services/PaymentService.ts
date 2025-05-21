import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "./AuthClient";

export interface VNPayCreatePaymentResponse {
  paymentUrl: string;
}

export interface VNPayReturnData {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo?: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

export interface VNPayPaymentResultResponse {
  success: boolean;
  message: string;
  orderId?: number | string;
  paymentInfo?: {
    amount: number;
    bankCode?: string;
    transactionDate?: string;
    transactionNo?: string;
    cardType?: string;
  };
}

export class PaymentService {
  /**
   * Tạo URL thanh toán VNPAY từ thông tin đơn hàng
   */
  static async createVNPayPaymentUrl(
    orderId: string | number,
    amount: number,
    orderInfo: string
  ): Promise<VNPayCreatePaymentResponse> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/payments/vnpay/create-payment-url`,
        {
          method: "POST",
          body: JSON.stringify({
            orderId,
            amount,
            orderInfo,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating VNPAY payment URL:", error);
      throw error;
    }
  }

  /**
   * Xử lý kết quả thanh toán VNPAY từ URL callback
   */
  static async processVNPayReturn(
    params: URLSearchParams
  ): Promise<VNPayPaymentResultResponse> {
    try {
      // Convert URLSearchParams to object
      const queryParams: Record<string, string> = {};
      params.forEach((value, key) => {
        queryParams[key] = value;
      });

      const response = await fetch(
        `${API_BASE_URL}/payments/vnpay/payment-return`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(queryParams),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error processing VNPAY return:", error);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán của đơn hàng
   */
  static async checkPaymentStatus(
    orderId: string | number
  ): Promise<{ paid: boolean; paymentStatusId: number }> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/payments/check-status/${orderId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking payment status:", error);
      throw error;
    }
  }
}
