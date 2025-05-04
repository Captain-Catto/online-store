import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "@/services/AuthClient";

export interface CategoryChild {
  id: string | number;
  name: string;
  slug: string;
  subtypeId?: string | number | null;
}

export interface CategoryNav {
  id: string | number;
  name: string;
  slug: string;
  children: CategoryChild[];
}

export interface Category {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  parentId: string | number | null;
  isActive: boolean;
  children?: Category[];
}

export const CategoryService = {
  // Lấy tất cả danh mục (Public - không cần xác thực)
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);

      if (!response.ok) {
        throw new Error("Không thể lấy danh mục");
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
      throw error;
    }
  },

  // Lấy danh mục cho navbar (PUBLIC - không cần xác thực)
  getNavCategories: async (): Promise<CategoryNav[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/nav`);
      if (!response.ok) {
        throw new Error("Không thể lấy danh mục cho navbar");
      }
      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy danh mục cho navbar:", error);
      return [];
    }
  },

  // Lấy danh mục theo slug (PUBLIC - không cần xác thực)
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/slug/${slug}`);
      if (!response.ok) {
        throw new Error("Không thể lấy thông tin danh mục");
      }
      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy danh mục theo slug:", error);
      throw error;
    }
  },

  // Lấy danh mục theo ID (Public - cần xác thực)
  getCategoryById: async (id: string | number): Promise<Category> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`);

      if (!response.ok) {
        throw new Error("Không thể lấy thông tin danh mục");
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy danh mục theo ID:", error);
      throw error;
    }
  },

  // Tạo danh mục mới (ADMIN - cần xác thực)
  createCategory: async (formData: FormData): Promise<Category> => {
    try {
      // Không thể dùng trực tiếp fetchWithAuth vì formData yêu cầu xử lý đặc biệt
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      }

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          // Không set Content-Type với FormData
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tạo danh mục");
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi tạo danh mục:", error);
      throw error;
    }
  },

  // Cập nhật danh mục (ADMIN - cần xác thực)
  updateCategory: async (
    id: string | number,
    formData: FormData
  ): Promise<Category> => {
    try {
      // Tương tự createCategory, FormData yêu cầu xử lý đặc biệt
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      }

      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể cập nhật danh mục");
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error);
      throw error;
    }
  },

  // Xóa danh mục (ADMIN - cần xác thực)
  deleteCategory: async (id: string | number): Promise<void> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể xóa danh mục");
      }
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      throw error;
    }
  },

  // Lấy sản phẩm theo slug của danh mục (PUBLIC - không cần xác thực)
  getProductsByCategorySlug: async (
    categorySlug: string,
    page: number = 1,
    limit: number = 12,
    filters: Record<string, string | number | boolean | string[]> = {}
  ) => {
    try {
      // Bắt đầu xây dựng query string
      const queryParams = new URLSearchParams();

      // Xử lý các bộ lọc đặc biệt như mảng
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Xử lý các mảng như size, suitability
            if (value.length > 0) {
              queryParams.append(key, value.join(","));
            }
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      // Thêm page và limit nếu chưa được thêm trong filters
      if (!filters.page) queryParams.append("page", page.toString());
      if (!filters.limit) queryParams.append("limit", limit.toString());

      // Tạo URL hoàn chỉnh
      const url = `${API_BASE_URL}/categories/slug/${categorySlug}/products?${queryParams.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
      throw error;
    }
  },

  // Thay đổi trạng thái danh mục (ADMIN - cần xác thực)
  updateCategoryStatus: async (
    id: string | number,
    isActive: boolean
  ): Promise<Category> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/categories/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Không thể cập nhật trạng thái danh mục"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái danh mục:", error);
      throw error;
    }
  },

  // lấy danh sách danh mục con theo id danh mục cha (ADMIN - cần xác thực)
  getChildCategories: async (
    parentId: string | number
  ): Promise<Category[]> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/categories/${parentId}/subcategories`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách danh mục con");
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục con:", error);
      throw error;
    }
  },
};
