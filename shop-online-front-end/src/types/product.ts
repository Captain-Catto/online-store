export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
  productDetailId?: number;
}

export interface PriceRange {
  min: number;
  max: number;
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
  brand: string;
  featured: boolean;
  status: string;
  mainImage: string;
  subImage: ProductImage[];
  price: number | null;
  priceRange?: PriceRange | null;
  hasDiscount: boolean;
  colors: string[];
  sizes: string[];
  categories: Array<{ id: number; name: string; slug: string }>;
  suitabilities: string[];
  details?: Record<string, VariantDetail>;
}

// Interface đơn giản hóa cho ProductCard
export interface SimpleProduct extends Product {
  colorToImage?: Record<string, string>;
  variants?: Record<
    string,
    {
      price: number;
      originalPrice: number;
      sizes: string[];
      inventories?: Array<{
        size: string;
        stock: number;
      }>;
    }
  >;
}

export interface PaginatedResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Interface cho các tham số lọc sản phẩm
export interface ProductFilterParams {
  page?: number;
  limit?: number;
  color?: string;
  size?: string[];
  suitability?: string[];
  childCategory?: string;
}
