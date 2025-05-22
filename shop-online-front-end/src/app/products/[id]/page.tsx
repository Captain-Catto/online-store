import { Metadata } from "next";
import { ProductService } from "@/services/ProductService";
import { createProductMetadata } from "@/utils/metadata";
import ProductDetailPageClient from "@/components/ProductDetail/ProductDetailPageClient";
import { notFound } from "next/navigation";

// Define Props type for async params
interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params; // Await params to get id
    const product = await ProductService.getProductById(id);

    if (!product) {
      return {
        title: "Sản phẩm không tìm thấy",
        description: "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa",
      };
    }

    return createProductMetadata(product);
  } catch {
    return {
      title: "Lỗi tải sản phẩm",
      description:
        "Đã xảy ra lỗi khi tải thông tin sản phẩm. Vui lòng thử lại sau.",
    };
  }
}

// Optimize with streaming and caching
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate after 1 hour

// Async page component
export default async function ProductDetailPage({ params }: Props) {
  try {
    const { id } = await params; // Await params to get id

    // Fetch product data from server
    const product = await ProductService.getProductById(id);

    if (!product) {
      notFound(); // Use Next.js 404 page
    }

    // Pass initial product data to Client Component
    return <ProductDetailPageClient productId={id} initialProduct={product} />;
  } catch {
    // Pass productId and let client component handle error/loading
    const { id } = await params;
    return <ProductDetailPageClient productId={id} />;
  }
}
