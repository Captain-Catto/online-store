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
      throw error;
    }
  },
  getOrderById: async (orderId: number): Promise<Order> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();
      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid response format: ${responseText}`);
      }
      // Kiểm tra status code
      if (!response.ok) {
        throw new Error(
          responseJson.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }
      // Trả về dữ liệu đã parse
      return await responseJson;
    } catch (error) {
      throw error;
    }
  },
  placeOrder: async (orderData: OrderCreate): Promise<OrderFullResponse> => {
    try {
      // Get authentication token
      const token = sessionStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(orderData),
      });

      // Log đầy đủ response để debug
      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid response format: ${responseText}`);
      }

      // Kiểm tra status code
      if (!response.ok) {
        throw new Error(
          responseData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      // Trả về dữ liệu đã parse
      return responseData;
    } catch (error) {
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
      throw error;
    }
  },

  getEmployeeOrders: async (
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
        `${API_BASE_URL}/orders/employee/all?${params.toString()}`
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
              <p><strong>Điện thoại:</strong> ${
                order.shippingPhoneNumber || "N/A"
              }</p>
              <p><strong>Địa chỉ giao hàng:</strong> ${
                (order.shippingStreetAddress,
                order.shippingWard,
                order.shippingDistrict,
                order.shippingCity || "N/A")
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
      throw error;
    }
  },

  // Thêm phương thức cập nhật trạng thái đơn hàng
  updateOrderStatus: async (
    orderId: number | string,
    status: string
  ): Promise<{ order: Order; message: string }> => {
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
      throw error;
    }
  },

  // thêm phương thức gọi api lấy shipping fee
  getShippingFee: async (requestData: {
    shippingAddress: string;
    subtotal: number;
  }): Promise<{
    shipping: {
      baseFee: number;
      discount: number;
      finalFee: number;
    };
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/shipping-fee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // hàm lấy voucher theo voucherCode
  getVoucherByCode: async (code: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/${code}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Không thể lấy thông tin mã giảm giá");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Thêm phương thức validateVoucher để kiểm tra giá trị đơn hàng:
  validateVoucher: async (code: string, orderTotal: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, orderTotal }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Không thể áp dụng mã giảm giá");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Thêm phương thức để hủy đơn hàng
  cancelOrder: async (orderId: string | number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancelNote: "Khách hàng hủy đơn trước khi hoàn tất thanh toán",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật trạng thái thanh toán cho đơn hàng
  updatePaymentStatus: async (
    orderId: string | number,
    paymentStatusId: number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/orders/${orderId}/payment-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentStatusId }),
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
      throw error;
    }
  },
};
