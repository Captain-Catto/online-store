import { Metadata } from "next";
import SearchPageClient from "@/components/Search/SearchPageClient";

// Define Props type for async searchParams
type Props = {
  params?: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
};

// Generate metadata
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { q, page } = await searchParams; // Await searchParams to get query params
  const query = q || "";
  const pageNum = Number(page) || 1;

  let title = query ? `Kết quả tìm kiếm cho "${query}"` : "Tìm kiếm sản phẩm";

  if (pageNum > 1) {
    title += ` - Trang ${pageNum}`;
  }

  return {
    title: `${title}`,
    description: query
      ? `Khám phá các sản phẩm liên quan đến "${query}" tại Shop Online. Tìm kiếm dễ dàng, mua sắm thông minh.`
      : "Tìm kiếm sản phẩm yêu thích của bạn tại Shop Online.",
    openGraph: {
      title: title,
      description: query
        ? `Khám phá các sản phẩm liên quan đến "${query}" tại Shop Online.`
        : "Tìm kiếm sản phẩm yêu thích của bạn tại Shop Online.",
    },
    robots: query
      ? {}
      : {
          index: false, // Don't index empty search page
        },
  };
}

// Async page component
export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams; // Await searchParams to get query
  const query = q || "";

  return <SearchPageClient initialQuery={query} />;
}
