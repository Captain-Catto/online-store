// src/services/OrderService.ts
import { AuthClient } from "./AuthClient";
const API_URL = "http://localhost:3000/api";

// Interfaces for Order API
export interface OrderItem {
  productId: number;
  color: string;
  size: string;
  quantity: number;
}

export interface OrderCreate {
  items: OrderItem[];
  paymentMethodId: number;
  voucherId?: number | null;
  shippingAddress: string;
  phoneNumber: string;
}

export interface OrderResponse {
  id: number;
  userId: number;
  total: number;
  subtotal: number;
  voucherDiscount: number;
  status: string;
  paymentMethodId: number;
  paymentStatusId: number;
  shippingAddress: string;
  phoneNumber: string;
  cancelNote: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderDetail[];
}

export interface Order {
  id: number;
  userId: number;
  total: number;
  subtotal: number;
  voucherDiscount: number;
  status: string;
  paymentMethodId: number;
  paymentStatusId: number;
  shippingAddress: string;
  phoneNumber: string;
  cancelNote: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderDetail[];
}

export interface OrderDetail {
  id: number;
  orderId: number;
  productId: number;
  productDetailId: number;
  quantity: number;
  color: string;
  size: string;
  originalPrice: number;
  discountPrice: number;
  discountPercent: number;
  voucherId: number | null;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
  };
}
export const OrderService = {
  getMyOrders: async (): Promise<Order[]> => {
    try {
      console.log("Getting user orders...");

      const response = await AuthClient.fetchWithAuth(
        `${API_URL}/orders/my-orders`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${errorText || response.statusText}`
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
        `${API_URL}/orders/${orderId}`
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

      const response = await AuthClient.fetchWithAuth(`${API_URL}/orders`, {
        method: "POST",
        body: JSON.stringify(orderData),
      });

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
