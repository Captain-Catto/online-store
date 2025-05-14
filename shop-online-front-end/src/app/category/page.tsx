import { Metadata } from "next";
import { Suspense } from "react"; // Import Suspense from react
import CategoryPageClient from "@/components/Category/CategoryPageClient";
import LoadingSpinner from "@/components/UI/LoadingSpinner"; // Import your loading component

export const metadata: Metadata = {
  title: "Danh mục sản phẩm | Shop Online",
  description: "Khám phá các danh mục sản phẩm đa dạng tại Shop Online",
  openGraph: {
    title: "Danh mục sản phẩm | Shop Online",
    description: "Khám phá các danh mục sản phẩm đa dạng tại Shop Online",
  },
};

export default async function CategoryPage() {
  return (
    <Suspense
      fallback={<LoadingSpinner size="lg" text="Đang tải danh mục..." />}
    >
      <CategoryPageClient slug="" />
    </Suspense>
  );
}
