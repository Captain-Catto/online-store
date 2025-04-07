export interface Category {
  id: number;
  name: string;
}

export interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

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
  inventory: { [key: string]: number };
  variants: ProductVariant[];
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  categories: Category[];
  brand: string;
  material: string;
  featured: boolean;
  status: string;
  statusLabel: string;
  statusClass: string;
  tags: string;
  suitability: string;
  colors: string[];
  sizes: string[];
  createdAt: string;
  updatedAt: string;
  stock: {
    total: number;
    variants: ProductVariant[];
  };
  variants: {
    [color: string]: {
      price: number;
      originalPrice: number;
      availableSizes: string[];
      // Các thuộc tính khác
    };
  };
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
