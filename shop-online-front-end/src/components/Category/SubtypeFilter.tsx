import React from "react";
import { Subtype } from "@/types/category";

interface SubtypeFilterProps {
  isOpen: boolean;
  activeSubtype: string;
  onToggle: () => void;
  onFilterChange: (subtype: string) => void;
  subtypes: Subtype[];
}

export default function SubtypeFilter({
  isOpen,
  activeSubtype,
  onToggle,
  onFilterChange,
  subtypes,
}: SubtypeFilterProps) {
  // Không hiển thị gì nếu không có dữ liệu
  if (!subtypes || subtypes.length === 0) {
    return null;
  }

  // Sắp xếp subtypes theo displayName để dễ đọc
  const sortedSubtypes = [...subtypes].sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );

  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h5 className="text-lg font-medium mb-3">Nhóm sản phẩm</h5>
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
        <div className="space-y-3">
          {sortedSubtypes.map((subtype) => (
            <div
              key={subtype.id}
              className={`flex items-center cursor-pointer ${
                activeSubtype === subtype.id.toString()
                  ? "font-semibold text-blue-600"
                  : ""
              }`}
              onClick={() => onFilterChange(subtype.id.toString())}
            >
              <span
                className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                  activeSubtype === subtype.id.toString()
                    ? "border-blue-600"
                    : "border-gray-300"
                }`}
              >
                {activeSubtype === subtype.id.toString() && (
                  <span className="block w-2 h-2 bg-blue-600 rounded-sm"></span>
                )}
              </span>
              {subtype.displayName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
