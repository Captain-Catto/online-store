import React from "react";
import SuitabilityFilter from "./SuitabilityFilter";
import SizeFilter from "./SizeFilter";
import ColorFilter from "./ColorFilter";
import ChildCategoryFilter from "./ChildCategoryFilter";
import MainCategoryFilter from "./MainCategoryFilter";

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
}
// Cập nhật interface FilterSidebarProps
interface FilterSidebarProps {
  filtersOpen: FiltersOpenState;
  activeFilters: {
    suitability: string[];
    size: string[];
    color: string;
    childCategory: string;
    category?: number;
  };
  toggleFilter: (filterName: keyof FiltersOpenState) => void;
  handleSuitabilityFilter: (suitability: string) => void;
  handleSizeFilter: (size: string) => void;
  handleColorFilter: (color: string) => void;
  handleChildCategoryFilter: (childSlug: string) => void;
  handleCategoryFilter: (categorySlug: string) => void;
  availableSuitability: string[];
  childCategories: CategoryInfo[];
  mainCategories: CategoryInfo[];
  showCategoryFilters?: boolean;

  // Thêm các props mới mà bạn đang sử dụng
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
  availableSuitability,
  childCategories,
  mainCategories,
  showCategoryFilters = true,
  availableSizes,
}: FilterSidebarProps) {
  return (
    <div className="lg:w-1/4">
      <div className="sticky top-24">
        <h2 className="text-2xl font-bold mb-6">Bộ lọc</h2>
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

        {/* Các bộ lọc khác */}

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
    </div>
  );
}
