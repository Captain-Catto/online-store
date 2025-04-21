import React from "react";

interface MainCategoryFilterProps {
  isOpen: boolean;
  activeCategory?: number;
  onToggle: () => void;
  onFilterChange: (slug: string) => void;
  categories: Array<{
    id: string | number;
    name: string;
    slug: string;
  }>;
}

export default function MainCategoryFilter({
  isOpen,
  activeCategory,
  onToggle,
  onFilterChange,
  categories,
}: MainCategoryFilterProps) {
  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h5 className="text-lg font-medium mb-3">Danh mục chính</h5>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
          className={`transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        >
          <path
            d="M5.5 7.5L10.5 12.5L15.5 7.5"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && categories && categories.length > 0 && (
        <div className="pl-2 space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <button
                onClick={() => onFilterChange(category.slug)}
                className={`text-sm hover:text-pink-500 transition ${
                  activeCategory === category.id ? "font-bold" : ""
                }`}
              >
                {category.name}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
