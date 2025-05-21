import React from "react";
import { colorToVietnamese } from "@/utils/colorUtils";

interface ColorFilterProps {
  isOpen: boolean;
  activeFilter: string;
  onToggle: () => void;
  onFilterChange: (color: string) => void;
}

export default function ColorFilter({
  isOpen,
  activeFilter,
  onToggle,
  onFilterChange,
}: ColorFilterProps) {
  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    blue: "#0066CC",
    red: "#FF0000",
    green: "#008000",
    yellow: "#FFFF00",
    purple: "#800080",
    gray: "#808080",
    pink: "#FFC0CB",
  };

  // Hàm xử lý khi click vào màu - thêm logic để hủy chọn
  const handleColorClick = (colorId: string) => {
    // Nếu màu đã được chọn, gọi hàm với chuỗi rỗng để hủy chọn
    if (activeFilter === colorId) {
      onFilterChange("");
    } else {
      // Nếu chưa chọn, chọn màu đó
      onFilterChange(colorId);
    }
  };

  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h5 className="text-lg font-medium mb-3">Màu sắc</h5>
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
        <div className="mt-3 grid grid-cols-4 gap-2">
          {Object.entries(colorMap).map(([colorId, colorCode]) => (
            <div key={colorId} className="flex flex-col items-center">
              <div
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleColorClick(colorId)}
              >
                <div
                  className={`w-8 h-8 rounded-full border ${
                    activeFilter === colorId
                      ? "border-2 border-blue-600"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: colorCode }}
                ></div>
                <span
                  className={`mt-1 text-xs capitalize ${
                    activeFilter === colorId ? "text-blue-600 font-medium" : ""
                  }`}
                >
                  {colorToVietnamese[colorId] || colorId}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
