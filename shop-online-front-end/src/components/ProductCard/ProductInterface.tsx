export interface Category {
  id: number;
  name: string;
}

export interface ProductVariant {
  colors: string[];
  details: {
    [color: string]: {
      images: string[];
      availableSizes: string[];
      stock: number;
    };
  };
}

export interface Product {
  id: number;
  name: string;
  price?: number;
  originalPrice?: number;
  description: string;
  categories: Category[];
  variants: ProductVariant;
  rating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
}
