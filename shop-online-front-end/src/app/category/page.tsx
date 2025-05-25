import { Metadata } from "next";
import { Suspense } from "react"; // Import Suspense from react
import CategoryPageClient from "@/components/Category/CategoryPageClient";
import LoadingSpinner from "@/components/UI/LoadingSpinner"; // Import your loading component

export const metadata: Metadata = {
  title: "Danh mục sản phẩm | Online Store",
  description: "Khám phá các danh mục sản phẩm đa dạng tại Online Store",
  openGraph: {
    title: "Danh mục sản phẩm | Online Store",
    description: "Khám phá các danh mục sản phẩm đa dạng tại Online Store",
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
