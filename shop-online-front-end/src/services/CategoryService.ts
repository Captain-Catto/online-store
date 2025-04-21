import { API_BASE_URL } from "@/config/apiConfig";

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

export const CategoryService = {
  // Lấy tất cả danh mục
  getAllCategories: async () => {
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

  // Lấy danh mục cho navbar
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

  // Lấy danh mục theo slug
  getCategoryBySlug: async (slug: string) => {
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

  // Lấy sản phẩm theo slug của danh mục
  async getProductsByCategorySlug(
    categorySlug: string,
    page: number = 1,
    limit: number = 12,
    filters: Record<string, string> = {}
  ) {
    try {
      // Bắt đầu xây dựng query string
      const queryParams = new URLSearchParams();

      // Thêm tất cả các filter vào query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
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
};
