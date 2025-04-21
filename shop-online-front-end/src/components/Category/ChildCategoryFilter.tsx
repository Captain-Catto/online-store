import React from "react";

interface ChildCategory {
  id: string | number;
  name: string;
  slug: string;
  parentId?: string | number;
}

interface ChildCategoryFilterProps {
  isOpen: boolean;
  activeChildCategory: string;
  childCategories: ChildCategory[];
  onToggle: () => void;
  onFilterChange: (childSlug: string) => void;
}

export default function ChildCategoryFilter({
  isOpen,
  activeChildCategory,
  onToggle,
  onFilterChange,
  childCategories,
}: ChildCategoryFilterProps) {
  // Don't render anything if there are no child categories
  if (!childCategories || childCategories.length === 0) {
    return null;
  }

  // Sort child categories by name for easier reading
  const sortedCategories = [...childCategories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h5 className="text-lg font-medium mb-3">Danh mục con</h5>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M5.95825 7.91699L10.9583 12.917L15.9583 7.91699"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="mt-3">
          <div className="space-y-2">
            <div
              className={`
                p-2 cursor-pointer rounded-md hover:bg-gray-100 
                ${activeChildCategory === "" ? "bg-gray-100 font-medium" : ""}
              `}
              onClick={() => onFilterChange("")}
            >
              Tất cả
            </div>
            {sortedCategories.map((child) => (
              <div
                key={child.id}
                className={`
                  p-2 cursor-pointer rounded-md hover:bg-gray-100 
                  ${
                    activeChildCategory === child.slug
                      ? "bg-gray-100 font-medium"
                      : ""
                  }
                `}
                onClick={() => onFilterChange(child.slug)}
              >
                {child.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
