import React, { useState, useCallback, useRef, useEffect } from "react";
import { Range } from "react-range";
import { formatNumberWithCommas } from "@/utils/currencyUtils";

interface PriceFilterProps {
  isOpen: boolean;
  onToggle: () => void;
  onFilterChange: (minPrice: string, maxPrice: string) => void; // Giữ nguyên string
  priceRange: { min: number; max: number };
  activeRange: { min: number; max: number };
}

export default function PriceFilter({
  isOpen,
  onToggle,
  onFilterChange,
  priceRange,
  activeRange,
}: PriceFilterProps) {
  // Sử dụng priceRange từ API thay vì hardcode
  const MIN_PRICE = priceRange.min || 0;
  const MAX_PRICE = priceRange.max || 1000000;

  // Khởi tạo values từ activeRange
  const [values, setValues] = useState([
    activeRange.min > 0 ? activeRange.min : MIN_PRICE,
    activeRange.max > 0 ? activeRange.max : MAX_PRICE,
  ]);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Cập nhật values khi activeRange thay đổi từ bên ngoài
  useEffect(() => {
    if (activeRange.min > 0 || activeRange.max > 0) {
      setValues([
        activeRange.min > 0 ? activeRange.min : MIN_PRICE,
        activeRange.max > 0 ? activeRange.max : MAX_PRICE,
      ]);
    }
  }, [activeRange, MIN_PRICE, MAX_PRICE]);

  // Handle slider change (immediate UI update)
  const handleChange = useCallback((newValues: number[]) => {
    setValues(newValues);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  // Handle final value change (when user stops dragging)
  const handleFinalChange = useCallback(
    (newValues: number[]) => {
      // Clear any pending timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // API call after 300ms when dragging stops
      debounceTimer.current = setTimeout(() => {
        // Chuyển đổi number sang string để khớp với interface
        onFilterChange(newValues[0].toString(), newValues[1].toString());
      }, 300);
    },
    [onFilterChange]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Không render nếu priceRange chưa được load
  if (MAX_PRICE === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h5 className="text-lg font-semibold text-gray-800">Giá</h5>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.06598 8.11401L10.166 12.114L14.266 8.11401"
            stroke="#33363F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-6">
          {/* Range Slider */}
          <div className="px-2">
            <Range
              step={10000} // Tăng step để dễ sử dụng hơn
              min={MIN_PRICE}
              max={MAX_PRICE}
              values={values}
              onChange={handleChange}
              onFinalChange={handleFinalChange}
              renderTrack={({ props, children }) => {
                // Tính toán vị trí phần trăm cho thanh xanh
                const minPercent =
                  ((values[0] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
                const maxPercent =
                  ((values[1] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

                return (
                  <div
                    {...props}
                    style={{ ...props.style }}
                    className="w-full h-1 bg-gray-200 rounded-full relative"
                  >
                    <div
                      className="absolute h-full bg-blue-600 rounded-full"
                      style={{
                        left: `${minPercent}%`,
                        width: `${maxPercent - minPercent}%`,
                      }}
                    />
                    {children}
                  </div>
                );
              }}
              renderThumb={({ props, index }) => (
                <div
                  {...props}
                  key={index}
                  style={{ ...props.style }}
                  className="w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              )}
            />
          </div>

          {/* Price Display */}
          <div className="flex justify-between">
            <div className="px-2 py-1 bg-blue-50 rounded text-sm font-medium text-blue-600">
              {formatNumberWithCommas(values[0])} đ
            </div>
            <div className="px-2 py-1 bg-blue-50 rounded text-sm font-medium text-blue-600">
              {formatNumberWithCommas(values[1])} đ
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
