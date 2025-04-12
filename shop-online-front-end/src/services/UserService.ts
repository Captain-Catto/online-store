import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "./AuthClient";
import {
  UserProfile,
  UserProfileUpdate,
  Address,
  AddressCreate,
  AddressUpdate,
} from "@/types";

class UserService {
  /**
   * Lấy thông tin người dùng hiện tại
   * @returns UserProfile
   */
  static async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/users/me`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Không thể lấy thông tin người dùng"
        );
      }

      return await response.json();
    } catch (error) {
      // Handle specific auth errors
      if (
        error instanceof Error &&
        (error.message === "NO_AUTH_TOKEN" ||
          error.message === "TOKEN_REFRESH_FAILED")
      ) {
        // Handle auth errors (redirect to login happens in the component)
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }

      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * @param userData Dữ liệu người dùng cần cập nhật
   * @returns UserProfile đã cập nhật
   */
  static async updateProfile(
    userData: UserProfileUpdate
  ): Promise<UserProfile> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/users/me`,
        {
          method: "PUT",
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Không thể cập nhật thông tin người dùng"
        );
      }

      return await response.json();
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "NO_AUTH_TOKEN" ||
          error.message === "TOKEN_REFRESH_FAILED")
      ) {
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }

      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  /**
   * Đổi mật khẩu
   * @param currentPassword Mật khẩu hiện tại
   * @param newPassword Mật khẩu mới
   * @returns Thông báo thành công
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/users/change-password`,
        {
          method: "PUT",
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể đổi mật khẩu");
      }

      return await response.json();
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "NO_AUTH_TOKEN" ||
          error.message === "TOKEN_REFRESH_FAILED")
      ) {
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }

      console.error("Error changing password:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách địa chỉ của người dùng
   * @returns Danh sách địa chỉ
   */
  static async getAddresses(): Promise<Address[]> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/user-addresses`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể lấy danh sách địa chỉ");
      }

      return await response.json();
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "NO_AUTH_TOKEN" ||
          error.message === "TOKEN_REFRESH_FAILED")
      ) {
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }

      console.error("Error fetching addresses:", error);
      throw error;
    }
  }

  /**
   * Thêm địa chỉ mới
   * @param address Thông tin địa chỉ mới
   * @returns Địa chỉ đã thêm
   */
  static async addAddress(address: AddressCreate): Promise<Address> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/user-addresses`,
        {
          method: "POST",
          body: JSON.stringify(address),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể thêm địa chỉ");
      }

      return await response.json();
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "NO_AUTH_TOKEN" ||
          error.message === "TOKEN_REFRESH_FAILED")
      ) {
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }

      console.error("Error adding address:", error);
      throw error;
    }
  }

  /**
   * Cập nhật địa chỉ
   * @param address Thông tin địa chỉ cần cập nhật
   * @returns Địa chỉ đã cập nhật
   */
  static async updateAddress(address: AddressUpdate): Promise<Address> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/users/addresses/${address.id}`,
        {
          method: "PUT",
          body: JSON.stringify(address),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể cập nhật địa chỉ");
      }

      return await response.json();
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "NO_AUTH_TOKEN" ||
          error.message === "TOKEN_REFRESH_FAILED")
      ) {
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }

      console.error("Error updating address:", error);
      throw error;
    }
  }

  /**
   * Xóa địa chỉ
   * @param id ID của địa chỉ cần xóa
   * @returns Thông báo thành công
   */
  static async deleteAddress(id: number): Promise<{ message: string }> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/user-addresses/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể xóa địa chỉ");
      }

      return await response.json();
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "NO_AUTH_TOKEN" ||
          error.message === "TOKEN_REFRESH_FAILED")
      ) {
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }

      console.error("Error deleting address:", error);
      throw error;
    }
  }

  /**
   * Đặt địa chỉ làm mặc định
   * @param id ID của địa chỉ cần đặt làm mặc định
   * @returns Địa chỉ đã được cập nhật
   */
  static async setDefaultAddress(id: number): Promise<Address> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/user-addresses/${id}/default`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể đặt địa chỉ mặc định");
      }

      return await response.json();
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "NO_AUTH_TOKEN" ||
          error.message === "TOKEN_REFRESH_FAILED")
      ) {
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }

      console.error("Error setting default address:", error);
      throw error;
    }
  }
}

export { UserService };
