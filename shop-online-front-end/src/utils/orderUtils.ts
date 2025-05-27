type OrderItem = {
  productId: number;
  color: string;
  size: string;
  quantity: number;
};
import { CartItem } from "@/types/cart";

export const mapCartItemsToOrderItems = (
  cartItems: CartItem[]
): OrderItem[] => {
  return cartItems.map((item) => ({
    productId: parseInt(item.id, 10),
    color: item.color,
    size: item.size,
    quantity: item.quantity,
  }));
};

export const getPaymentMethodId = (method: string): number => {
  const methodMap: Record<string, number> = {
    cod: 1,
    momo: 2,
    zalopay: 3,
  };

  return methodMap[method] || 1;
};

export const formatFullAddress = (
  address: string,
  ward: string,
  district: string,
  city: string
): string => {
  return `${address}, ${ward}, ${district}, ${city}`;
};

// hàm để map thông tin đơn hàng sang tiếng việt
export const mapOrderStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "Chờ xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang vận chuyển",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
    refunded: "Đã hoàn tiền",
  };
  return statusMap[status] || status;
};

// hàm để map thông tin user sang tiếng việt
export const mapUserRole = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: "Quản trị viên",
    employee: "Nhân viên",
    customer: "Khách hàng",
  };
  return roleMap[role] || role;
};

// hàm để map màu khi có user role sử dụng cho badge
export const mapUserRoleColor = (role: string) => {
  const roleColorMap: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    employee: "bg-blue-100 text-blue-800",
    customer: "bg-green-100 text-green-800",
  };
  return roleColorMap[role] || "bg-gray-100 text-gray-800";
};
