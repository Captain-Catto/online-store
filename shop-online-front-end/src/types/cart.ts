export interface CartItem {
  id: string;
  productId: number | string;
  productDetailId: number | string;
  cartItemId?: number;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  color: string;
  size: string;
  image?: string;
}
