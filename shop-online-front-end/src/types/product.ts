export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
  productDetailId?: number;
}

export interface VariantDetail {
  id?: number;
  detailId: number;
  price: number;
  originalPrice: number;
  images: ProductImage[];
  availableSizes: string[];
  inventory: Record<string, number>;
  variants: Array<{
    color: string;
    size: string;
    stock: number;
  }>;
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
  priceRange?: { min: number; max: number } | null;
  colors: string[];
  sizes: string[];
  categories: Array<{ id: number; name: string; slug: string }>;
  suitabilities: string[];
  variants: Record<string, VariantDetail>;
  material: string[];
}

export interface ProductSize {
  id: number;
  value: string;
  displayName: string;
  categoryId: number;
  active: boolean;
  displayOrder: number;
}

export interface ProductAdminResponse {
  id: number;
  name: string;
  sku: string;
  description: string;
  categories: Array<{
    id: number;
    name: string;
    slug?: string;
  }>;
  brand: string;
  material: string;
  featured: boolean;
  status: string;
  statusLabel: string;
  statusClass: string;
  tags: string[];
  suitability: string[];
  colors: string[];
  sizes: string[];
  createdAt: string;
  updatedAt: string;
  stock: {
    total: number;
    variants: Array<{
      color: string;
      size: string;
      stock: number;
    }>;
  };
  variants: Record<
    string,
    {
      detailId: number;
      price: number;
      originalPrice: number;
      images: Array<{
        id: number;
        url: string;
        isMain: boolean;
      }>;
      availableSizes: string[];
      inventory: Record<string, number>;
      variants: Array<{
        color: string;
        size: string;
        stock: number;
      }>;
    }
  >;
}

export interface SimpleProduct
  extends Pick<Product, "id" | "name" | "featured" | "colors" | "price"> {
  variants: Record<string, VariantDetail>;
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

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  color?: string;
  size?: string[];
  suitability?: string[];
  childCategory?: string;
}
