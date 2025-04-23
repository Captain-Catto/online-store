export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    sku: string;
    status: string;
    details: Array<{
      id: number;
      color: string;
      price: number;
      originalPrice: number;
    }>;
    images: Array<{
      id: number;
      url: string;
      isMain: boolean;
      color: string;
    }>;
  };
}

export interface WishlistResponse {
  message: string;
  data?: any;
}

export interface WishlistCheckResponse {
  inWishlist: boolean;
}
