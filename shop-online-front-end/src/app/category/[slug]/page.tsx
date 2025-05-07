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
import { ProductService } from "@/services/ProductService";
import { Product, VariantDetail } from "@/types/product";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

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
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
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

  const [secondaryImages, setSecondaryImages] = useState<
    Record<string, string>
  >({});

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

  // Thêm state để theo dõi nếu danh mục hiện tại là danh mục con
  const [isCurrentCategoryChild, setIsCurrentCategoryChild] =
    useState<boolean>(false);

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

  // Thêm một useEffect mới để gọi API lấy danh sách suitabilities
  useEffect(() => {
    const fetchSuitabilities = async () => {
      try {
        const suitabilitiesData = await ProductService.getSuitabilities();

        // Chuyển đổi dữ liệu sang định dạng phù hợp
        if (Array.isArray(suitabilitiesData)) {
          // Lấy danh sách các giá trị name từ API response
          const formattedSuitabilities = suitabilitiesData.map(
            (item) => item.name
          );
          setAvailableSuitability(formattedSuitabilities);
        }
      } catch (error) {
        console.error("Không thể tải danh sách phù hợp:", error);
      }
    };

    fetchSuitabilities();
  }, []);

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

  // Thêm hàm trích xuất hình ảnh
  const extractImages = useCallback((variant: VariantDetail) => {
    if (!variant?.images || variant.images.length === 0) {
      return { mainImage: null, secondaryImage: null };
    }

    const mainImage =
      variant.images.find((img) => img.isMain) || variant.images[0];
    let secondaryImage = null;

    if (variant.images.length > 1) {
      secondaryImage = variant.images.find((img) => !img.isMain);
    }

    return {
      mainImage: mainImage ? mainImage.url : null,
      secondaryImage: secondaryImage ? secondaryImage.url : null,
    };
  }, []);

  // Fetch products when filters or pagination changes
  useEffect(() => {
    if (!categorySlug) return;

    const fetchProducts = async (): Promise<void> => {
      try {
        setLoading(true);

        const apiFilters: Record<string, string> = {
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        };

        if (filters.color) apiFilters.color = filters.color;
        if (filters.size.length > 0) apiFilters.size = filters.size.join(",");
        if (filters.suitability.length > 0) {
          apiFilters.suitability = filters.suitability.join(",");
        }
        if (filters.childCategory) {
          apiFilters.childCategory = filters.childCategory;
        }

        const response = await CategoryService.getProductsByCategorySlug(
          categorySlug,
          currentPage,
          itemsPerPage,
          apiFilters
        );

        const {
          products: productsData,
          pagination,
          filters: responseFilters,
          category: categoryData,
        } = response;

        // Lọc sản phẩm phía client để đảm bảo thỏa mãn bộ lọc kích thước
        const filteredProducts = productsData.filter((product: Product) => {
          if (!filters.size.length) return true;
          return product.colors.some((color) => {
            const variant = product.variants?.[color];
            return (
              variant &&
              filters.size.some(
                (size) =>
                  variant.availableSizes.includes(size) &&
                  variant.inventory[size] > 0
              )
            );
          });
        });
        console.log("categoryData", categoryData);
        setProducts(filteredProducts);
        setTotalItems(pagination.total);
        setParentCategoryId(
          // nếu có categoryData.parentCategory thì lấy id của nó
          // còn không thì lấy id của categoryData
          categoryData.parentCategory?.id || categoryData.id
        );

        if (categoryData) {
          setCategoryName(categoryData.name);
          setCategoryId(categoryData.id.toString());
        }

        if (responseFilters) {
          setAvailableColors(responseFilters.availableColors || []);
          // setAvailableSizes(responseFilters.availableSizes || []);
          setPriceRange(responseFilters.priceRange || { min: 0, max: 0 });
          setAvailableBrands(responseFilters.brands || []);
        }

        const images: Record<string, string> = {};
        const secondaryImgs: Record<string, string> = {};

        const colors: Record<string, string> = {};

        filteredProducts.forEach((product: Product) => {
          if (!product) return;

          let availableColors = product.colors;
          if (filters.size.length > 0) {
            availableColors = product.colors.filter((color) => {
              const variant = product.variants?.[color];
              return (
                variant &&
                filters.size.some(
                  (size) =>
                    variant.availableSizes.includes(size) &&
                    variant.inventory[size] > 0
                )
              );
            });
          }

          const firstAvailableColor =
            availableColors.length > 0 ? availableColors[0] : product.colors[0];

          if (firstAvailableColor) {
            const mainImageForColor =
              product.variants?.[firstAvailableColor]?.images?.find(
                (img) => img.isMain
              )?.url || product.mainImage;
            images[product.id] = mainImageForColor;
            colors[product.id] = firstAvailableColor;
          }

          if (firstAvailableColor && product.variants?.[firstAvailableColor]) {
            const { mainImage, secondaryImage } = extractImages(
              product.variants[firstAvailableColor]
            );

            if (mainImage) images[product.id] = mainImage;
            if (secondaryImage) secondaryImgs[product.id] = secondaryImage;
            colors[product.id] = firstAvailableColor;
          }
        });

        setProductImages(images);
        setSecondaryImages(secondaryImgs);

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
    extractImages,
    parentCategoryId,
  ]);

  // Fetch category and its children from slug
  // Trong useEffect fetchCategoryFromSlug
  useEffect(() => {
    const fetchCategoryFromSlug = async (): Promise<void> => {
      try {
        const category = await CategoryService.getCategoryBySlug(categorySlug);

        // Kiểm tra xem đây có phải là danh mục con không
        const isChildCategory =
          category.parentId !== null && category.parentId !== undefined;

        // Cập nhật state để biết đây là danh mục con hay cha
        setIsCurrentCategoryChild(isChildCategory);

        if (isChildCategory) {
          setCategoryId(category.id.toString()); // Sửa đổi: lưu ID của danh mục con
          setCategoryName(category.name); // Sửa đổi: lưu tên của danh mục con
          // Không cần thiết lập childCategories vì ta sẽ ẩn filter danh mục con
          setChildCategories([]);
        } else {
          // Đây là danh mục cha
          // Lưu ID và tên của danh mục cha
          // hiển thị danh sách danh mục con trong bộ lọc
          setCategoryId(category.id.toString());
          setCategoryName(category.name);

          if (category.children && category.children.length > 0) {
            setChildCategories(category.children);
          }
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

  // Trong useEffect của CategoryDetailPage
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        // Kiểm tra xem có parentCategoryId không
        if (!parentCategoryId) {
          return;
        }

        const sizesData = await ProductService.getSizesByCategory(
          parentCategoryId
        );

        console.log("sizesData", sizesData);

        const availableSizeValues = sizesData
          .filter((size) => size.active)
          .map((size) => size.value);

        setAvailableSizes(availableSizeValues);
      } catch (error) {
        console.error("Không thể tải kích thước:", error);
      }
    };

    // Chỉ fetch sizes khi có parentCategoryId
    if (parentCategoryId) {
      void fetchSizes();
    }
  }, [parentCategoryId]);

  // Chuyển hướng đến trang danh mục khác
  const handleCategoryFilter = useCallback(
    (newCategorySlug: string): void => {
      router.push(`/category/${newCategorySlug}`);
    },
    [router]
  );

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
      // Log để debug
      if (!childCategorySlug) {
        // Khi người dùng chọn "Tất cả" trong bộ lọc danh mục con
        // KHÔNG chuyển hướng đến URL mới, chỉ cập nhật query params
        const params = new URLSearchParams(searchParams.toString());
        params.delete("childCategory"); // Xóa tham số childCategory

        // Cập nhật URL với các tham số còn lại, giữ nguyên slug danh mục hiện tại
        const newUrl = `${pathname}${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        router.push(newUrl, { scroll: false });

        // Cập nhật state filters
        setFilters((prev) => ({
          ...prev,
          childCategory: "",
        }));
      } else {
        // Khi chọn một danh mục con cụ thể
        const params = new URLSearchParams(searchParams.toString());

        const newUrl = `${pathname}?${params.toString()}`;
        router.push(newUrl, { scroll: false });

        // Cập nhật state filters
        setFilters((prev) => ({
          ...prev,
          childCategory: childCategorySlug,
        }));
      }
    },
    [pathname, router, searchParams]
  );

  // Handle color selection for product display
  const handleColorSelect = useCallback(
    (productId: number, color: string) => {
      setSelectedColors((prev) => ({ ...prev, [productId]: color }));

      const product = products.find((p) => p.id === productId);
      if (product?.variants?.[color]) {
        const { mainImage, secondaryImage } = extractImages(
          product.variants[color]
        );

        if (mainImage) {
          setProductImages((prev) => ({ ...prev, [productId]: mainImage }));
        }

        if (secondaryImage) {
          setSecondaryImages((prev) => ({
            ...prev,
            [productId]: secondaryImage,
          }));
        } else {
          setSecondaryImages((prev) => {
            const newImages = { ...prev };
            delete newImages[productId];
            return newImages;
          });
        }
      }
    },
    [products, extractImages]
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
          <FilterSidebar
            filtersOpen={filtersOpen}
            activeFilters={{
              ...filters,
              category: categoryId ? parseInt(categoryId) : undefined,
              childCategory: filters.childCategory,
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
            showCategoryFilters={!isCurrentCategoryChild}
          />
          {loading ? (
            <div className="container mx-auto px-4 py-12 text-center">
              <LoadingSpinner size="lg" text="Đang tải sản phẩm ..." />
            </div>
          ) : (
            <div className="lg:w-3/4">
              <ProductGrid
                products={products}
                selectedColors={selectedColors}
                productImages={productImages}
                secondaryImages={secondaryImages}
                onColorSelect={handleColorSelect}
                loading={loading}
                error={error}
                category={categoryName}
                activeFilters={filters}
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
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
