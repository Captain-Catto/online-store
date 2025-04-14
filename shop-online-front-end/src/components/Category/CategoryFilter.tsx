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
        <div className="space-y-2">
          <div
            className={`flex items-center cursor-pointer ${
              activeCategory === "" ? "font-semibold" : ""
            }`}
            onClick={() => onFilterChange("")}
          >
            <span className="w-4 h-4 inline-block border border-gray-400 rounded mr-2 flex-shrink-0">
              {activeCategory === "" && (
                <span className="block w-full h-full bg-black rounded-sm"></span>
              )}
            </span>
            <span>Tất cả</span>
          </div>

          {categories.map((category) => (
            <div
              key={category.id}
              className={`flex items-center cursor-pointer ${
                activeCategory === category.id.toString() ? "font-semibold" : ""
              }`}
              onClick={() => onFilterChange(category.id.toString())}
            >
              <span className="w-4 h-4 inline-block border border-gray-400 rounded mr-2 flex-shrink-0">
                {activeCategory === category.id.toString() && (
                  <span className="block w-full h-full bg-black rounded-sm"></span>
                )}
              </span>
              <span>{category.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
