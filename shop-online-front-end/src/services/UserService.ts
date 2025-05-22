import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "./AuthClient";
import {
  UserProfile,
  UserProfileUpdate,
  UserNotes,
  UserNoteDeleteResponse,
  UserNoteResponse,
} from "@/types/user";
import { Address, AddressCreate, AddressUpdate } from "@/types/address";

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

      throw error;
    }
  }

  /**
   * Lấy danh sách ghi chú của người dùng
   * @param userId ID của người dùng
   * @returns Danh sách ghi chú
   */
  static async getUserNotes(userId: number): Promise<UserNotes> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/user-notes/users/${userId}/notes`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Không thể lấy danh sách ghi chú người dùng"
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

      throw error;
    }
  }

  /**
   * Thêm ghi chú cho người dùng
   * @param userId ID của người dùng
   * @param content Nội dung ghi chú
   * @returns Ghi chú đã thêm
   */
  static async addUserNote(
    userId: number,
    content: string
  ): Promise<UserNoteResponse> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/user-notes/users/${userId}/notes`,
        {
          method: "POST",
          body: JSON.stringify({ note: content }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Không thể thêm ghi chú cho người dùng"
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

      throw error;
    }
  }

  /**
   * Cập nhật ghi chú
   * @param noteId ID của ghi chú cần cập nhật
   * @param content Nội dung ghi chú mới
   * @returns Ghi chú đã cập nhật
   */
  static async updateUserNote(
    noteId: number,
    content: string
  ): Promise<UserNoteResponse> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/user-notes/notes/${noteId}`,
        {
          method: "PUT",
          body: JSON.stringify({ note: content }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể cập nhật ghi chú");
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

      throw error;
    }
  }

  /**
   * Xóa ghi chú
   * @param noteId ID của ghi chú cần xóa
   * @returns Thông báo thành công
   */
  static async deleteUserNote(noteId: number): Promise<UserNoteDeleteResponse> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/user-notes/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể xóa ghi chú");
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

      throw error;
    }
  }

  // update thông tin người dùng theo id (admin only)
  static async updateUserByAdmin(
    id: number,
    userData: UserProfileUpdate
  ): Promise<UserProfile> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/users/${id}`,
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

      throw error;
    }
  }

  // Admin: Lấy danh sách địa chỉ của người dùng
  static async getUserAddressesByAdmin(userId: number): Promise<Address[]> {
    const response = await AuthClient.fetchWithAuth(
      `${API_BASE_URL}/addresses/admin/users/${userId}/addresses`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Không thể lấy danh sách địa chỉ");
    }

    return response.json();
  }

  // Admin: Cập nhật địa chỉ
  static async updateAddressByAdmin(address: AddressUpdate): Promise<Address> {
    const response = await AuthClient.fetchWithAuth(
      `${API_BASE_URL}/user-addresses/admin/addresses/${address.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(address),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Không thể cập nhật địa chỉ");
    }

    return response.json().then((data) => data.address);
  }

  // Admin: Tạo địa chỉ mới cho người dùng
  static async createAddressByAdmin(
    userId: number,
    addressData: AddressCreate
  ): Promise<Address> {
    const response = await AuthClient.fetchWithAuth(
      `${API_BASE_URL}/user-addresses/admin/users/${userId}/addresses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Không thể tạo địa chỉ");
    }

    return response.json().then((data) => data.address);
  }

  // Admin: Xóa địa chỉ
  static async deleteAddressByAdmin(id: number): Promise<{ message: string }> {
    const response = await AuthClient.fetchWithAuth(
      `${API_BASE_URL}/user-addresses/admin/addresses/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Không thể xóa địa chỉ");
    }

    return response.json();
  }

  // Admin: Đặt địa chỉ mặc định
  static async setDefaultAddressByAdmin(id: number): Promise<Address> {
    const response = await AuthClient.fetchWithAuth(
      `${API_BASE_URL}/user-addresses/admin/addresses/${id}/default`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Không thể đặt địa chỉ mặc định");
    }

    return response.json().then((data) => data.address);
  }

  // Admin: Lấy tổng số người dùng
  static async getTotalUsers(): Promise<number> {
    try {
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", "1");

      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/users?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.status}`);
      }

      const data = await response.json();
      return data.pagination.total || 0;
    } catch {
      // nếu có lỗi xảy ra, trả về 0
      return 0;
    }
  }
}

export { UserService };
