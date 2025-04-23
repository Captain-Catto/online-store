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
    } catch (error) {
      console.error("Lỗi khi lấy menu:", error);
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
    } catch (error) {
      console.error("Lỗi khi lấy danh sách menu:", error);
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
      console.error("Lỗi khi tạo menu:", error);
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
      console.error("Lỗi khi cập nhật menu:", error);
      throw error;
    }
  }

  static async deleteMenuItem(id: number): Promise<void> {
    try {
      // Sử dụng fetchWithAuth với options
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/navigation/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa menu");
      }
    } catch (error) {
      console.error("Lỗi khi xóa menu:", error);
      throw error;
    }
  }
}
