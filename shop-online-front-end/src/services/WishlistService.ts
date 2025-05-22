import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "./AuthClient";
import { WishlistResponse, WishlistCheckResponse } from "@/types/wishlist";

export class WishlistService {
  // Lấy danh sách yêu thích của người dùng có phân trang
  static async getWishlist(
    page: number = 1,
    limit: number = 10
  ): Promise<WishlistResponse> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/wishlist?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách yêu thích");
      }

      return await response.json();
    } catch {
      // Nếu có lỗi trong quá trình lấy danh sách yêu thích,
      // trả về một đối tượng mặc định
      return {
        items: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  }

  // Thêm sản phẩm vào danh sách yêu thích
  static async addToWishlist(productId: number): Promise<WishlistResponse> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/wishlist`,
        {
          method: "POST",
          body: JSON.stringify({ productId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Không thể thêm vào danh sách yêu thích"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Xóa sản phẩm khỏi danh sách yêu thích
  static async removeFromWishlist(
    productId: number
  ): Promise<WishlistResponse> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/wishlist/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa khỏi danh sách yêu thích");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra xem sản phẩm có trong danh sách yêu thích không
  static async checkInWishlist(productId: number): Promise<boolean> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/wishlist/check/${productId}`
      );

      if (!response.ok) {
        return false;
      }

      const data: WishlistCheckResponse = await response.json();
      return data.inWishlist;
    } catch {
      // nếu có lỗi trong quá trình kiểm tra, trả về false
      return false;
    }
  }
}
