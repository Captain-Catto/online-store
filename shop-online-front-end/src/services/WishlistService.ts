import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "./AuthClient";
import {
  WishlistItem,
  WishlistResponse,
  WishlistCheckResponse,
} from "@/types/wishlist";

export class WishlistService {
  // Lấy danh sách yêu thích của người dùng
  static async getWishlist(): Promise<WishlistItem[]> {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/wishlist`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách yêu thích");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      return [];
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
      console.error("Error adding to wishlist:", error);
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
      console.error("Error removing from wishlist:", error);
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
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      return false;
    }
  }
}
