// Interface cho đơn hàng hiển thị trong trang account
export interface Order {
  id: string;
  date: string;
  status: "Đã giao" | "Đang vận chuyển" | "Đã hủy" | "Chờ xác nhận";
  total: string;
}

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
  };
}

// Interface đơn hàng đầy đủ từ API
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

// Interface để tạo đơn hàng
export interface OrderCreate {
  items: OrderItem[];
  paymentMethodId: number;
  voucherId?: number | null;
  shippingAddress: string;
  phoneNumber: string;
}

export interface OrderItem {
  productId: number;
  color: string;
  size: string;
  quantity: number;
}
