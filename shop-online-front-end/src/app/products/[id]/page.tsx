import { Metadata } from "next";
import { ProductService } from "@/services/ProductService";
import { createProductMetadata } from "@/utils/metadata";
import ProductDetailPageClient from "@/components/ProductDetail/ProductDetailPageClient";
import { notFound } from "next/navigation";

// Props từ dynamic route
interface Props {
  params: { id: string };
}

// Tạo metadata động dựa trên dữ liệu sản phẩm
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const product = await ProductService.getProductById(id);

    if (!product) {
      return {
        title: "Sản phẩm không tìm thấy",
        description: "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa",
      };
    }

    return createProductMetadata(product);
  } catch (error) {
    console.error("Error generating product metadata:", error);
    return {
      title: "Lỗi tải sản phẩm",
      description:
        "Đã xảy ra lỗi khi tải thông tin sản phẩm. Vui lòng thử lại sau.",
    };
  }
}

// Tối ưu tính năng Streaming với Suspense (tùy chọn)
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate sau 1 giờ

export default async function ProductDetailPage({ params }: Props) {
  try {
    const { id } = await params;

    // Fetch dữ liệu sản phẩm từ server
    const product = await ProductService.getProductById(id);

    if (!product) {
      notFound(); // Sử dụng trang 404 của Next.js
    }

    // Truyền dữ liệu sản phẩm ban đầu cho Client Component
    return <ProductDetailPageClient productId={id} initialProduct={product} />;
  } catch (error) {
    console.error("Error loading product in server component:", error);
    // Truyền productId và để client component xử lý lỗi và loading
    return <ProductDetailPageClient productId={params.id} />;
  }
}
