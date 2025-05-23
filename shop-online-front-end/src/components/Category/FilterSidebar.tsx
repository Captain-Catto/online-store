import React from "react";
import SuitabilityFilter from "./SuitabilityFilter";
import SizeFilter from "./SizeFilter";
import ColorFilter from "./ColorFilter";
import ChildCategoryFilter from "./ChildCategoryFilter";
import MainCategoryFilter from "./MainCategoryFilter";
import PriceFilter from "./PriceFilter";

interface CategoryInfo {
  id: number | string;
  name: string;
  slug: string;
  children?: CategoryInfo[];
}

interface FiltersOpenState {
  suitability: boolean;
  size: boolean;
  color: boolean;
  categories: boolean;
  mainCategory: boolean;
  price: boolean;
}

interface FilterSidebarProps {
  filtersOpen: FiltersOpenState;
  activeFilters: {
    suitability: string[];
    size: string[];
    color: string;
    childCategory: string;
    category?: number;
    price?: { min: number; max: number };
  };
  toggleFilter: (filterName: keyof FiltersOpenState) => void;
  handleSuitabilityFilter: (suitability: string) => void;
  handleSizeFilter: (size: string) => void;
  handleColorFilter: (color: string) => void;
  handleChildCategoryFilter: (childSlug: string) => void;
  handleCategoryFilter: (categorySlug: string) => void;
  handlePriceFilter: (minPrice: string, maxPrice: string) => void;
  handleResetAllFilters: () => void;
  availableSuitability: string[];
  childCategories: CategoryInfo[];
  mainCategories: CategoryInfo[];
  showCategoryFilters?: boolean;
  availableColors: string[];
  availableSizes: string[];
  availableBrands: string[];
  priceRange: { min: number; max: number };
}

export default function FilterSidebar({
  filtersOpen,
  activeFilters,
  toggleFilter,
  handleSuitabilityFilter,
  handleSizeFilter,
  handleColorFilter,
  handleChildCategoryFilter,
  handleCategoryFilter,
  handlePriceFilter,
  handleResetAllFilters,
  availableSuitability,
  childCategories,
  mainCategories,
  showCategoryFilters = true,
  availableSizes,
  priceRange,
}: FilterSidebarProps) {
  // Kiểm tra xem có filter nào được áp dụng không
  const hasActiveFilters =
    activeFilters.suitability.length > 0 ||
    activeFilters.size.length > 0 ||
    activeFilters.color !== "" ||
    activeFilters.childCategory !== "" ||
    (activeFilters.price &&
      (activeFilters.price.min > 0 || activeFilters.price.max > 0));

  return (
    <div className="lg:w-1/4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Bộ lọc</h2>
        {/* Nút xóa bộ lọc */}
        {hasActiveFilters && (
          <button
            onClick={handleResetAllFilters}
            className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition duration-200 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Xóa tất cả
          </button>
        )}
      </div>
      {showCategoryFilters && (
        <>
          {/* Sử dụng MainCategoryFilter */}
          <MainCategoryFilter
            isOpen={filtersOpen.mainCategory ?? false}
            activeCategory={activeFilters.category}
            onToggle={() => toggleFilter("mainCategory")}
            onFilterChange={handleCategoryFilter}
            categories={mainCategories || []}
          />
          {/* Sử dụng ChildCategoryFilter thay vì SubtypeFilter */}
          {childCategories && childCategories.length > 0 && (
            <ChildCategoryFilter
              isOpen={filtersOpen.categories}
              activeChildCategory={activeFilters.childCategory || ""}
              onToggle={() => toggleFilter("categories")}
              onFilterChange={handleChildCategoryFilter}
              childCategories={childCategories}
            />
          )}
        </>
      )}

      {/* Price Filter với props chính xác */}
      <PriceFilter
        isOpen={filtersOpen.price || false}
        onToggle={() => toggleFilter("price")}
        onFilterChange={handlePriceFilter}
        priceRange={priceRange}
        activeRange={activeFilters.price || { min: 0, max: 0 }}
      />

      <SuitabilityFilter
        isOpen={filtersOpen.suitability}
        activeFilters={activeFilters.suitability}
        onToggle={() => toggleFilter("suitability")}
        onFilterChange={handleSuitabilityFilter}
        availableSuitability={availableSuitability}
      />

      <SizeFilter
        isOpen={filtersOpen.size}
        activeFilters={activeFilters.size}
        onToggle={() => toggleFilter("size")}
        onFilterChange={handleSizeFilter}
        availableSizes={availableSizes || []}
      />

      <ColorFilter
        isOpen={filtersOpen.color}
        activeFilter={activeFilters.color}
        onToggle={() => toggleFilter("color")}
        onFilterChange={handleColorFilter}
      />
    </div>
  );
}
