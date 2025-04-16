const API_URL = "http://localhost:3000/api";

export interface ProductDetail {
  color: string;
  price: number;
  originalPrice: number;
  sizes: Array<{
    size: string;
    stock: number;
  }>;
}

export interface ProductCreate {
  name: string;
  sku: string;
  description: string;
  brand: string;
  material: string;
  featured: boolean;
  status: string;
  tags: string[];
  suitability: string[];
  categories: number[];
  details: ProductDetail[];
}

export const ProductService = {
  // Lấy danh sách sản phẩm có phân trang và filter
  getProducts: async (page = 1, limit = 10, filters = {}) => {
    try {
      console.log("Fetching products with filters:", filters);
      // Tạo đối tượng URLSearchParams cho query parameters
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      // Xử lý các options.filters nếu có
      if (filters) {
        // Trích xuất và thêm từng thuộc tính trong filters
        Object.entries(filters).forEach(([key, value]) => {
          // Xử lý các giá trị đơn giản (string, number, boolean)
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            params.append(key, value.toString());
          }
        });
      }

      console.log("Query Params:", params.toString());

      const response = await fetch(`${API_URL}/products?${params.toString()}`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Lấy chi tiết một sản phẩm
  getProductById: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error fetching product details:", error);
      throw error;
    }
  },

  // Tạo sản phẩm mới
  createProduct: async (product: ProductCreate) => {
    // lấy token từ sessionStorage
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn.");
    }

    try {
      console.log("Sending product data with credentials included");

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
        body: JSON.stringify(product),
      });

      if (response.status === 401) {
        // Xử lý cụ thể cho lỗi xác thực
        console.error("Authentication failed: 401 Unauthorized");
        throw new Error(
          "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(
          `Lỗi tạo sản phẩm: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  // Upload ảnh sản phẩm
  uploadProductImages: async (productDetailId: string, images: FormData) => {
    // lấy token từ sessionStorage
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn.");
    }

    try {
      const response = await fetch(
        `${API_URL}/product-images/${productDetailId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: images,
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error uploading product images:", error);
      throw error;
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (id: string, product: Partial<ProductCreate>) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  getProductsByCategory: async (categoryId: string | number, filters = {}) => {
    try {
      // Tạo query params từ object filters
      const queryParams = new URLSearchParams({
        ...filters,
      }).toString();

      // Nối query params vào URL nếu có
      const url = `${API_URL}/products/category/${categoryId}${
        queryParams ? `?${queryParams}` : ""
      }`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error(
        `Error fetching products for category ${categoryId}:`,
        error
      );
      throw error;
    }
  },

  //lấy thông tin suitabilities
  getSuitabilities: async () => {
    try {
      const response = await fetch(`${API_URL}/suitabilities`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error fetching suitabilities:", error);
      throw error;
    }
  },

  // layá thông tin các biến thể của sản phẩm theo id product
  getProductVariants: async (id: string | number) => {
    try {
      const response = await fetch(`${API_URL}/products/variants/${id}`);
      if (!response.ok)
        throw new Error(`Failed to fetch product variants: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product variants for ID ${id}:`, error);
      throw error;
    }
  },
};
