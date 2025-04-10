export default function SuitabilityFilter({
  isOpen,
  activeFilters,
  onToggle,
  onFilterChange,
  availableSuitability = [],
}: {
  isOpen: boolean;
  activeFilters: string[];
  onToggle: () => void;
  onFilterChange: (value: string) => void;
  availableSuitability?: string[];
}) {
  // Format data for display - chuyển đổi từ dữ liệu được truyền vào
  const suitabilities = availableSuitability.map((item) => ({
    label: item.charAt(0).toUpperCase() + item.slice(1),
    value: item,
  }));

  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h5 className="text-lg font-medium mb-3">Phù hợp với</h5>
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
          {suitabilities.length === 0 ? (
            <div className="py-2 text-center text-sm text-gray-500">
              Không có dữ liệu
            </div>
          ) : (
            suitabilities.map(({ label, value }) => (
              <div key={value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`suitability-${value}`}
                  checked={activeFilters.includes(value)}
                  onChange={() => onFilterChange(value)}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label
                  htmlFor={`suitability-${value}`}
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
