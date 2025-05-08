import React, { useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";
import { Product, SimpleProduct, VariantDetail } from "@/types/product";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import SortingFilter from "@/components/UI/SortingFilter";

interface ProcessedProduct extends SimpleProduct {
  colorToImage: Record<string, string>;
  colorToSecondaryImage: Record<string, string>;
}

interface ProductGridProps {
  products: Product[];
  selectedColors: { [productId: string]: string };
  productImages: { [productId: string]: string };
  secondaryImages?: { [productId: string]: string };

  onColorSelect: (productId: number, color: string) => void;
  category?: string;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  loading?: boolean;
  error?: string | null;
  activeFilters?: { size: string[] };
  sortOption?: string;
  onSort?: (option: string) => void;
}

export default function ProductGrid({
  products,
  selectedColors,
  secondaryImages,
  productImages,
  onColorSelect,
  category,
  currentPage,
  itemsPerPage,
  totalItems,
  loading = false,
  error = null,
  activeFilters,
  sortOption,
  onSort,
}: ProductGridProps) {
  const [processedProducts, setProcessedProducts] = useState<
    ProcessedProduct[]
  >([]);

  const handleSort = (option: string) => {
    if (onSort) {
      onSort(option);
    }
  };

  // Xử lý sản phẩm để tạo dữ liệu phù hợp cho ProductCard
  useEffect(() => {
    if (!products || products.length === 0) {
      setProcessedProducts([]);
      return;
    }

    const processed = products.map((product) => {
      const colors = product.colors || [];
      const colorToImage: Record<string, string> = {};
      const colorToSecondaryImage: Record<string, string> = {};
      const variants: Record<string, VariantDetail> = {};

      // Xử lý variants cho từng màu
      colors.forEach((color) => {
        const variant = product.variants?.[color];
        const mainImage =
          variant?.images?.find((img) => img.isMain)?.url ||
          product.mainImage ||
          "";
        if (mainImage) {
          colorToImage[color] = mainImage;
        }

        // Thêm code để lấy hình phụ
        const secondaryImage =
          variant?.images?.find((img) => !img.isMain)?.url || "";
        if (secondaryImage) {
          colorToSecondaryImage[color] = secondaryImage;
        }

        // Lấy danh sách kích thước khả dụng và tồn kho từ variants
        const availableSizes = variant?.availableSizes || [];
        const inventory = variant?.inventory || {};

        variants[color] = {
          detailId: variant?.id || 0,
          price:
            variant?.price || product.priceRange?.min || product.price || 0,
          originalPrice:
            variant?.originalPrice ||
            product.priceRange?.max ||
            product.price ||
            0,
          images: variant?.images || [
            { id: 0, url: mainImage, isMain: true },
            ...(product.subImage?.map((img) => ({
              id: img.id,
              url: img.url,
              isMain: false,
            })) || []),
          ],
          availableSizes, // Sử dụng availableSizes từ variants
          inventory, // Sử dụng inventory từ variants
          variants: availableSizes.map((size) => ({
            color,
            size,
            stock: inventory[size] || 0, // Lấy stock từ inventory
          })),
        };
      });

      // Nếu không có màu, tạo variant mặc định
      if (colors.length === 0 && product.mainImage) {
        colorToImage["default"] = product.mainImage;
        variants["default"] = {
          detailId: 0,
          price: product.priceRange?.min || product.price || 0,
          originalPrice: product.priceRange?.max || product.price || 0,
          images: [{ id: 0, url: product.mainImage, isMain: true }],
          availableSizes: product.sizes || [],
          inventory: (product.sizes || []).reduce(
            (acc, size) => ({ ...acc, [size]: 1 }),
            {}
          ) as Record<string, number>,
          variants: (product.sizes || []).map((size) => ({
            color: "default",
            size,
            stock: 1,
          })),
        };
      }

      // Lấy giá nhỏ nhất để hiển thị mặc định
      const price = Object.values(variants).reduce(
        (min, variant) => Math.min(min, variant.price || Infinity),
        Infinity
      );
      const minPrice = price === Infinity ? 0 : price;

      return {
        id: product.id,
        name: product.name,
        featured: product.featured,
        colors,
        price: minPrice,
        variants,
        colorToImage,
        colorToSecondaryImage,
      };
    });

    setProcessedProducts(processed);
  }, [products]);

  // Cập nhật selectedColors nếu cần
  useEffect(() => {
    if (processedProducts.length === 0) return;

    processedProducts.forEach((product) => {
      const productId = product.id.toString();
      if (!selectedColors[productId] && product.colors.length > 0) {
        // Chọn màu đầu tiên có kích thước khả dụng nếu đang lọc kích thước
        const validColor =
          product.colors.find((color) => {
            const variant = product.variants[color];
            if (!variant || !activeFilters?.size?.length) return true;
            return activeFilters.size.some(
              (size) =>
                variant.availableSizes.includes(size) &&
                variant.inventory[size] > 0
            );
          }) || product.colors[0];
        onColorSelect(product.id, validColor);
      }
    });
  }, [processedProducts, selectedColors, onColorSelect, activeFilters]);

  // Tính toán thông tin phân trang
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-full">
      {/* Tiêu đề và thông tin phân trang */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {category
              ? `Danh mục: ${decodeURIComponent(category)}`
              : "Tất cả sản phẩm"}
          </h1>
          <div className="text-sm text-gray-600">
            {loading
              ? "Đang tải sản phẩm..."
              : `Hiển thị ${startItem} - ${endItem} / ${totalItems} sản phẩm`}
          </div>
        </div>
        <SortingFilter sortOption={sortOption || ""} onChange={handleSort} />
      </div>

      {/* Thông báo khi không có sản phẩm */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="lg" text="Đang tải sản phẩm..." />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center my-8">
          <div className="text-red-600 mb-2 text-xl">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <p className="text-red-600">{error}</p>
        </div>
      ) : processedProducts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Không tìm thấy sản phẩm nào
          </h3>
          <p className="text-gray-600">Vui lòng thử lại với bộ lọc khác</p>
        </div>
      ) : (
        /* Grid sản phẩm */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {processedProducts.map((product) => {
            const productId = product.id.toString();
            const hasColors = product.colors && product.colors.length > 0;
            const selectedColor =
              selectedColors[productId] ||
              (hasColors ? product.colors[0] : "default") ||
              "default";
            const productImage =
              (selectedColor &&
                product.colorToImage &&
                product.colorToImage[selectedColor]) ||
              productImages[productId] ||
              "";
            // Tìm đoạn code này và thay thế
            // Trong phần map qua processedProducts
            const secondaryImage =
              secondaryImages?.[productId] || // Ưu tiên sử dụng secondaryImages được truyền xuống
              (product.colorToSecondaryImage &&
              product.colorToSecondaryImage[selectedColor]
                ? product.colorToSecondaryImage[selectedColor] // Sau đó dùng ảnh phụ của màu đang chọn
                : product.colors.length > 1 &&
                  product.colors.find((c) => c !== selectedColor) &&
                  product.colorToImage[
                    product.colors.find((c) => c !== selectedColor) || ""
                  ]
                ? product.colorToImage[
                    product.colors.find((c) => c !== selectedColor) || ""
                  ]
                : "");

            // Lấy price và originalPrice từ variant của màu đã chọn
            const price =
              product.variants[selectedColor]?.price ??
              product.price ??
              undefined;
            const originalPrice =
              product.variants[selectedColor]?.originalPrice || product.price;

            return (
              <ProductCard
                key={product.id}
                product={product}
                selectedColor={selectedColor}
                productImage={productImage}
                secondaryImage={secondaryImage}
                onColorSelect={onColorSelect}
                price={price}
                originalPrice={originalPrice}
                availableSizes={
                  product.variants[selectedColor]?.availableSizes || []
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
