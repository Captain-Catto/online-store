"use client";

import React, { useState, useEffect } from "react";
import {
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { ProductService } from "@/services/ProductService";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import FilterSidebar from "@/components/Category/FilterSidebar";
import ProductGrid from "@/components/Category/ProductGrid";
import Pagination from "@/components/Category/Pagination";
import { Product, PaginatedResponse } from "@/app/categories/types";

export default function CategoryPage() {
  // Các state hiện tại giữ nguyên
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
  const [Filters, setFilters] = useState(() => {
    return {
      suitability: searchParams.get("suitability")
        ? searchParams.get("suitability")!.split(",")
        : [],
      size: searchParams.get("size")
        ? searchParams.get("size")!.split(",")
        : [],
      color: searchParams.get("color") || "",
      category: params.id ? String(params.id) : "",
    };
  });

  // Thêm useEffect mới để fetch suitabilities riêng biệt
  useEffect(() => {
    const fetchSuitabilities = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/products/suitabilities"
        );
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

  // Cập nhật URL khi filters thay đổi - sử dụng shallow routing
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    if (Filters.color) {
      params.set("color", Filters.color);
    }

    if (Filters.size.length > 0) {
      params.set("size", Filters.size.join(","));
    }

    if (Filters.suitability.length > 0) {
      params.set("suitability", Filters.suitability.join(","));
    }

    const newUrl =
      pathname + (params.toString() ? `?${params.toString()}` : "");

    // Thêm shallow: true để tránh reload trang khi cập nhật URL
    router.push(newUrl, { scroll: false, shallow: true });
  };

  // Cập nhật URL khi filter hoặc trang thay đổi
  useEffect(() => {
    updateUrlWithFilters();
  }, [Filters, currentPage]);

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);

      // Tạo object chứa các filter
      const apiFilters: {
        page: string;
        limit: string;
        color?: string;
        size?: string;
        suitability?: string;
      } = {
        page: page.toString(),
        limit: itemsPerPage.toString(),
      };

      // Thêm các filter khác nếu có
      if (Filters.color) apiFilters.color = Filters.color;
      if (Filters.size.length > 0) apiFilters.size = Filters.size.join(",");
      if (Filters.suitability.length > 0) {
        apiFilters.suitability = Filters.suitability.join(",");
      }

      // Nếu có categoryId, dùng getProductsByCategory, nếu không dùng getProducts
      let response;
      if (Filters.category) {
        response = await ProductService.getProductsByCategory(
          Filters.category,
          apiFilters
        );
      } else {
        response = await ProductService.getProducts(
          page,
          itemsPerPage,
          apiFilters
        );
      }

      const { products: productsData, pagination: paginationData } =
        response as PaginatedResponse;

      // Xử lý dữ liệu sản phẩm
      const initialColors: { [productId: string]: string } = {};
      const initialImages: { [productId: string]: string } = {};

      // Tạo danh sách suitability duy nhất từ tất cả sản phẩm
      const allSuitability = new Set<string>();

      productsData.forEach((product) => {
        // Thêm tất cả suitability vào Set để loại bỏ trùng lặp
        if (product.suitability) {
          product.suitability.forEach((item) =>
            allSuitability.add(item.trim())
          );
        }

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
                variant.images.find((img) => img.isMain) || variant.images[0];
              imageUrl = mainImage.url;
            }
            initialImages[product.id.toString()] = imageUrl;
          }
        }
      });

      setProducts(productsData);
      setAvailableSuitability(Array.from(allSuitability));
      setTotalItems(paginationData.total);
      setTotalPages(paginationData.totalPages);
      setSelectedColors(initialColors);
      setProductImages(initialImages);
      setLoading(false);
    } catch (error) {
      console.error("Không thể tải sản phẩm:", error);
      setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Thêm useEffect để theo dõi thay đổi của filter
  useEffect(() => {
    // Reset về trang 1 khi filter thay đổi
    setCurrentPage(1);
    fetchProducts(1);
  }, [Filters.category, Filters.color, Filters.size, Filters.suitability]);

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
    const page = Number(searchParams.get("page") || "1");
    fetchProducts(page);
  }, []);

  // Hàm xử lý khi người dùng chọn màu cho sản phẩm
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
            variant.images.find((img) => img.isMain) || variant.images[0];
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

  // Xử lý filter category
  const handleCategoryFilter = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === categoryId ? "" : categoryId,
    }));
  };

  // Logic lọc sản phẩm (phía client)
  const filteredProducts = products.filter((product) => {
    // Nếu có suitability filter và không khớp
    if (Filters.suitability.length > 0) {
      if (
        !Filters.suitability.some((filter) =>
          product.suitability.includes(filter)
        )
      ) {
        return false;
      }
    }
    // Nếu có category filter và không khớp
    if (
      Filters.category &&
      (!product.categories ||
        !product.categories.some(
          (cat) => cat.id.toString() === Filters.category
        ))
    ) {
      return false;
    }

    // Nếu có color filter và không khớp
    if (
      Filters.color &&
      (!product.colors || !product.colors.includes(Filters.color))
    ) {
      return false;
    }

    // Nếu có size filter và không khớp
    if (Filters.size.length > 0) {
      if (
        !product.sizes ||
        !Filters.size.some((filterSize) => product.sizes.includes(filterSize))
      ) {
        return false;
      }
    }

    // Nếu vượt qua tất cả filter, hiển thị sản phẩm
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

  return (
    <>
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
            handleCategoryFilter={handleCategoryFilter}
            availableSuitability={availableSuitability}
          />

          <div className="lg:w-3/4">
            <ProductGrid
              products={filteredProducts}
              selectedColors={selectedColors}
              productImages={productImages}
              onColorSelect={handleColorSelect}
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
    </>
  );
}
