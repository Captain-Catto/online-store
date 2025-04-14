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
