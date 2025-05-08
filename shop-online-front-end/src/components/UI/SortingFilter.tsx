import React from "react";

interface SortingFilterProps {
  sortOption: string;
  onChange: (option: string) => void;
  className?: string;
  label?: string;
}

const SortingFilter: React.FC<SortingFilterProps> = ({
  sortOption,
  onChange,
  className = "",
  label = "Sắp xếp theo",
}) => {
  const options = [
    { value: "", label: "Mặc định" },
    { value: "price_asc", label: "Giá thấp đến cao" },
    { value: "price_desc", label: "Giá cao đến thấp" },
    { value: "featured_desc", label: "Đáng mua" },
    { value: "createdAt_desc", label: "Mới nhất" },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-sm text-gray-700">{label}:</span>}
      <select
        value={sortOption}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-3 py-1.5 bg-white text-sm focus:outline-none cursor-pointer"
        aria-label="Sắp xếp sản phẩm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortingFilter;
