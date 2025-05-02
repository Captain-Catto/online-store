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
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M5.5 7.5L10.5 12.5L15.5 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && categories && categories.length > 0 && (
        <div className="mt-3">
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`
                  p-2 cursor-pointer rounded-md hover:bg-gray-100
                  ${
                    activeCategory === Number(category.id)
                      ? "bg-gray-100 font-medium"
                      : ""
                  }
                `}
                onClick={() => onFilterChange(category.slug)}
              >
                {category.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
