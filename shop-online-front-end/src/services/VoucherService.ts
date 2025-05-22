import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "./AuthClient";
import { Promotion } from "@/types/promotion";

export class VoucherService {
  /**
   * Lấy danh sách voucher khả dụng cho người dùng hiện tại
   * @returns Promise<Promotion[]> - Danh sách các voucher được định dạng thành Promotion
   */
  static async getUserAvailableVouchers(): Promise<Promotion[]> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/vouchers/user/available`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách voucher");
      }

      return await response.json();
    } catch {
      return [];
    }
  }

  /**
   * Kiểm tra và áp dụng voucher vào đơn hàng
   * @param code - Mã voucher
   * @param orderTotal - Tổng giá trị đơn hàng
   * @returns thông tin voucher nếu hợp lệ
   */
  static async validateVoucher(code: string, orderTotal: number) {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/vouchers/validate`,
        {
          method: "POST",
          body: JSON.stringify({ code, orderTotal }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Mã giảm giá không hợp lệ");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Kiểm tra xem một voucher có thể áp dụng cho đơn hàng không
   * @param code - Mã voucher
   * @returns true nếu voucher có thể áp dụng, false nếu không
   */
  static async canApplyVoucher(
    code: string,
    orderTotal: number
  ): Promise<boolean> {
    try {
      await this.validateVoucher(code, orderTotal);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format giá trị tiền sang định dạng VND
   * @param value - Giá trị cần format
   * @returns chuỗi đã được format
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Tính số tiền giảm giá dựa trên loại voucher và giá trị đơn hàng
   * @param type - Loại voucher (percentage hoặc fixed)
   * @param value - Giá trị voucher
   * @param orderTotal - Tổng giá trị đơn hàng
   * @returns Số tiền giảm giá
   */
  static calculateDiscount(
    type: string,
    value: number,
    orderTotal: number
  ): number {
    if (type === "percentage") {
      return Math.floor((orderTotal * value) / 100);
    } else {
      return Math.min(value, orderTotal);
    }
  }
}
