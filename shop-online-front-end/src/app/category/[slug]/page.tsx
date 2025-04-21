"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { CategoryService } from "@/services/CategoryService";
import { Product } from "@/types/product";

// Định nghĩa interface cho thông tin danh mục
interface CategoryInfo {
  id: number | string;
  name: string;
  slug: string;
  children?: CategoryInfo[];
}

// Định nghĩa interface cho filter
interface FilterState {
  suitability: string[];
  size: string[];
  color: string;
  childCategory: string;
}

// Định nghĩa interface cho filter response từ API
interface FilterResponse {
  availableColors?: string[];
  availableSizes?: string[];
  priceRange?: { min: number; max: number };
  brands?: string[];
}

// Định nghĩa interface cho filters mở
interface FiltersOpenState {
  suitability: boolean;
  size: boolean;
  color: boolean;
  categories: boolean;
  mainCategory: boolean;
}

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categorySlug = params.slug as string;
  const childSlug = params.childSlug as string;

  // Thông tin danh mục
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [childCategories, setChildCategories] = useState<CategoryInfo[]>([]);
  const [mainCategories, setMainCategories] = useState<CategoryInfo[]>([]);

  // Phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(12);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Thông tin filter từ API
  const [availableSuitability, setAvailableSuitability] = useState<string[]>(
    []
  );
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 0,
  });

  // State cho sản phẩm
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string>>(
    {}
  );
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter open states
  const [filtersOpen, setFiltersOpen] = useState<FiltersOpenState>({
    suitability: true,
    size: true,
    color: true,
    categories: true,
    mainCategory: false,
  });

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>(() => {
    return {
      suitability: searchParams.get("suitability")
        ? searchParams.get("suitability")!.split(",")
        : [],
      size: searchParams.get("size")
        ? searchParams.get("size")!.split(",")
        : [],
      color: searchParams.get("color") || "",
      childCategory: searchParams.get("childCategory") || childSlug || "",
    };
  });

  // Fetch all categories for navigation
  useEffect(() => {
    const fetchAllCategories = async (): Promise<void> => {
      try {
        const categories = await CategoryService.getNavCategories();
        setMainCategories(categories);
      } catch (error) {
        console.error("Không thể lấy danh sách danh mục chính:", error);
      }
    };

    void fetchAllCategories();
  }, []);

  // Fetch category and its children from slug
  useEffect(() => {
    const fetchCategoryFromSlug = async (): Promise<void> => {
      try {
        const category = await CategoryService.getCategoryBySlug(categorySlug);
        setCategoryId(category.id.toString());
        setCategoryName(category.name);

        if (category.children && category.children.length > 0) {
          setChildCategories(category.children);
        }
      } catch (error) {
        console.error("Không thể lấy thông tin danh mục:", error);
        setError("Không thể tìm thấy danh mục. Vui lòng thử lại sau.");
      }
    };

    if (categorySlug) {
      void fetchCategoryFromSlug();
    }
  }, [categorySlug]);

  // Chuyển hướng đến trang danh mục khác
  const handleCategoryFilter = useCallback(
    (newCategorySlug: string): void => {
      router.push(`/category/${newCategorySlug}`);
    },
    [router]
  );

  // Update URL with current filters
  const updateUrlWithFilters = useCallback((): void => {
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

    // Thêm childCategory vào URL params nếu có
    if (filters.childCategory) {
      params.set("childCategory", filters.childCategory);
    }

    const newUrl =
      pathname + (params.toString() ? `?${params.toString()}` : "");
    router.push(newUrl, { scroll: false });
  }, [currentPage, filters, pathname, router]);

  // Fetch products when filters or pagination changes
  useEffect(() => {
    if (!categorySlug) return;

    const fetchProducts = async (): Promise<void> => {
      try {
        setLoading(true);

        // Create filter object
        const apiFilters: Record<string, string> = {
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        };

        // Add other filters
        if (filters.color) apiFilters.color = filters.color;
        if (filters.size.length > 0) apiFilters.size = filters.size.join(",");
        if (filters.suitability.length > 0) {
          apiFilters.suitability = filters.suitability.join(",");
        }
        // Thêm childCategory vào filters nếu có
        if (filters.childCategory) {
          apiFilters.childCategory = filters.childCategory;
        }

        const response = await CategoryService.getProductsByCategorySlug(
          categorySlug,
          currentPage,
          itemsPerPage,
          apiFilters
        );

        // Destructure dữ liệu từ response
        const {
          products: productsData,
          pagination,
          filters: responseFilters,
          category: categoryData,
          availableSuitability: suitabilityData,
        } = response;

        // Cập nhật state với dữ liệu từ API
        setProducts(productsData);
        setTotalItems(pagination.total);

        // Cập nhật thông tin category nếu có
        if (categoryData) {
          setCategoryName(categoryData.name);
          setCategoryId(categoryData.id.toString());
        }

        // Cập nhật các filter có sẵn từ response
        if (responseFilters) {
          setAvailableColors(responseFilters.availableColors || []);
          setAvailableSizes(responseFilters.availableSizes || []);
          setPriceRange(responseFilters.priceRange || { min: 0, max: 0 });
          setAvailableBrands(responseFilters.brands || []);
        }

        if (suitabilityData) {
          setAvailableSuitability(suitabilityData);
        }

        // Khởi tạo hình ảnh và màu sắc cho sản phẩm
        const images: Record<string, string> = {};
        const colors: Record<string, string> = {};

        productsData.forEach((product: Product) => {
          // Sử dụng hình ảnh chính nếu có
          if (product.mainImage) {
            images[product.id] = product.mainImage;
          } else if (product.subImage && product.subImage.length > 0) {
            // Fallback to first subImage if available
            images[product.id] = product.subImage[0].url;
          }

          // Nếu có màu sắc, sử dụng màu đầu tiên
          if (product.colors && product.colors.length > 0) {
            colors[product.id] = product.colors[0];
          }
        });

        setProductImages(images);
        setSelectedColors(colors);
      } catch (error) {
        console.error("Không thể tải sản phẩm:", error);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
    updateUrlWithFilters();
  }, [
    categorySlug,
    childSlug,
    currentPage,
    filters,
    itemsPerPage,
    updateUrlWithFilters,
  ]);

  // Toggle filter sections
  const toggleFilter = useCallback(
    (filterName: keyof FiltersOpenState): void => {
      setFiltersOpen((prev) => ({
        ...prev,
        [filterName]: !prev[filterName],
      }));
    },
    []
  );

  // Filter handlers
  const handleSuitabilityFilter = useCallback((suitability: string): void => {
    setFilters((prev) => {
      const newSuitability = prev.suitability.includes(suitability)
        ? prev.suitability.filter((item) => item !== suitability)
        : [...prev.suitability, suitability];

      return { ...prev, suitability: newSuitability };
    });
    setCurrentPage(1);
  }, []);

  const handleSizeFilter = useCallback((size: string): void => {
    setFilters((prev) => {
      const newSize = prev.size.includes(size)
        ? prev.size.filter((item) => item !== size)
        : [...prev.size, size];

      return { ...prev, size: newSize };
    });
    setCurrentPage(1);
  }, []);

  const handleColorFilter = useCallback((color: string): void => {
    setFilters((prev) => ({
      ...prev,
      color: prev.color === color ? "" : color,
    }));
    setCurrentPage(1);
  }, []);

  // Child category filter handler
  const handleChildCategoryFilter = useCallback(
    (childCategorySlug: string): void => {
      console.log("Child category slug:", childCategorySlug);
      // If already selected, deselect it
      if (filters.childCategory === childCategorySlug) {
        setFilters((prev) => ({
          ...prev,
          childCategory: "",
        }));
        // Chỉ cập nhật URL mà không thay đổi route
        const params = new URLSearchParams(searchParams.toString());
        params.delete("childCategory");
        const newUrl = `${pathname}${
          params.size > 0 ? `?${params.toString()}` : ""
        }`;
        router.push(newUrl, { scroll: false });
      } else {
        // Select the child category
        setFilters((prev) => ({
          ...prev,
          childCategory: childCategorySlug,
        }));
        // Thay vì chuyển route, thêm childCategory vào query params
        const params = new URLSearchParams(searchParams.toString());
        params.set("childCategory", childCategorySlug);
        const newUrl = `${pathname}?${params.toString()}`;
        router.push(newUrl, { scroll: false });
      }
      setCurrentPage(1);
    },
    [filters.childCategory, pathname, router, searchParams]
  );

  // Handle color selection for product display
  const handleColorSelect = useCallback(
    (productId: number, color: string): void => {
      setSelectedColors((prev) => ({
        ...prev,
        [productId]: color,
      }));
    },
    []
  );

  // Handle pagination
  const handlePageChange = useCallback((page: number): void => {
    setCurrentPage(page);
  }, []);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{categoryName}</h1>
          <p className="text-gray-600 mt-2">
            {totalItems} sản phẩm{" "}
            {filters.childCategory ? "trong danh mục con" : ""}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar */}
          <FilterSidebar
            filtersOpen={filtersOpen}
            activeFilters={{
              ...filters,
              category: categoryId ? parseInt(categoryId) : undefined,
            }}
            toggleFilter={toggleFilter}
            handleSuitabilityFilter={handleSuitabilityFilter}
            handleSizeFilter={handleSizeFilter}
            handleColorFilter={handleColorFilter}
            handleChildCategoryFilter={handleChildCategoryFilter}
            handleCategoryFilter={handleCategoryFilter}
            availableSuitability={availableSuitability}
            childCategories={childCategories}
            mainCategories={mainCategories}
            availableColors={availableColors}
            availableSizes={availableSizes}
            availableBrands={availableBrands}
            priceRange={priceRange}
          />

          {/* Product grid and pagination */}
          <div className="lg:w-3/4">
            <ProductGrid
              products={products}
              selectedColors={selectedColors}
              productImages={productImages}
              onColorSelect={handleColorSelect}
              loading={loading}
              error={error}
              category={categoryName}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />

            {!loading && !error && totalItems > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalItems / itemsPerPage)}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
