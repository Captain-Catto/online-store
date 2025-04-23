import { StaticImageData } from "next/image";

export interface CategoryItem {
  id: string;
  label: string;
  href: string;
  image: StaticImageData;
}

export interface CategoryGroup {
  id: string;
  categories: CategoryItem[];
}

// Thêm định nghĩa cho interface Subtype (nếu chưa có)
export interface Subtype {
  id: number;
  name: string;
  displayName: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithSubtypes {
  id: number;
  name: string;
  subtypes: Subtype[];
}

// Giữ lại các interface khác nếu đã có
export interface Category {
  id: number | string;
  name: string;
}

interface FilterResponse {
  availableColors?: string[];
  availableSizes?: string[];
  priceRange?: { min: number; max: number };
  brands?: string[];
}
