"use client";

import React, { useState, useEffect } from "react";
import { ProductService } from "@/services/ProductService";
import ProductCard from "@/components/ProductCard/ProductCard";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import Pagination from "@/components/UI/Pagination";
import { Product } from "@/types/product";
import SortingFilter from "@/components/UI/SortingFilter";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

type SearchPageClientProps = {
  initialQuery: string;
};

function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<string>("");
  const productsPerPage = 10;

  // State cho selected colors và product images
  const [selectedColors, setSelectedColors] = useState<{
    [productId: string]: string;
  }>({});
  const [productImages, setProductImages] = useState<{
    [productId: string]: string;
  }>({});
  const [secondaryImages, setSecondaryImages] = useState<{
    [productId: string]: string;
  }>({});

  // Tải sản phẩm khi query, trang hoặc sắp xếp thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      if (!initialQuery) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Tạo params cho API
        const params: { search: string; sort?: string } = {
          search: initialQuery,
        };

        // Thêm tùy chọn sắp xếp nếu có
        if (sortOption) {
          params.sort = sortOption;
        }

        const response = await ProductService.getProducts(
          currentPage,
          productsPerPage,
          params
        );

        setProducts(response.products || []);
        setTotalProducts(response.pagination.total || 0);

        // Khởi tạo selectedColors và productImages cho sản phẩm mới
        if (response.products && response.products.length > 0) {
          const newSelectedColors: { [productId: string]: string } = {};
          const newProductImages: { [productId: string]: string } = {};
          const newSecondaryImages: { [productId: string]: string } = {};

          response.products.forEach((product: Product) => {
            const productId: string = product.id.toString();
            const firstColor: string =
              product.colors && product.colors.length > 0
                ? product.colors[0]
                : "default";
            newSelectedColors[productId] = firstColor;

            // Lấy hình ảnh chính cho màu đầu tiên
            const variant: Product["variants"][string] | undefined =
              product.variants?.[firstColor];
            const mainImage: string =
              variant?.images?.find(
                (img: { isMain: boolean; url: string }) => img.isMain
              )?.url || "";
            newProductImages[productId] = mainImage;

            // Lấy hình ảnh phụ cho màu đầu tiên
            const secondaryImage: string =
              variant?.images?.find(
                (img: { isMain: boolean; url: string }) => !img.isMain
              )?.url || "";
            newSecondaryImages[productId] = secondaryImage;
          });

          setSelectedColors((prev) => ({ ...prev, ...newSelectedColors }));
          setProductImages((prev) => ({ ...prev, ...newProductImages }));
          setSecondaryImages((prev) => ({ ...prev, ...newSecondaryImages }));
        }
      } catch {
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [initialQuery, currentPage, sortOption]);

  // Đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sắp xếp sản phẩm
  const handleSort = (option: string) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  // Xử lý khi người dùng chọn màu
  const handleColorSelect = (productId: number, color: string) => {
    const id = productId.toString();
    setSelectedColors((prev) => ({ ...prev, [id]: color }));

    // Cập nhật ảnh theo màu đã chọn
    const product = products.find((p) => p.id.toString() === id);
    if (product && product.variants && product.variants[color]) {
      const variant = product.variants[color];
      const mainImage = variant.images?.find((img) => img.isMain)?.url || "";
      const secondaryImage =
        variant.images?.find((img) => !img.isMain)?.url || "";

      setProductImages((prev) => ({ ...prev, [id]: mainImage }));
      setSecondaryImages((prev) => ({ ...prev, [id]: secondaryImage }));
    }
  };

  return (
    <>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">
            Kết quả tìm kiếm{" "}
            {initialQuery && (
              <span>
                {" "}
                cho:{" "}
                <span className="text-gray-500">
                  &quot;{initialQuery}&quot;
                </span>
              </span>
            )}
          </h1>
        </div>

        {/* Kết quả tìm kiếm */}
        <div>
          {/* Sắp xếp và số kết quả */}
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <p className="text-gray-600">
              {loading
                ? "Đang tìm kiếm..."
                : `Hiển thị ${products.length} trên ${totalProducts} sản phẩm`}
            </p>

            <SortingFilter sortOption={sortOption} onChange={handleSort} />
          </div>

          {/* Hiển thị kết quả */}
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" text="Đang tải sản phẩm..." />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
              {error}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((product) => {
                  const productId = product.id.toString();
                  const selectedColor = selectedColors[productId] || "default";
                  const productImage = productImages[productId] || "";
                  const secondaryImage = secondaryImages[productId] || "";

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      selectedColor={selectedColor}
                      productImage={productImage}
                      secondaryImage={secondaryImage}
                      onColorSelect={handleColorSelect}
                    />
                  );
                })}
              </div>

              {/* Phân trang */}
              {totalProducts > productsPerPage && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalProducts / productsPerPage)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">
                Không tìm thấy sản phẩm nào phù hợp
              </p>
              <p className="text-gray-400 mt-2">
                Hãy thử từ khóa tìm kiếm khác
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SearchPageClient;
