const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      }).toString();

      const response = await fetch(`${API_URL}/products?${queryParams}`);
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
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error creating product:", error);
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

  // Upload ảnh sản phẩm
  uploadProductImages: async (productDetailId: string, images: FormData) => {
    try {
      const response = await fetch(
        `${API_URL}/product-images/${productDetailId}`,
        {
          method: "POST",
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

  getProductsByCategory: async (categoryId: string | number) => {
    try {
      const response = await fetch(
        `${API_URL}/products/category/${categoryId}`
      );
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
};
