// src/app/categories/types.ts
export interface Product {
  id: string;
  name: string;
  color: string[];
  sizes: string[];
  suitability?: string[];
  stock: Array<{
    size: string;
    color: string;
    stock: number;
  }>;
  images: Array<{
    src: string;
    color: string;
    size: string;
    isFront: boolean;
    isProductOnly: boolean;
    stock: number;
  }>;
  price?: number;
  originalPrice?: number;
  rating?: {
    value: number;
    count: number;
  };
}

export enum SuitabilityType {
  HOME = "Mặc Ở Nhà",
  DAILY = "Mặc Hàng Ngày",
  SPORT = "Chơi Thể Thao",
}

export enum SuitabilityValue {
  HOME = "home",
  DAILY = "daily",
  SPORT = "sport",
}

export const suitabilities = [
  {
    label: SuitabilityType.HOME,
    value: SuitabilityValue.HOME,
  },
  {
    label: SuitabilityType.DAILY,
    value: SuitabilityValue.DAILY,
  },
  {
    label: SuitabilityType.SPORT,
    value: SuitabilityValue.SPORT,
  },
];
