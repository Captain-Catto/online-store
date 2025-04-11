// src/util/orderUtils.ts
import { OrderItem } from "@/services/OrderService";
import { CartItem } from "./cartUtils";

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
    creditCard: 2,
    banking: 3,
    momo: 4,
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
