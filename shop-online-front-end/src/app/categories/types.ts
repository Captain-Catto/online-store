// src/types/product.ts
interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

interface VariantDetail {
  detailId: number;
  price: number;
  originalPrice: number;
  images: ProductImage[];
  availableSizes: string[];
  inventory: Record<string, number>;
  variants: ProductVariant[];
}

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  categories: Array<{
    id: number;
    name: string;
  }>;
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
  stock: {
    total: number;
    variants: ProductVariant[];
  };
  variants: Record<string, VariantDetail>;
  createdAt: string;
  updatedAt: string;
}
