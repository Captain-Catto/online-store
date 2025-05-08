import { useState, useEffect } from "react";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";

export function useSearch() {
  const [query, setQuery] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Tìm kiếm sản phẩm khi query thay đổi (với debounce)
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setProducts([]);
      return;
    }

    const timer = setTimeout(() => {
      searchProducts();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [query]);

  // Tải danh mục khi mở modal
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      loadCategories();
    }
  }, [isOpen]);

  // Hàm tải danh mục
  const loadCategories = async () => {
    try {
      const data = await CategoryService.getNavCategories();
      setCategories(data);
    } catch (error) {
      console.error("Không thể tải danh mục:", error);
    }
  };

  // Hàm tìm kiếm sản phẩm
  const searchProducts = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.getProducts(1, 8, {
        search: query,
      });
      setProducts(response.products || []);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      setError("Không thể tìm kiếm sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Mở modal
  const openSearchModal = () => {
    setIsOpen(true);
  };

  // Đóng modal
  const closeSearchModal = () => {
    setIsOpen(false);
    setQuery("");
    setProducts([]);
  };

  return {
    query,
    setQuery,
    products,
    categories,
    loading,
    isOpen,
    error,
    openSearchModal,
    closeSearchModal,
  };
}
