// src/services/OrderService.ts
import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "./AuthClient";
import { OrderCreate, OrderResponse, Order } from "@/types";

export const OrderService = {
  getMyOrders: async (): Promise<Order[]> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/orders/my-orders`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${errorText || response.statusText}`
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

      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  getOrderById: async (orderId: number): Promise<Order> => {
    try {
      console.log(`Getting order details for order ID ${orderId}...`);

      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/orders/${orderId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${errorText || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },

  placeOrder: async (orderData: OrderCreate): Promise<OrderResponse> => {
    try {
      console.log("Placing order with data:", orderData);

      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/orders`,
        {
          method: "POST",
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `Error ${response.status}: ${response.statusText || errorText}`
        );
      }

      const data = await response.json();
      console.log("Order placed successfully:", data);
      return data;
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  },

  // Có thể thêm các phương thức khác như cancelOrder, trackOrder nếu cần
};
