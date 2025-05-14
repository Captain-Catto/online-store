import { Metadata } from "next";
import CategoryPageClient from "@/components/Category/CategoryPageClient";
import { CategoryService } from "@/services/CategoryService";

// Define Props type for async params
interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // Await params to get slug

  try {
    const category = await CategoryService.getCategoryBySlug(slug);

    if (!category) {
      return {
        title: "Danh mục không tồn tại",
        description: "Danh mục bạn đang tìm kiếm không tồn tại hoặc đã bị xóa",
      };
    }

    return {
      title: `${category.name} | Shop Online`,
      description:
        category.description ||
        `Khám phá bộ sưu tập ${category.name} tại Shop Online. Đa dạng sản phẩm, giá tốt nhất.`,
      openGraph: {
        title: category.name,
        description:
          category.description ||
          `Khám phá bộ sưu tập ${category.name} tại Shop Online`,
      },
    };
  } catch {
    return {
      title: "Danh mục sản phẩm | Shop Online",
      description: "Khám phá các danh mục sản phẩm đa dạng tại Shop Online",
    };
  }
}

// Async page component
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params; // Await params to get slug
  return <CategoryPageClient slug={slug} />;
}
