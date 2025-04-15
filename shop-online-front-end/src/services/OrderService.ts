// src/services/OrderService.ts
import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "./AuthClient";
import {
  OrderCreate,
  OrderFullResponse,
  Order,
  PaginatedOrders,
} from "@/types/order";

export const OrderService = {
  // OrderService.ts
  // Trong src/services/OrderService.ts
  getMyOrders: async (page = 1, limit = 10): Promise<PaginatedOrders> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/orders/my-orders?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Không thể lấy danh sách đơn hàng"
        );
      }

      return await response.json();
    } catch (error) {
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

  placeOrder: async (orderData: OrderCreate): Promise<OrderFullResponse> => {
    try {
      console.log("Sending order data:", JSON.stringify(orderData)); // Log dữ liệu gửi đi

      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/orders`,
        {
          method: "POST",
          body: JSON.stringify(orderData),
        }
      );

      // Log đầy đủ response để debug
      console.log(`Order API response status: ${response.status}`);
      const responseText = await response.text();
      console.log(`Response body: ${responseText}`);

      if (!response.ok) {
        let errorMessage = `Error ${response.status}`;
        try {
          // Thử parse JSON
          const errorData = JSON.parse(responseText);
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Nếu không phải JSON, dùng text gốc
          errorMessage = responseText || response.statusText;
        }

        throw new Error(errorMessage);
      }

      // Parse lại JSON từ text đã đọc
      const data = JSON.parse(responseText);
      return data;
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  },

  // Có thể thêm các phương thức khác như cancelOrder, trackOrder nếu cần
  getAdminOrders: async (): Promise<PaginatedOrders> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/orders/admin/all`
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Error ${response.status}: ${response.statusText}`
          );
        } else {
          const errorText = await response.text();
          throw new Error(
            `Error ${response.status}: ${errorText || response.statusText}`
          );
        }
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      throw error;
    }
  },
};
