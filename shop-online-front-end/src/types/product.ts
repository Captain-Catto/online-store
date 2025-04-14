export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

export interface VariantDetail {
  detailId: number;
  price: number;
  originalPrice: number;
  images: ProductImage[];
  availableSizes: string[];
  inventory: Record<string, number>;
  variants: { id: number; name: string; value: string }[];
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  categories: Array<{ id: number; name: string }>;
  brand: string;
  colors: string[];
  sizes: string[];
  featured: boolean;
  status: string;
  statusLabel: string;
  statusClass: string;
  variants: Record<string, VariantDetail>;
  createdAt: string;
  updatedAt: string;
  suitability: string[];
}

// Interface đơn giản hóa cho ProductCard
export interface SimpleProduct {
  id: number;
  name: string;
  colors: string[];
  variants: Record<string, VariantDetail>;
}

export interface PaginatedResponse {
  products: Product[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// Interface cho các tham số lọc sản phẩm
export interface ProductFilterParams {
  category?: number | string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
}
