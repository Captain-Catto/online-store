import { Metadata } from "next";
import SearchPageClient from "@/components/Search/SearchPageClient";

// Định nghĩa props cho hàm generateMetadata
type Props = {
  searchParams: { q?: string; page?: string; sort?: string };
};

// Hàm tạo metadata động dựa trên từ khóa tìm kiếm
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const query = searchParams.q || "";
  const page = Number(searchParams.page) || 1;

  let title = query ? `Kết quả tìm kiếm cho "${query}"` : "Tìm kiếm sản phẩm";

  if (page > 1) {
    title += ` - Trang ${page}`;
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
          index: false, // Không index trang tìm kiếm trống
        },
  };
}

// Component trang tìm kiếm - Thêm từ khóa async
export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || "";

  return <SearchPageClient initialQuery={query} />;
}
