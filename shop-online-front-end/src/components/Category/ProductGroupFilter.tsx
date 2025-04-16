import React from "react";
import { CategoryWithSubtypes } from "@/types/category";

interface ProductGroupFilterProps {
  isOpen: boolean;
  activeSubtype: string;
  onToggle: () => void;
  onFilterChange: (subtype: string) => void;
  productGroups: CategoryWithSubtypes[];
}

export default function ProductGroupFilter({
  isOpen,
  activeSubtype,
  onToggle,
  onFilterChange,
  productGroups,
}: ProductGroupFilterProps) {
  return (
    <div className="mb-6">
      <button
        className="flex justify-between items-center w-full text-xl font-semibold py-2"
        onClick={onToggle}
      >
        <span>Nhóm sản phẩm</span>
        <span className="transform transition-transform duration-200">
          {isOpen ? "▾" : "▸"}
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 pl-2">
          {productGroups.map((group) => (
            <div key={group.id} className="mb-3">
              <h3 className="font-medium mb-2">{group.name}</h3>
              <ul className="space-y-2">
                {group.subtypes.map((subtype) => (
                  <li key={subtype.id} className="flex items-center">
                    <button
                      className={`flex items-center text-left w-full hover:text-blue-600 ${
                        activeSubtype === subtype.id.toString()
                          ? "font-medium text-blue-600"
                          : ""
                      }`}
                      onClick={() => onFilterChange(subtype.id.toString())}
                    >
                      <span
                        className={`w-4 h-4 mr-2 border rounded ${
                          activeSubtype === subtype.id.toString()
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-400"
                        }`}
                      >
                        {activeSubtype === subtype.id.toString() && (
                          <span className="flex items-center justify-center text-white text-xs">
                            ✓
                          </span>
                        )}
                      </span>
                      {subtype.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
