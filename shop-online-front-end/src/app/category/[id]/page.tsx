"use client";

import React, { useState, useEffect } from "react";
import {
  useParams,
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import FilterSidebar from "@/components/Category/FilterSidebar";
import ProductGrid from "@/components/Category/ProductGrid";
import Pagination from "@/components/Category/Pagination";
import { ProductService } from "@/services/ProductService";
import { Product } from "@/types/product";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryId = params.id as string;

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<{
    [productId: string]: string;
  }>({});
  const [productImages, setProductImages] = useState<{
    [productId: string]: string;
  }>({});
  const [availableSuitability, setAvailableSuitability] = useState<string[]>(
    []
  );
  const [categoryName, setCategoryName] = useState<string>("");

  // State cho pagination
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(searchParams.get("page") || "1");
  });
  const [itemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [filtersOpen, setFiltersOpen] = useState({
    suitability: false,
    size: false,
    color: false,
  });

  // Khởi tạo filter từ URL params
  const [filters, setFilters] = useState(() => {
    return {
      suitability: searchParams.get("suitability")
        ? searchParams.get("suitability")!.split(",")
        : [],
      size: searchParams.get("size")
        ? searchParams.get("size")!.split(",")
        : [],
      color: searchParams.get("color") || "",
      category: categoryId,
    };
  });

  // Cập nhật URL khi filters thay đổi mà không reload trang
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    if (filters.color) {
      params.set("color", filters.color);
    }

    if (filters.size.length > 0) {
      params.set("size", filters.size.join(","));
    }

    if (filters.suitability.length > 0) {
      params.set("suitability", filters.suitability.join(","));
    }

    const newUrl =
      pathname + (params.toString() ? `?${params.toString()}` : "");

    // Sử dụng shallow routing để không reload trang
    router.push(newUrl, { scroll: false });
  };

  // Fetch suitabilities khi component mount
  useEffect(() => {
    const fetchSuitabilities = async () => {
      try {
        const response = await fetch("/api/products/suitabilities");
        if (response.ok) {
          const data = await response.json();
          setAvailableSuitability(data.suitabilities);
          console.log("Fetched suitabilities:", data.suitabilities);
        } else {
          console.error("Failed to fetch suitabilities");
        }
      } catch (error) {
        console.error("Error fetching suitabilities:", error);
      }
    };

    fetchSuitabilities();
  }, []);

  // Cập nhật URL khi filter hoặc trang thay đổi
  useEffect(() => {
    updateUrlWithFilters();
  }, [filters, currentPage]);

  // Fetch products khi truy cập lần đầu hoặc filters thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Tạo object chứa các filter
        const apiFilters: Record<string, string> = {
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        };

        // Thêm các filter khác nếu có
        if (filters.color) apiFilters.color = filters.color;
        if (filters.size.length > 0) apiFilters.size = filters.size.join(",");
        if (filters.suitability.length > 0) {
          apiFilters.suitability = filters.suitability.join(",");
        }

        // Gọi API lấy sản phẩm theo category
        const response = await ProductService.getProductsByCategory(
          categoryId,
          apiFilters
        );

        // Xử lý kết quả
        const { products: productsData, pagination, category } = response;

        // Lưu tên danh mục
        if (category && category.name) {
          setCategoryName(category.name);
        }

        // Xử lý dữ liệu sản phẩm
        const initialColors: { [productId: string]: string } = {};
        const initialImages: { [productId: string]: string } = {};

        productsData.forEach((product: any) => {
          // Thiết lập màu mặc định cho mỗi sản phẩm (màu đầu tiên)
          if (product.colors && product.colors.length > 0) {
            const defaultColor = product.colors[0];
            initialColors[product.id.toString()] = defaultColor;

            // Lấy hình ảnh từ variant
            const variant = product.variants[defaultColor];
            if (variant) {
              let imageUrl = "";
              if (variant.images && variant.images.length > 0) {
                const mainImage =
                  variant.images.find((img: any) => img.isMain) ||
                  variant.images[0];
                imageUrl = mainImage.url;
              }
              initialImages[product.id.toString()] = imageUrl;
            }
          }
        });

        setProducts(productsData);
        setTotalItems(pagination.total);
        setTotalPages(pagination.totalPages);
        setSelectedColors(initialColors);
        setProductImages(initialImages);
      } catch (error) {
        console.error("Không thể tải sản phẩm:", error);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, currentPage, filters]);

  // Xử lý khi người dùng chọn màu cho sản phẩm
  const handleColorSelect = (productId: number, color: string) => {
    setSelectedColors((prev) => ({ ...prev, [productId.toString()]: color }));

    // Cập nhật hình ảnh khi đổi màu
    const product = products.find((p) => p.id === productId);
    if (product) {
      const variant = product.variants[color];
      if (variant) {
        let imageUrl = "";
        if (variant.images && variant.images.length > 0) {
          const mainImage =
            variant.images.find((img: any) => img.isMain) || variant.images[0];
          imageUrl = mainImage.url;
        }
        setProductImages((prev) => ({
          ...prev,
          [productId.toString()]: imageUrl,
        }));
      }
    }
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
      if (prev.suitability.includes(suitability)) {
        return {
          ...prev,
          suitability: prev.suitability.filter((s) => s !== suitability),
        };
      } else {
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
      if (prev.size.includes(size)) {
        return {
          ...prev,
          size: prev.size.filter((s) => s !== size),
        };
      } else {
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
      color: prev.color === color ? "" : color,
    }));
  };

  // Hàm xử lý khi chuyển trang
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Lỗi</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-black text-white rounded"
            >
              Thử lại
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar */}
          <FilterSidebar
            filtersOpen={filtersOpen}
            activeFilters={filters}
            toggleFilter={toggleFilter}
            handleSuitabilityFilter={handleSuitabilityFilter}
            handleSizeFilter={handleSizeFilter}
            handleColorFilter={handleColorFilter}
            availableSuitability={availableSuitability}
          />

          {/* Product grid */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <ProductGrid
                products={products}
                selectedColors={selectedColors}
                productImages={productImages}
                onColorSelect={handleColorSelect}
                category={categoryName}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
              />
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
