import { suitabilities } from "@/app/categories/types";

interface SuitabilityFilterProps {
  isOpen: boolean;
  activeFilters: string[]; // Mảng các giá trị đã chọn
  onToggle: () => void;
  onFilterChange: (value: string) => void;
  availableSuitability?: string[];
}

export default function SuitabilityFilter({
  isOpen,
  activeFilters,
  onToggle,
  onFilterChange,
  availableSuitability = [],
}: SuitabilityFilterProps) {
  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h5 className="text-lg font-medium mb-3">Phù hợp với</h5>
        {/* Icon toggle */}
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
        <div className="mt-3 space-y-2">
          {suitabilities
            .filter(({ value }) => availableSuitability.includes(value))
            .map(({ label, value }) => (
              <div key={value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`suitability-${value}`}
                  checked={activeFilters.includes(value)}
                  onChange={() => onFilterChange(value)}
                  className="w-4 h-4"
                />
                <label
                  htmlFor={`suitability-${value}`}
                  className="cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
