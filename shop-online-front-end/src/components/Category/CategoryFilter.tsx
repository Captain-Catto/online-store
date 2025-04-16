import React from "react";

interface CategoryFilterProps {
  isOpen: boolean;
  activeCategory: string;
  onToggle: () => void;
  onFilterChange: (categoryId: string) => void;
  categories: { id: number; name: string }[];
}

export default function CategoryFilter({
  isOpen,
  activeCategory,
  onToggle,
  onFilterChange,
  categories = [],
}: CategoryFilterProps) {
  console.log("categories nhận về", categories);
  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h5 className="text-lg font-medium mb-3">Danh mục</h5>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            d="M6.06598 8.11401L10.166 12.114L14.266 8.11401"
            stroke="#33363F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="mt-2 pl-2 space-y-2">
          {categories.map((category, index) => {
            // Skip rendering if category or category.id is undefined
            if (!category || category.id === undefined) return null;

            return (
              <div
                key={category.id || index}
                className={`flex items-center cursor-pointer ${
                  activeCategory === category.id.toString()
                    ? "font-semibold text-blue-600"
                    : ""
                }`}
                onClick={() => onFilterChange(category.id.toString())}
              >
                <span
                  className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                    activeCategory === category.id.toString()
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {activeCategory === category.id.toString() && (
                    <span className="block w-2 h-2 bg-blue-600 rounded-sm"></span>
                  )}
                </span>
                {category.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
