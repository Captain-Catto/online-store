import React from "react";
import SuitabilityFilter from "./SuitabilityFilter";
import SizeFilter from "./SizeFilter";
import ColorFilter from "./ColorFilter";
import SubtypeFilter from "./SubtypeFilter";

interface FilterSidebarProps {
  filtersOpen: {
    suitability: boolean;
    size: boolean;
    color: boolean;
    category: boolean;
    productGroups?: boolean;
  };
  activeFilters: {
    suitability: string[];
    size: string[];
    color: string;
    category: string;
    subtype?: string;
  };
  toggleFilter: (filterName: keyof FilterSidebarProps["filtersOpen"]) => void;
  handleSuitabilityFilter: (suitability: string) => void;
  handleSizeFilter: (size: string) => void;
  handleColorFilter: (color: string) => void;
  handleCategoryFilter: (categoryId: string) => void;
  handleSubtypeFilter?: (subtype: string) => void;
  availableSuitability?: string[];
  categories: { id: number; name: string }[];
  subtypes?: Array<{
    id: number;
    name: string;
    displayName: string;
    categoryId: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export default function FilterSidebar({
  filtersOpen,
  activeFilters,
  toggleFilter,
  handleSuitabilityFilter,
  handleSizeFilter,
  handleColorFilter,

  handleSubtypeFilter,
  availableSuitability,
  subtypes,
}: FilterSidebarProps) {
  return (
    <div className="lg:w-1/4">
      <div className="sticky top-24">
        <h2 className="text-2xl font-bold mb-6">Bộ lọc</h2>

        {/* Chỉ hiển thị SubtypeFilter khi có đủ props cần thiết */}
        {filtersOpen.productGroups !== undefined &&
          activeFilters.subtype !== undefined &&
          handleSubtypeFilter &&
          subtypes && (
            <SubtypeFilter
              isOpen={filtersOpen.productGroups}
              activeSubtype={activeFilters.subtype}
              onToggle={() => toggleFilter("productGroups")}
              onFilterChange={handleSubtypeFilter}
              subtypes={subtypes}
            />
          )}

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
