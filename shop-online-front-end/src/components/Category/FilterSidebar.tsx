import React from "react";
import SuitabilityFilter from "./SuitabilityFilter";
import SizeFilter from "./SizeFilter";
import ColorFilter from "./ColorFilter";
import CategoryFilter from "./CategoryFilter";

interface FilterSidebarProps {
  filtersOpen: {
    suitability: boolean;
    size: boolean;
    color: boolean;
    category: boolean;
  };
  activeFilters: {
    suitability: string[];
    size: string[];
    color: string;
    category: string;
  };
  toggleFilter: (filterName: keyof FilterSidebarProps["filtersOpen"]) => void;
  handleSuitabilityFilter: (suitability: string) => void;
  handleSizeFilter: (size: string) => void;
  handleColorFilter: (color: string) => void;
  handleCategoryFilter: (categoryId: string) => void;
  availableSuitability?: string[];
  categories: { id: number; name: string }[];
}

export default function FilterSidebar({
  filtersOpen,
  activeFilters,
  toggleFilter,
  handleSuitabilityFilter,
  handleSizeFilter,
  handleColorFilter,
  handleCategoryFilter,
  availableSuitability,
  categories,
}: FilterSidebarProps) {
  return (
    <div className="lg:w-1/4">
      <div className="sticky top-24">
        <h2 className="text-2xl font-bold mb-6">Bộ lọc</h2>

        <CategoryFilter
          isOpen={filtersOpen.category}
          activeCategory={activeFilters.category}
          onToggle={() => toggleFilter("category")}
          onFilterChange={handleCategoryFilter}
          categories={categories}
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
