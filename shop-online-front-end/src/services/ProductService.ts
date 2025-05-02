import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "@/services/AuthClient";

export interface ProductDetail {
  id?: number;
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
  subtypeId?: number | null;
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

      const response = await fetch(
        `${API_BASE_URL}/products?${params.toString()}`
      );
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
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
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

      const response = await fetch(`${API_BASE_URL}/products`, {
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
        `${API_BASE_URL}/product-images/${productDetailId}`,
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

  // Xóa sản phẩm
  deleteProduct: async (id: string) => {
    try {
      // lấy token từ sessionStorage
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("Token không hợp lệ hoặc đã hết hạn.");
      }
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      const url = `${API_BASE_URL}/products/category/${categoryId}${
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
      const response = await fetch(`${API_BASE_URL}/suitabilities`);
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
      const response = await fetch(`${API_BASE_URL}/products/variants/${id}`);
      if (!response.ok)
        throw new Error(`Failed to fetch product variants: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product variants for ID ${id}:`, error);
      throw error;
    }
  },

  // Tạo sản phẩm mới kết hợp với upload ảnh
  createProductWithImages: async (
    product: ProductCreate,
    imageFiles: File[],
    imageColorMapping: Record<number, string>,
    imageMainMapping: Record<number, boolean>
  ) => {
    // lấy token từ sessionStorage
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn.");
    }

    try {
      // Tạo FormData để gửi multipart/form-data
      const formData = new FormData();

      // Thêm thông tin cơ bản của sản phẩm
      formData.append("name", product.name);
      formData.append("sku", product.sku);
      formData.append("description", product.description);
      formData.append("brand", product.brand);
      formData.append("material", product.material);
      formData.append("featured", product.featured.toString());
      formData.append("status", product.status);
      formData.append("tags", JSON.stringify(product.tags));
      formData.append("suitability", JSON.stringify(product.suitability));
      formData.append("categories", JSON.stringify(product.categories));
      // Thêm chi tiết sản phẩm (details - các biến thể màu sắc)
      formData.append("details", JSON.stringify(product.details));
      formData.append("imageIsMain", JSON.stringify(imageMainMapping));
      formData.append("imageColors", JSON.stringify(imageColorMapping));
      // Duyệt qua các màu và thêm từng file ảnh
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
      if (product.subtypeId !== null && product.subtypeId !== undefined) {
        formData.append("subtypeId", product.subtypeId.toString());
      }

      // Gửi request đến API
      const response = await fetch(`${API_BASE_URL}/products/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        throw new Error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi tạo sản phẩm");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating product with images:", error);
      throw error;
    }
  },

  // Thêm vào ProductService
  updateProductBasicInfo: async (
    productId: string | number,
    data: Partial<ProductCreate>
  ) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token không hợp lệ");

    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/basic-info`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi cập nhật thông tin sản phẩm: ${errorText}`);
    }

    return await response.json();
  },

  updateProductInventory: async (
    productId: string | number,
    details: ProductDetail[]
  ) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token không hợp lệ");

    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/inventory`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ details }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi cập nhật tồn kho: ${errorText}`);
    }

    return await response.json();
  },

  addProductImages: async (
    productId: string | number,
    images: Array<{ file: File; color: string; isMain: boolean }>
  ) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token không hợp lệ");

    const formData = new FormData();

    // Thêm ảnh và metadata
    images.forEach((img) => {
      formData.append("images", img.file);
    });

    // Thêm thông tin màu sắc và ảnh chính
    const imageColors: Record<number, string> = {};
    const imageIsMain: Record<number, boolean> = {};

    images.forEach((img, index) => {
      imageColors[index] = img.color;
      imageIsMain[index] = img.isMain;
    });

    formData.append("imageColors", JSON.stringify(imageColors));
    formData.append("imageIsMain", JSON.stringify(imageIsMain));

    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi khi thêm hình ảnh: ${errorText}`);
    }

    return await response.json();
  },

  removeProductImages: async (
    productId: string | number,
    imageIds: number[]
  ) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token không hợp lệ");

    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/images`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageIds }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi khi xóa hình ảnh: ${errorText}`);
    }

    return await response.json();
  },

  setMainProductImage: async (productId: string | number, imageId: number) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token không hợp lệ");

    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/images/${imageId}/main`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi khi đặt ảnh chính: ${errorText}`);
    }

    return await response.json();
  },

  // Thêm vào ProductService.ts
  updateProductVariants: async (
    productId: string | number,
    variants: ProductDetail[]
  ) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token không hợp lệ");

    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/variants`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ variants }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi cập nhật biến thể: ${errorText}`);
    }

    return await response.json();
  },

  // Thêm phương thức mới để lấy sản phẩm theo slug
  // Trong src/services/CategoryService.ts
  getProductsByCategorySlug: async (
    categorySlug: string,
    page: number = 1,
    limit: number = 12,
    filters: Record<string, string | number | boolean | string[]> = {}
  ) => {
    try {
      const queryParams = new URLSearchParams();

      // Đảm bảo rằng mọi filter được truyền đúng
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              queryParams.append(key, value.join(","));
            }
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      // Thêm page và limit
      if (!filters.page) queryParams.append("page", page.toString());
      if (!filters.limit) queryParams.append("limit", limit.toString());

      // Log để kiểm tra URL
      console.log(
        `API URL: ${API_BASE_URL}/categories/slug/${categorySlug}/products?${queryParams.toString()}`
      );

      const response = await fetch(
        `${API_BASE_URL}/categories/slug/${categorySlug}/products?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
      throw error;
    }
  },

  // Lấy tất cả kích thước
  getSizes: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/sizes`);
      if (!response.ok) {
        throw new Error("Không thể lấy danh sách kích thước");
      }
      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy kích thước:", error);
      return [];
    }
  },

  // Thêm kích thước mới (Admin)
  createSize: async (sizeData: {
    value: string;
    displayName?: string;
    category?: string;
    sizeType?: string;
    displayOrder?: number;
  }): Promise<any> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/products/sizes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sizeData),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tạo kích thước");
      }
      return await response.json();
    } catch (error) {
      console.error("Lỗi khi tạo kích thước:", error);
      throw error;
    }
  },

  // Cập nhật kích thước (Admin)
  updateSize: async (
    id: number,
    sizeData: {
      value?: string;
      displayName?: string;
      category?: string;
      displayOrder?: number;
      active?: boolean;
    }
  ): Promise<any> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/products/sizes/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sizeData),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật kích thước");
      }
      return await response.json();
    } catch (error) {
      console.error("Lỗi khi cập nhật kích thước:", error);
      throw error;
    }
  },

  // Xóa kích thước (Admin)
  deleteSize: async (id: number): Promise<void> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/products/sizes/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa kích thước");
      }
    } catch (error) {
      console.error("Lỗi khi xóa kích thước:", error);
      throw error;
    }
  },
};
