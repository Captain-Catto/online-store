// src/services/OrderService.ts
import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "./AuthClient";
import {
  OrderCreate,
  OrderFullResponse,
  Order,
  PaginatedOrders,
} from "@/types/order";
import { formatCurrency } from "@/utils/currencyUtils";

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

      const responseJson = await response.json();

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${errorText || response.statusText}`
        );
      }

      return await responseJson;
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
        } catch {
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

  getAdminOrders: async (
    page = 1,
    limit = 10,
    status = "all",
    search = "",
    fromDate = "",
    toDate = ""
  ): Promise<PaginatedOrders> => {
    try {
      // Tạo query parameters
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (status !== "all") {
        params.append("status", status);
      }

      if (search) {
        params.append("search", search);
      }

      if (fromDate) {
        params.append("fromDate", fromDate);
      }

      if (toDate) {
        params.append("toDate", toDate);
      }

      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/orders/admin/all?${params.toString()}`
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

  // Thêm phương thức để in hóa đơn
  printOrderInvoice: async (orderId: string | number): Promise<void> => {
    try {
      const order = await OrderService.getOrderById(Number(orderId));

      // Tạo cửa sổ in mới
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error(
          "Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt trình duyệt của bạn."
        );
      }

      // Tạo nội dung HTML cho trang in
      let orderDetailsHtml = "";
      let totalItems = 0;

      order.orderDetails?.forEach((item) => {
        totalItems += item.quantity;
        orderDetailsHtml += `
          <tr>
            <td>${item.product?.name || "Sản phẩm không xác định"}</td>
            <td>${item.color} - ${item.size}</td>
            <td style="text-align:right;">${item.quantity}</td>
            <td style="text-align:right;">${formatCurrency(
              item.discountPrice || 0
            )}</td>
            <td style="text-align:right;">${formatCurrency(
              (item.discountPrice || 0) * item.quantity
            )}</td>
          </tr>
        `;
      });

      const formattedDate = new Date(order.createdAt).toLocaleDateString(
        "vi-VN"
      );

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Hóa đơn #${order.id}</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            .invoice-header h1 { margin: 0; font-size: 24px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .invoice-details div { width: 48%; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>HÓA ĐƠN BÁN HÀNG</h1>
            <p>Mã đơn hàng: #${order.id}</p>
            <p>Ngày tạo: ${formattedDate}</p>
          </div>
          
          <div class="invoice-details">
            <div>
              <h3>Thông tin khách hàng</h3>
              <p><strong>ID khách hàng:</strong> ${order.userId}</p>
              <p><strong>Điện thoại:</strong> ${order.phoneNumber || "N/A"}</p>
              <p><strong>Địa chỉ giao hàng:</strong> ${
                order.shippingAddress || "N/A"
              }</p>
            </div>
            <div>
              <h3>Thông tin thanh toán</h3>
              <p><strong>Phương thức:</strong> ${
                order.paymentMethodId === 1
                  ? "COD (Thanh toán khi nhận hàng)"
                  : "Chuyển khoản"
              }</p>
              <p><strong>Trạng thái:</strong> ${
                order.paymentStatusId === 2
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"
              }</p>
              <p><strong>Trạng thái đơn hàng:</strong> ${order.status}</p>
            </div>
          </div>
          
          <h3>Chi tiết đơn hàng</h3>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Biến thể</th>
                <th style="text-align:right;">SL</th>
                <th style="text-align:right;">Đơn giá</th>
                <th style="text-align:right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetailsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2"><strong>Tổng cộng:</strong></td>
                <td style="text-align:right;"><strong>${totalItems}</strong></td>
                <td></td>
                <td style="text-align:right;"><strong>${formatCurrency(
                  order.subtotal || 0
                )}</strong></td>
              </tr>
              <tr>
                <td colspan="4"><strong>Phí vận chuyển:</strong></td>
                <td style="text-align:right;">${formatCurrency(
                  order.shippingFee || 0
                )}</td>
              </tr>
              ${
                order.voucherDiscount > 0
                  ? `
              <tr>
                <td colspan="4"><strong>Giảm giá voucher:</strong></td>
                <td style="text-align:right;">- ${formatCurrency(
                  order.voucherDiscount || 0
                )}</td>
              </tr>`
                  : ""
              }
              <tr class="total-row">
                <td colspan="4"><strong>Tổng thanh toán:</strong></td>
                <td style="text-align:right;"><strong>${formatCurrency(
                  order.total || 0
                )}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div class="footer">
            <p>Cảm ơn quý khách đã mua hàng!</p>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer;">
              In hóa đơn
            </button>
          </div>
        </body>
        </html>
      `);

      // Tự động mở hộp thoại in
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    } catch (error) {
      console.error("Error printing invoice:", error);
      throw error;
    }
  },

  // Thêm phương thức cập nhật trạng thái đơn hàng
  updateOrderStatus: async (
    orderId: number | string,
    status: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw error;
    }
  },
};
