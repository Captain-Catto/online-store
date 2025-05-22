// filepath: d:\desktop\hoc\khoa-iron-hack\J2345\project\online-store\shop-online-front-end\src\services\AdminMenuService.ts
import { AuthClient } from "./AuthClient";
import { API_BASE_URL } from "@/config/apiConfig";
import { MenuItemData } from "@/hooks/useAdminMenu"; // Import interface

const API_URL = `${API_BASE_URL}/admin-menu/manage`; // Base URL cho quản lý

export const AdminMenuService = {
  // Lấy danh sách phẳng
  getAllMenuItems: async (): Promise<MenuItemData[]> => {
    const response = await AuthClient.fetchWithAuth(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch menu items");
    }
    return response.json();
  },

  // Tạo item mới
  createMenuItem: async (
    itemData: Omit<MenuItemData, "id" | "createdAt" | "updatedAt">
  ): Promise<MenuItemData> => {
    const response = await AuthClient.fetchWithAuth(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to create menu item" }));
      throw new Error(errorData.message || "Failed to create menu item");
    }
    return response.json();
  },

  // Cập nhật item
  updateMenuItem: async (
    id: number,
    itemData: Partial<Omit<MenuItemData, "id" | "createdAt" | "updatedAt">>
  ): Promise<MenuItemData> => {
    const response = await AuthClient.fetchWithAuth(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to update menu item" }));
      throw new Error(errorData.message || "Failed to update menu item");
    }
    return response.json();
  },

  // Xóa item
  deleteMenuItem: async (id: number): Promise<void> => {
    const response = await AuthClient.fetchWithAuth(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok && response.status !== 204) {
      // 204 No Content là thành công
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to delete menu item" }));
      throw new Error(errorData.message || "Failed to delete menu item");
    }
    // Không cần trả về gì nếu thành công (status 204)
  },

  // Sửa phương thức updateMenuOrder

  updateMenuOrder: async (
    items: { id: number; displayOrder: number }[]
  ): Promise<{ message: string }> => {
    try {
      const response = await AuthClient.fetchWithAuth(`${API_URL}/order`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      // Parse response một lần duy nhất
      const data = await response.json();

      // Kiểm tra status code
      if (!response.ok) {
        throw new Error(data.message || "Failed to update menu order");
      }

      // Trả về dữ liệu thành công
      return data;
    } catch (error) {
      throw error;
    }
  },
};
