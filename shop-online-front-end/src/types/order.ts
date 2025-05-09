// Interface cho đơn hàng hiển thị trong trang account (client-side format)
export interface OrderDisplay {
  id: string;
  date: string;
  status: "Đã giao" | "Đang vận chuyển" | "Đã hủy" | "Chờ xác nhận";
  total: string;
}

// Interface cho đơn hàng từ API (server-side format)
export interface Order {
  id: number;
  userId: number;
  total: number;
  subtotal: number;
  voucherDiscount: number;
  status: string; // Sử dụng string thay vì enum để phù hợp với API
  paymentMethodId: number;
  paymentStatusId: number;
  shippingAddress: string;
  shippingPhoneNumber: string;
  shippingStreetAddress: string;
  shippingWard: string;
  shippingDistrict: string;
  shippingCity: string;
  shippingFullName: string;
  cancelNote: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  shippingFee?: number;
  shippingBasePrice?: number;
  shippingDiscount?: number;
  createdAt: string;
  updatedAt: string;
  orderDetails?: OrderDetail[];
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

// Interface cho kết quả phân trang
export interface PaginatedResponse<T> {
  orders: T[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    perPage: number;
  };
}

// Interface cho kết quả đơn hàng có phân trang
export type PaginatedOrders = PaginatedResponse<Order>;

// Interface chi tiết đơn hàng từ API
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
    sku?: string;
  };
}

export interface OrderFullResponse {
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
  shippingFee: number;
  shippingBasePrice: number;
  shippingDiscount: number;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderDetail[];
  user?: {
    id: number;
    name: string;
    email: string;
  };
  orderId?: number;
}

// Interface để tạo đơn hàng
export interface OrderCreate {
  items: OrderItem[];
  paymentMethodId: number;
  voucherId?: number | null;
  shippingAddress: string;
  shippingFullName: string;
  shippingPhoneNumber: string;
  shippingStreetAddress: string;
  shippingWard: string;
  shippingDistrict: string;
  shippingCity: string;
}

export interface OrderItem {
  productId: number;
  color: string;
  size: string;
  quantity: number;
}

// Enum cho trạng thái đơn hàng
export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPING = "shipping",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

// Interface cho việc cập nhật trạng thái đơn hàng
export interface OrderStatusUpdate {
  status: OrderStatus;
  note?: string;
}
