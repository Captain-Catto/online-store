// src/services/UserService.ts
import { AuthClient } from "./AuthClient";
const API_URL = "http://localhost:3000/api";

export interface Address {
  id: number;
  userId: number;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const UserService = {
  getAddresses: async (): Promise<Address[]> => {
    try {
      console.log("Getting user addresses...");

      const response = await AuthClient.fetchWithAuth(
        `${API_URL}/user-addresses`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch addresses:", response.status, errorText);

        if (response.status === 401 || response.status === 403) {
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }

        throw new Error(
          `Error ${response.status}: ${errorText || response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Addresses fetched successfully:", data);

      return data;
    } catch (error) {
      console.error("Error in getAddresses:", error);
      throw error;
    }
  },

  // Thêm các methods mới để quản lý địa chỉ
  addAddress: async (
    addressData: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<Address> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_URL}/user-addresses`,
        {
          method: "POST",
          body: JSON.stringify(addressData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${errorText || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  },

  setDefaultAddress: async (addressId: number): Promise<Address> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_URL}/user-addresses/${addressId}`,
        {
          method: "PUT",
          body: JSON.stringify({ isDefault: true }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${errorText || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error setting default address:", error);
      throw error;
    }
  },

  deleteAddress: async (addressId: number): Promise<void> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_URL}/user-addresses/${addressId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${errorText || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  },

  // cập nhật địa chỉ
  updateAddress: async (
    id: number,
    addressData: Partial<Address>
  ): Promise<Address> => {
    try {
      console.log(`UserService.updateAddress: Cập nhật địa chỉ ID ${id}...`);

      const response = await AuthClient.fetchWithAuth(
        `${API_URL}/user-addresses/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addressData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("UserService.updateAddress: Cập nhật thành công:", data);
      return data;
    } catch (error) {
      console.error(
        `UserService.updateAddress - Lỗi khi cập nhật địa chỉ ID ${id}:`,
        error
      );
      throw error;
    }
  },
};
