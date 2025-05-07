import React from "react";

interface SizeFilterProps {
  isOpen: boolean;
  activeFilters: string[]; // Mảng string chứa các giá trị đã chọn
  onToggle: () => void;
  onFilterChange: (size: string) => void;
  availableSizes?: string[];
}

export default function SizeFilter({
  isOpen,
  activeFilters,
  onToggle,
  onFilterChange,
  availableSizes = [],
}: SizeFilterProps) {
  // Sử dụng availableSizes từ props thay vì hardcode
  const sizes =
    availableSizes.length > 0
      ? availableSizes
      : ["XS", "S", "M", "L", "XL", "XXL"]; // Fallback nếu không có kích thước

  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h5 className="text-lg font-medium mb-3">Kích cỡ</h5>
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
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.7983 6.85156C16.193 7.27249 16.193 7.92751 15.7983 8.34844L10.5 14L5.20166 8.34844C4.80704 7.92751 4.80704 7.27249 5.20166 6.85156C5.63399 6.39041 6.36601 6.39041 6.79834 6.85156L10.5 10.8L14.2017 6.85156C14.634 6.39041 15.366 6.39041 15.7983 6.85156Z"
            fill="#A3A3A3"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="mt-3">
          {sizes.length > 0 ? (
            <div className="mb-3">
              <ul className="grid grid-cols-4 gap-2">
                {sizes.map((size) => (
                  <li key={size} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`size_${size}`}
                      name="size"
                      checked={activeFilters.includes(size)}
                      onChange={() => onFilterChange(size)}
                      className="hidden"
                    />
                    <label
                      htmlFor={`size_${size}`}
                      className={`inline-block px-3 py-2 rounded-lg border flex-1 text-center ${
                        activeFilters.includes(size)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-gray-100 border-gray-300"
                      } cursor-pointer text-sm`}
                      title={size}
                    >
                      {size}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Không có kích thước nào để hiển thị.</p>
          )}
        </div>
      )}
    </div>
  );
}
