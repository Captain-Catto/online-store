import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "./AuthClient";
import { Promotion } from "@/types/promotion";

// Định nghĩa cho AdminVoucher
export interface AdminVoucher {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValue: number;
  expirationDate: string;
  status: "active" | "inactive" | "expired";
  usageCount: number;
  usageLimit: number;
  createdAt?: string;
  updatedAt?: string;
}

// Định nghĩa cho CreateVoucherData
export interface CreateVoucherData {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValue: number;
  expirationDate: string;
  status: "active" | "inactive" | "expired";
  usageLimit: number;
}

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

  /**
   * ADMIN: Lấy danh sách voucher có phân trang và lọc
   * @param page Trang hiện tại
   * @param limit Số lượng voucher mỗi trang
   * @param filters Các bộ lọc (status, search, type, minValue, maxValue)
   * @returns Danh sách voucher và thông tin phân trang
   */
  static async getVouchersWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: {
      status?: string;
      search?: string;
      type?: string;
    } = {}
  ): Promise<{
    vouchers: AdminVoucher[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      perPage: number;
    };
  }> {
    try {
      const params = new URLSearchParams();

      // Pagination parameters
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      // Filter parameters
      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }

      if (filters.search) {
        params.append("search", filters.search);
      }

      if (filters.type && filters.type !== "all") {
        params.append("type", filters.type);
      }

      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/vouchers?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách voucher");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Lỗi không xác định khi lấy danh sách voucher");
    }
  }

  /**
   * ADMIN: Tạo voucher mới
   * @param voucherData Dữ liệu voucher cần tạo
   * @returns Voucher đã được tạo
   */
  static async createVoucher(
    voucherData: CreateVoucherData
  ): Promise<AdminVoucher> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/vouchers`,
        {
          method: "POST",
          body: JSON.stringify(voucherData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tạo voucher");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Lỗi không xác định khi tạo voucher");
    }
  }

  /**
   * ADMIN: Cập nhật voucher
   * @param id ID của voucher cần cập nhật
   * @param voucherData Dữ liệu cập nhật
   * @returns Voucher đã được cập nhật
   */
  static async updateVoucher(
    id: number,
    voucherData: Partial<CreateVoucherData>
  ): Promise<AdminVoucher> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/vouchers/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(voucherData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể cập nhật voucher");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Lỗi không xác định khi cập nhật voucher");
    }
  }

  /**
   * ADMIN: Xóa voucher
   * @param id ID của voucher cần xóa
   * @returns Thông báo kết quả
   */
  static async deleteVoucher(id: number): Promise<{ message: string }> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/vouchers/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể xóa voucher");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Lỗi không xác định khi xóa voucher");
    }
  }
}
