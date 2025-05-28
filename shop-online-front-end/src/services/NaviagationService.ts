// src/services/NavigationService.ts
import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "./AuthClient";

export interface NavigationMenuItem {
  id: number;
  name: string;
  slug: string;
  link: string | null;
  categoryId: number | null;
  order: number;
  parentId: number | null;
  isActive: boolean;
  megaMenu: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
    image?: string;
  };
  children?: NavigationMenuItem[];
}

export class NavigationService {
  // Lấy menu công khai cho frontend
  static async getPublicMenu(): Promise<NavigationMenuItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/navigation/public`, {
        cache: "no-store", // Thêm option để không cache
      });

      if (!response.ok) {
        throw new Error("Không thể lấy menu");
      }

      return await response.json();
    } catch {
      return [];
    }
  }

  // Các phương thức cho admin quản lý
  static async getAllMenuItems(): Promise<NavigationMenuItem[]> {
    try {
      // Sử dụng fetchWithAuth thay vì fetch với getAuthHeader
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/navigation`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách menu");
      }

      return await response.json();
    } catch {
      return [];
    }
  }

  static async createMenuItem(
    menuItem: Omit<NavigationMenuItem, "id" | "slug">
  ): Promise<NavigationMenuItem> {
    try {
      // Sử dụng fetchWithAuth với options
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/navigation`,
        {
          method: "POST",
          body: JSON.stringify(menuItem),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tạo menu");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async updateMenuItem(
    id: number,
    menuItem: Partial<NavigationMenuItem>
  ): Promise<NavigationMenuItem> {
    try {
      // Sử dụng fetchWithAuth với options
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/navigation/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(menuItem),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật menu");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
  // Sửa phương thức deleteMenuItem để hiển thị message từ backend

  static async deleteMenuItem(id: number): Promise<{ message: string }> {
    try {
      // Sử dụng fetchWithAuth với options
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/navigation/${id}`,
        {
          method: "DELETE",
        }
      );

      // Nếu status 204 (No Content) - đây là thành công không có body
      if (response.status === 204) {
        return { message: "Đã xóa menu thành công" };
      }

      // Đối với tất cả các status code khác, cố gắng đọc JSON response
      try {
        const responseData = await response.json();

        // Nếu không thành công, trả về message từ API thay vì throw error
        if (!response.ok) {
          // Sử dụng message từ API hoặc message mặc định
          return { message: responseData.message || "Không thể xóa menu" };
        }

        // Trường hợp thành công với body
        return responseData;
      } catch {
        // Lỗi khi parse JSON (không có body hoặc body không phải JSON)
        if (!response.ok) {
          // Không trả về mã lỗi, chỉ trả về thông báo chung
          return { message: "Không thể xóa menu" };
        }

        // Fallback cho thành công
        return { message: "Đã xóa menu thành công" };
      }
    } catch (error) {
      // Trả về message lỗi thay vì throw
      if (error instanceof Error) {
        return { message: error.message };
      } else {
        return { message: "Có lỗi xảy ra khi xóa menu" };
      }
    }
  }
}
