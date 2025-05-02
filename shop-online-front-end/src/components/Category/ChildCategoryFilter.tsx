export default function ChildCategoryFilter({
  isOpen,
  activeChildCategory,
  onToggle,
  onFilterChange,
  childCategories,
}: ChildCategoryFilterProps) {
  if (!childCategories || childCategories.length === 0) {
    return null;
  }

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
            d="M5.5 7.5L10.5 12.5L15.5 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && childCategories && childCategories.length > 0 && (
        <div className="mt-3">
          <div className="space-y-2">
            <div
              className={`p-2 cursor-pointer rounded-md hover:bg-gray-100 ${
                activeChildCategory === "" ? "bg-gray-100 font-medium" : ""
              }`}
              onClick={() => onFilterChange("")}
            >
              Tất cả
            </div>

            {childCategories.map((category) => (
              <div
                key={category.id}
                className={`p-2 cursor-pointer rounded-md hover:bg-gray-100 ${
                  activeChildCategory === category.slug
                    ? "bg-gray-100 font-medium"
                    : ""
                }`}
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
