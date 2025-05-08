"use client";

import React, { useRef } from "react";
import { useSearch } from "@/hooks/useSearch";
import SearchModal from "./SearchModal";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  showButton?: boolean;
  buttonText?: string;
  size?: "sm" | "md" | "lg";
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Tìm kiếm...",
  className = "",
  showButton = false,
  size = "md",
}) => {
  const {
    query,
    setQuery,
    products,
    categories,
    loading,
    isOpen,
    error,
    openSearchModal,
    closeSearchModal,
  } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);

  // Các lớp CSS dựa trên kích thước
  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10 text-base",
    lg: "h-12 text-lg",
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim() !== "") {
      openSearchModal();
    }
  };

  // Kích hoạt modal khi click vào biểu tượng hoặc nút tìm kiếm
  const handleSearchClick = () => {
    openSearchModal();
    // Focus vào input nếu cần
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      <div className={`flex items-center ${className}`}>
        {/* Ẩn input trên màn hình nhỏ, hiển thị từ md trở lên */}
        <div
          className={`relative hidden md:block md:flex-grow md:w-48 lg:w-64 xl:w-80  ${
            showButton ? "rounded-r-none" : "rounded-full"
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={openSearchModal}
            className={`w-full px-4 pr-10 border border-gray-300 rounded-full ${
              showButton ? "rounded-r-none" : ""
            } ${
              sizeClasses[size]
            } focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
          />
          {!showButton && (
            <div
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={handleSearchClick}
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Button luôn hiển thị, nhưng style khác nhau trên mobile và desktop */}
        <button
          className={`bg-black text-white ${
            sizeClasses[size]
          } flex items-center justify-center
            ${
              showButton
                ? // Style khi showButton=true
                  "md:rounded-r-full md:rounded-l-none rounded-full px-3"
                : // Style khi showButton=false (chỉ hiển thị trên mobile)
                  "rounded-full p-3 md:hidden"
            } 
            hover:bg-gray-800 transition-colors`}
          onClick={handleSearchClick}
          aria-label="Tìm kiếm"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isOpen}
        onClose={closeSearchModal}
        query={query}
        setQuery={setQuery}
        products={products}
        categories={categories}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default SearchInput;
