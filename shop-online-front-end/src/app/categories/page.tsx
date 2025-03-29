"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getMockPaginatedData } from "./data";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import FilterSidebar from "@/components/Category/FilterSidebar";
import ProductGrid from "@/components/Category/ProductGrid";
import Pagination from "@/components/Category/Pagination";
import type { Product } from "@/app/categories/types";

export default function CategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<{
    [productId: string]: string;
  }>({});
  const [availableSuitability, setAvailableSuitability] = useState<string[]>(
    []
  );

  // State cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [filtersOpen, setFiltersOpen] = useState({
    suitability: false,
    size: false,
    color: false,
  });

  const [Filters, setFilters] = useState({
    suitability: [] as string[],
    size: [] as string[],
    color: "",
  });

  console.log("Filters", Filters);

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      const paginatedResult = getMockPaginatedData(page, itemsPerPage);

      // Lấy danh sách suitability có sẵn từ API
      setAvailableSuitability(
        paginatedResult.filters.availableSuitability || []
      );

      // Chuẩn hóa dữ liệu sản phẩm, đảm bảo tất cả đều có trường suitability
      const normalizedProducts = paginatedResult.data.map((product) => ({
        ...product,
        suitability: product.suitability || [],
      }));

      // Khởi tạo màu mặc định cho mỗi sản phẩm
      const initialColors: { [productId: string]: string } = {};
      normalizedProducts.forEach((product) => {
        if (product.color.length > 0) {
          initialColors[product.id] = product.color[0];
        }
      });

      setProducts(normalizedProducts);
      setTotalItems(paginatedResult.pagination.totalItems);
      setTotalPages(paginatedResult.pagination.totalPages);
      setSelectedColors((prev) => ({ ...prev, ...initialColors }));
      setLoading(false);
    } catch (error) {
      console.error("Không thể tải sản phẩm:", error);
      setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Hàm xử lý khi chuyển trang
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      fetchProducts(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Chỉ gọi API một lần khi component mount
  useEffect(() => {
    fetchProducts(currentPage);
  }, []);

  // Hàm xử lý khi người dùng chọn màu cho sản phẩm
  const handleColorSelect = (productId: string, color: string) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));
  };

  // Hàm đóng/mở các mục filter
  const toggleFilter = (filterName: keyof typeof filtersOpen) => {
    setFiltersOpen((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  // Xử lý filter suitability (có thể chọn nhiều giá trị)
  const handleSuitabilityFilter = (suitability: string) => {
    setFilters((prev) => {
      // Nếu giá trị đã tồn tại trong mảng, loại bỏ nó
      if (prev.suitability.includes(suitability)) {
        return {
          ...prev,
          suitability: prev.suitability.filter((item) => item !== suitability),
        };
      }
      // Nếu chưa có, thêm vào mảng
      else {
        return {
          ...prev,
          suitability: [...prev.suitability, suitability],
        };
      }
    });
  };

  // Xử lý filter size (có thể chọn nhiều giá trị)
  const handleSizeFilter = (size: string) => {
    setFilters((prev) => {
      // Nếu giá trị đã tồn tại trong mảng, loại bỏ nó (toggle off)
      if (prev.size.includes(size)) {
        return {
          ...prev,
          size: prev.size.filter((item) => item !== size),
        };
      }
      // Nếu chưa có, thêm vào mảng (toggle on)
      else {
        return {
          ...prev,
          size: [...prev.size, size],
        };
      }
    });
  };

  // Xử lý filter color (chỉ chọn một giá trị)
  const handleColorFilter = (color: string) => {
    setFilters((prev) => ({
      ...prev,
      // Nếu màu đã được chọn, bỏ chọn (set thành "")
      // Nếu chưa chọn hoặc khác với màu hiện tại, chọn màu mới
      color: prev.color === color ? "" : color,
    }));
  };

  // Hàm lấy ảnh sản phẩm dựa trên màu đã chọn
  const getProductImage = (product: Product, color: string) => {
    const frontImage = product.images.find(
      (img) => img.color === color && img.isFront
    );
    return frontImage ? frontImage.src : product.images[0]?.src;
  };

  // Tính toán phần trăm giảm giá
  const calculateDiscount = (price?: number, originalPrice?: number) => {
    if (price && originalPrice && originalPrice > price) {
      return Math.round(100 - (price / originalPrice) * 100);
    }
    return 0;
  };

  // Map màu sắc sang mã hex
  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    blue: "#0066CC",
    red: "#FF0000",
    green: "#008000",
    yellow: "#FFFF00",
    purple: "#800080",
    gray: "#808080",
  };

  // Logic lọc sản phẩm
  const filteredProducts = products.filter((product) => {
    // Nếu không có filter nào được chọn, hiển thị tất cả sản phẩm
    if (
      Filters.suitability.length === 0 &&
      Filters.size.length === 0 &&
      !Filters.color
    ) {
      return true;
    }

    // Kiểm tra filter theo màu sắc (filter dạng string)
    if (Filters.color && !product.color.includes(Filters.color)) {
      return false;
    }

    // Kiểm tra filter theo suitability (filter dạng mảng)
    if (Filters.suitability.length > 0) {
      const productSuitability = product.suitability || [];

      // Kiểm tra xem product có ít nhất một suitability khớp với filter không
      const hasSuitability = Filters.suitability.some((filterSuitability) =>
        productSuitability.includes(filterSuitability)
      );

      if (!hasSuitability) {
        return false;
      }
    }

    // Kiểm tra filter theo size (filter dạng mảng)
    if (Filters.size.length > 0) {
      // Kiểm tra xem product có ít nhất một size khớp với filter không
      const hasSize = Filters.size.some((filterSize) =>
        product.sizes.includes(filterSize)
      );

      if (!hasSize) {
        return false;
      }
    }

    // Nếu vượt qua tất cả điều kiện lọc, hiển thị sản phẩm
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lỗi</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  console.log("Filters.suitability:", Filters.suitability);

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar
            filtersOpen={filtersOpen}
            activeFilters={Filters}
            toggleFilter={toggleFilter}
            handleSuitabilityFilter={handleSuitabilityFilter}
            handleSizeFilter={handleSizeFilter}
            handleColorFilter={handleColorFilter}
            availableSuitability={availableSuitability}
          />

          <div className="lg:w-3/4">
            <ProductGrid
              products={filteredProducts}
              selectedColors={selectedColors}
              onColorSelect={handleColorSelect}
              getProductImage={getProductImage}
              calculateDiscount={calculateDiscount}
              colorMap={colorMap}
              category={params.id as string}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
