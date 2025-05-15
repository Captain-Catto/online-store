import { API_BASE_URL } from "@/config/apiConfig";
import { CartItem } from "@/types/cart";
import {
  getCartFromCookie,
  clearCart as clearLocalCart,
} from "@/utils/cartUtils";
import { AuthClient } from "./AuthClient";

interface CartResponse {
  cartId: number;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

interface CartItemResponse {
  message: string;
  item: CartItem;
}

export const CartService = {
  // Lấy giỏ hàng của user từ database
  getCart: async (): Promise<CartResponse> => {
    const response = await AuthClient.fetchWithAuth(`${API_BASE_URL}/cart`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error("Không thể lấy giỏ hàng");
    }
    return data;
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (
    productId: number,
    productDetailId: number,
    color: string,
    size: string,
    quantity: number
  ): Promise<CartItemResponse> => {
    const response = await AuthClient.fetchWithAuth(
      `${API_BASE_URL}/cart/items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          productDetailId,
          color,
          size,
          quantity,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Không thể thêm vào giỏ hàng");
    }

    return response.json();
  },

  // Cập nhật số lượng sản phẩm
  updateCartItem: async (
    itemId: number,
    quantity: number
  ): Promise<CartItemResponse> => {
    const response = await AuthClient.fetchWithAuth(
      `${API_BASE_URL}/cart/items/${itemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      }
    );

    if (!response.ok) {
      throw new Error("Không thể cập nhật giỏ hàng");
    }

    return response.json();
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeCartItem: async (itemId: number): Promise<{ message: string }> => {
    const response = await AuthClient.fetchWithAuth(
      `${API_BASE_URL}/cart/items/${itemId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Không thể xóa sản phẩm khỏi giỏ hàng");
    }

    return response.json();
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async (): Promise<{ message: string }> => {
    const response = await AuthClient.fetchWithAuth(`${API_BASE_URL}/cart`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Không thể xóa giỏ hàng");
    }

    return response.json();
  },

  // Merge giỏ hàng từ cookie vào database sau khi đăng nhập
  mergeCartFromCookies: async (): Promise<{ message: string }> => {
    const cartItems = getCartFromCookie();

    if (cartItems.length === 0) {
      return { message: "No items to merge" };
    }

    const response = await AuthClient.fetchWithAuth(
      `${API_BASE_URL}/cart/merge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems }),
      }
    );

    if (!response.ok) {
      throw new Error("Không thể merge giỏ hàng");
    }

    // Clear local cart after successful merge
    clearLocalCart();

    return response.json();
  },

  checkCartItemsStock: async (
    items: CartItem[]
  ): Promise<{
    valid: boolean;
    invalidItems: {
      id: string;
      name: string;
      available: number;
      requested: number;
    }[];
  }> => {
    try {
      console.log("Items being sent for stock check:", items);

      const response = await fetch(`${API_BASE_URL}/cart/check-stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productDetailId: item.productDetailId,
            size: item.size,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể kiểm tra tồn kho");
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking stock:", error);
      // Fallback kiểm tra cục bộ nếu API gặp lỗi
      return {
        valid: true, // Cho phép tiếp tục để không làm gián đoạn UX
        invalidItems: [],
      };
    }
  },
};
