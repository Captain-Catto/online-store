import { useState, useEffect, useCallback } from "react";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { Product } from "@/types/product";
import { Category } from "@/types/category";

export function useSearch() {
  const [query, setQuery] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm tìm kiếm sản phẩm
  const searchProducts = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.getProducts(1, 8, {
        search: query,
      });
      setProducts(response.products || []);
      console.log("Kết quả tìm kiếm:", response.products);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      setError("Không thể tìm kiếm sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [query]);

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
  }, [query, searchProducts]);

  // Tải danh mục khi mở modal
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      loadCategories();
    }
  }, [isOpen, categories.length]);

  // Hàm tải danh mục
  const loadCategories = async () => {
    try {
      const data = await CategoryService.getAllCategories();
      console.log("Danh mục:", data);
      setCategories(data);
    } catch (error) {
      console.error("Không thể tải danh mục:", error);
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
