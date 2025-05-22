import React, { useRef, useEffect } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import SearchProductCard from "./SearchProductCard";
import { Product } from "@/types/product";
import { Category } from "@/types/category";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (query: string) => void;
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  query,
  setQuery,
  products,
  categories,
  loading,
  error,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus input khi modal mở
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Đóng modal khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Đóng modal khi nhấn ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200] flex items-start justify-center pt-10">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto z-[200]"
      >
        {/* Thanh tìm kiếm */}
        <div className="p-4 border-b flex items-center">
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <svg
              className="w-5 h-5 text-gray-500 mr-2"
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
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full bg-transparent outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            className="ml-4 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Danh mục nhanh */}
        <div className="p-4 border-b">
          <h5 className="text-sm text-gray-500 mb-3">Danh mục phổ biến</h5>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-800 transition-colors border border-gray-200"
                onClick={onClose}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Kết quả sản phẩm */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner size="lg" text="Đang tìm kiếm..." />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <SearchProductCard
                    key={product.id}
                    product={product}
                    onClick={onClose}
                  />
                ))}
              </div>
              <div className="text-center mt-6">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={onClose}
                >
                  Xem tất cả
                </Link>
              </div>
            </>
          ) : query.length > 1 ? (
            <div className="text-center py-10 text-gray-500">
              Không tìm thấy sản phẩm nào phù hợp
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Vui lòng nhập từ khóa để tìm kiếm
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
