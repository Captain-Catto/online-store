// Define types for product data
export interface ProductInventory {
  id: number;
  productDetailId: number;
  size: string;
  stock: number;
}

export interface ProductImage {
  id: number | string;
  productDetailId: number;
  url: string;
  isMain: boolean;
}

export interface ProductDetailType {
  id: number;
  productId: number;
  color: string;
  price: number;
  originalPrice: number;
  inventories: ProductInventory[];
  images: ProductImage[];
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  image?: string | null;
  parentId?: number | null;
  isActive?: boolean;
}

export interface Suitability {
  id: number;
  name: string;
}

// Complete formatted product data type
export interface FormattedProduct {
  id: number;
  name: string;
  sku: string;
  description: string;
  brand: string;
  material: string;
  featured: boolean;
  status: string;
  tags: string[];
  categories: Category[];
  suitabilities: Suitability[];
  subtype?: Category | null;
  details: ProductDetailType[];
  createdAt?: string;
  updatedAt?: string;
}
