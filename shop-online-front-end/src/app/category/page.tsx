import { Metadata } from "next";
import { CategoryService } from "@/services/CategoryService";
import CategoryPageClient from "@/components/Category/CategoryPageClient";

export const metadata: Metadata = {
  title: "Danh mục sản phẩm | Shop Online",
  description: "Khám phá các danh mục sản phẩm đa dạng tại Shop Online",
  openGraph: {
    title: "Danh mục sản phẩm | Shop Online",
    description: "Khám phá các danh mục sản phẩm đa dạng tại Shop Online",
  },
};

export default async function CategoryPage() {
  // Gọi CategoryPageClient mà không cần slug
  // Component sẽ xử lý việc lấy categoryId từ query parameter
  return <CategoryPageClient />;
}
