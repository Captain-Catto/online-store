// Định nghĩa các interfaces con
export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

export interface ProductInventory {
  id: number;
  size: string;
  stock: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductDetail {
  id: number;
  color: string;
  price: number;
  originalPrice: number;
  images: ProductImage[];
  inventories: ProductInventory[];
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  brand: string;
  material: string;
  featured: boolean;
  status: string;
  details: ProductDetail[];
  categories: ProductCategory[];
}

export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface WishlistPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface WishlistResponse {
  items: WishlistItem[];
  pagination: WishlistPagination;
}

export interface WishlistCheckResponse {
  inWishlist: boolean;
  itemId?: number;
}
