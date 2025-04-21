import React, { useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";
import { Product } from "@/types/product";

interface ProcessedProduct extends Product {
  colorToImage: Record<string, string>;
  variants: Record<
    string,
    { price: number; originalPrice: number; sizes: string[] }
  >;
}

interface ProductGridProps {
  products: Product[];
  selectedColors: { [productId: string]: string };
  productImages: { [productId: string]: string };
  onColorSelect: (productId: number, color: string) => void;
  category?: string;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  loading?: boolean;
  error?: string | null;
}

export default function ProductGrid({
  products,
  selectedColors,
  productImages,
  onColorSelect,
  category,
  currentPage,
  itemsPerPage,
  totalItems,
  loading = false,
  error = null,
}: ProductGridProps) {
  const [processedProducts, setProcessedProducts] = useState<
    ProcessedProduct[]
  >([]);

  // Process products to extract colors and default images
  useEffect(() => {
    // Nếu không có sản phẩm hoặc đang loading, không xử lý
    if (!products || products.length === 0) {
      setProcessedProducts([]);
      return;
    }

    const processed = products.map((product) => {
      // Sử dụng colors trực tiếp từ API
      const colors = product.colors || [];

      // Tạo variants từ dữ liệu giá và kích thước
      const variants: Record<
        string,
        { price: number; originalPrice: number; sizes: string[] }
      > = {};

      // Nếu có nhiều màu sắc, tạo variants cho mỗi màu
      if (colors && colors.length > 0) {
        colors.forEach((color) => {
          variants[color] = {
            price: product.priceRange?.min || 0,
            originalPrice: product.priceRange?.max || 0,
            sizes: product.sizes || [],
          };
        });
      } else {
        // Nếu không có màu, tạo một variant mặc định
        variants["default"] = {
          price: product.priceRange?.min || 0,
          originalPrice: product.priceRange?.max || 0,
          sizes: product.sizes || [],
        };
      }

      // Tạo colorToImage từ mainImage và subImage
      const colorToImage: Record<string, string> = {};

      // Nếu có nhiều màu, giả định rằng màu đầu tiên tương ứng với mainImage
      if (colors.length > 0 && product.mainImage) {
        colorToImage[colors[0]] = product.mainImage;

        // Nếu có subImage, gán cho các màu còn lại
        if (product.subImage && product.subImage.length > 0) {
          const remainingColors = colors.slice(1);
          remainingColors.forEach((color, index) => {
            if (index < product.subImage.length) {
              colorToImage[color] = product.subImage[index].url;
            } else {
              colorToImage[color] = product.mainImage; // Fallback to mainImage
            }
          });
        } else {
          // Nếu không có subImage, tất cả màu đều dùng mainImage
          colors.forEach((color) => {
            colorToImage[color] = product.mainImage;
          });
        }
      } else if (product.mainImage) {
        // Nếu không có màu cụ thể, sử dụng mainImage cho 'default'
        colorToImage["default"] = product.mainImage;
      }

      return {
        ...product,
        colors: colors,
        colorToImage: colorToImage,
        variants: variants,
      };
    });

    setProcessedProducts(processed);

    // Pre-populate selectedColors and productImages if they're empty
    const newSelectedColors: Record<string, string> = { ...selectedColors };
    const newProductImages: Record<string, string> = { ...productImages };

    processed.forEach((product) => {
      const productId = product.id.toString();

      // Chọn màu mặc định nếu chưa có màu được chọn
      if (!newSelectedColors[productId]) {
        if (product.colors && product.colors.length > 0) {
          newSelectedColors[productId] = product.colors[0];

          // Cập nhật hình ảnh tương ứng
          if (product.colorToImage && product.colorToImage[product.colors[0]]) {
            newProductImages[productId] =
              product.colorToImage[product.colors[0]];
          }
        } else if (product.mainImage) {
          // Nếu không có màu nhưng có mainImage
          newProductImages[productId] = product.mainImage;
        }
      }
    });
  }, [products, selectedColors, productImages]);

  if (loading) {
    return (
      <div className="w-full text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-pink-500"></div>
        <p className="mt-2">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-12 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {category
            ? `Danh mục: ${decodeURIComponent(category)}`
            : "Tất cả sản phẩm"}
        </h1>
        <div className="text-sm">
          Hiển thị {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems} sản
          phẩm
        </div>
      </div>

      {processedProducts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">
            Không tìm thấy sản phẩm nào
          </h3>
          <p className="text-gray-600">Vui lòng thử lại với bộ lọc khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {processedProducts.map((product) => {
            const productId = product.id.toString();

            // Đảm bảo colors tồn tại và có phần tử
            const hasColors = product.colors && product.colors.length > 0;
            const selectedColor =
              selectedColors[productId] ||
              (hasColors ? product.colors[0] : "default") ||
              "default";

            // Chọn hình ảnh dựa trên màu đã chọn
            const productImage =
              (selectedColor &&
                product.colorToImage &&
                product.colorToImage[selectedColor]) ||
              productImages[productId] ||
              product.mainImage ||
              "";

            const secondaryImage =
              product.subImage && product.subImage.length > 0
                ? product.subImage[0].url
                : "";

            return (
              <ProductCard
                key={product.id}
                product={product}
                selectedColor={selectedColor}
                productImage={productImage}
                secondaryImage={secondaryImage} // Thêm prop này
                onColorSelect={onColorSelect}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
