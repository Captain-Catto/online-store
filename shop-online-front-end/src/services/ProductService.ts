import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "@/services/AuthClient";

// Import type FormattedProduct từ components/admin/products/types
import {
  FormattedProduct,
  ProductDetailType,
} from "@/components/admin/products/types";

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
  suitability: Array<number>;
  categories: number[];
  details: ProductDetail[];
  subtypeId?: number | null;
}

// Interface for size operations
export interface SizeCreate {
  value: string;
  displayName: string;
  categoryId: string | number;
  displayOrder: number;
}

export interface SizeUpdate {
  value: string;
  displayName: string;
  category: string | number;
  displayOrder: number;
  active: boolean;
}

export const ProductService = {
  // Lấy danh sách sản phẩm có phân trang và filter
  getProducts: async (page = 1, limit = 10, filters = {}) => {
    try {
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
      const response = await fetch(
        `${API_BASE_URL}/products?${params.toString()}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error("Network response was not ok");
      return {
        products: data.products || [],
        pagination: {
          currentPage: data.pagination?.currentPage || page,
          totalPages: data.pagination?.totalPages || 1,
          total: data.pagination?.total || 0,
          perPage: data.pagination?.limit || limit,
        },
      };
    } catch (error) {
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
        throw new Error(
          "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Lỗi tạo sản phẩm: ${response.status} ${response.statusText}`
        );
      } // Parse and log the response
      const responseData = await response.json();

      // The backend returns productId instead of id, so normalize it here
      if (!responseData.id && responseData.productId) {
        responseData.id = responseData.productId;
      }

      // Additional fallback checks
      if (!responseData.id) {
        // Look for ID in other fields
        const possibleProduct = responseData.product || {};
        const productId =
          responseData.id ||
          responseData.productId ||
          possibleProduct.id ||
          possibleProduct.productId;

        if (productId) {
          responseData.id = productId;
        }
      }

      return responseData;
    } catch (error) {
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
      throw error;
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (id: string) => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) throw new Error("Token không hợp lệ hoặc đã hết hạn.");
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        let errorMsg = "Có lỗi khi xóa sản phẩm.";
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch {}
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("An unknown error occurred");
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
      throw error;
    }
  },

  // lấy thông tin các biến thể của sản phẩm theo id product
  getProductVariants: async (id: string | number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/variants/${id}`);
      if (!response.ok)
        throw new Error(`Failed to fetch product variants: ${response.status}`);
      return await response.json();
    } catch (error) {
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
      } // Gửi request đến API
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

      // Parse and log the response
      const responseData = await response.json();

      // The backend returns productId instead of id, so normalize it here
      if (!responseData.id && responseData.productId) {
        responseData.id = responseData.productId;
      }

      // Additional fallback checks
      if (!responseData.id) {
        // Look for ID in other fields
        const possibleProduct = responseData.product || {};
        const productId =
          responseData.id ||
          responseData.productId ||
          possibleProduct.id ||
          possibleProduct.productId;

        if (productId) {
          responseData.id = productId;
        }
      }

      return responseData;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin cơ bản của sản phẩm
  updateProductBasicInfo: async (
    productId: string | number,
    data: Partial<ProductCreate>
  ) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token không hợp lệ");

    try {
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
        let errorMsg = "Có lỗi xảy ra khi cập nhật sản phẩm.";
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch {}
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("An unknown error occurred");
    }
  },

  // Cập nhật tồn kho sản phẩm
  updateProductInventory: async (
    productId: string | number,
    details: ProductDetail[]
  ) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token không hợp lệ");
    try {
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
        let errorMsg = "Có lỗi khi cập nhật tồn kho.";
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch {}
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("An unknown error occurred");
    }
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
    // Validate inputs
    if (!imageIds || imageIds.length === 0) {
      return { message: "No images to delete", removedCount: 0 };
    }

    // Filter out any non-numeric or invalid IDs
    const validImageIds = imageIds.filter(
      (id) => typeof id === "number" && id > 0
    );

    if (validImageIds.length === 0) {
      console.warn("No valid image IDs in the provided array");
      return { message: "No valid images to delete", removedCount: 0 };
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token không hợp lệ");
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/images`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageIds: validImageIds }), // Use filtered valid IDs
        }
      );

      if (!response.ok) {
        let errorMsg = `Lỗi khi xóa hình ảnh: ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMsg = errorData.message;
          }
        } catch {
          const errorText = await response.text();
          errorMsg = `Lỗi khi xóa hình ảnh: ${errorText}`;
        }

        throw new Error(errorMsg);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },
  setMainProductImage: async (productId: string | number, imageId: number) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token không hợp lệ");

    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/images/${imageId}/main`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.");
      }

      if (!response.ok) {
        let errorMsg = `Lỗi khi đặt ảnh chính: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch {
          const errorText = await response.text();
          errorMsg = `Lỗi khi đặt ảnh chính: ${
            errorText || response.statusText
          }`;
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },
  // Lấy danh sách kích thước
  getSizes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/sizes`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Lấy kích thước theo danh mục sản phẩm
  getSizesByCategory: async (categoryId: string | number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/by-category?categoryId=${categoryId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật biến thể sản phẩm
  updateProductVariants: async (
    productId: string | number,
    variants: ProductDetail[]
  ) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token không hợp lệ");

    try {
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
        let errorMsg = "Có lỗi khi cập nhật biến thể.";
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            // Cải thiện thông báo lỗi nếu là lỗi xác thực
            if (errorData.message.includes("Validation error")) {
              errorMsg =
                "Lỗi xác thực: Có thể bạn đang thêm biến thể với màu sắc và kích thước trùng lặp.";
            } else {
              errorMsg = errorData.message;
            }
          }
        } catch {}
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(
        "Đã xảy ra lỗi không xác định khi cập nhật biến thể sản phẩm"
      );
    }
  },

  // Xóa biến thể sản phẩm
  removeProductDetails: async (
    detailIds: number[]
  ): Promise<{ success: boolean; detailId: number }[]> => {
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token không hợp lệ");

    const results = [];

    for (const detailId of detailIds) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/product-details/${detailId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          let errorMsg = `Lỗi khi xóa biến thể ${detailId}.`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) errorMsg = errorData.message;
          } catch {}
          throw new Error(errorMsg);
        }
        const result = await response.json();
        results.push(result);
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("An unknown error occurred");
      }
    }

    return results;
  },

  // Cập nhật toàn bộ sản phẩm
  updateProduct: async (
    productId: string | number,
    productData: Partial<FormattedProduct>,
    removedData: {
      removedImageIds: number[];
      removedDetailIds: number[];
    }
  ) => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) throw new Error("Token không hợp lệ");

      // 1. Cập nhật thông tin cơ bản
      const basicInfoData = {
        name: productData.name,
        sku: productData.sku,
        description: productData.description,
        brand: productData.brand,
        material: productData.material,
        featured: productData.featured,
        status: productData.status,
        tags: productData.tags,
        suitabilities: productData.suitabilities?.map(
          (s: { id: number }) => s.id
        ),
        categories: productData.categories?.map((c: { id: number }) => c.id),
      };

      // 2. Chuẩn bị dữ liệu tồn kho
      const inventoryData = productData.details?.map(
        (detail: ProductDetailType) => ({
          id: detail.id,
          color: detail.color,
          price: detail.price,
          originalPrice: detail.originalPrice,
          sizes: detail.inventories?.map(
            (inv: { size: string; stock: number }) => ({
              size: inv.size,
              stock: inv.stock,
            })
          ),
        })
      );

      // Kiểm tra dữ liệu inventory có hợp lệ không
      if (inventoryData) {
        // Kiểm tra trùng lặp màu sắc + size
        const colorSizeCombos = new Set();
        let hasDuplicate = false;
        let duplicateInfo = "";

        for (const detail of inventoryData) {
          if (detail.sizes) {
            for (const sizeInfo of detail.sizes) {
              const combo = `${detail.color}-${sizeInfo.size}`;
              if (colorSizeCombos.has(combo)) {
                hasDuplicate = true;
                duplicateInfo = `Màu ${detail.color} và size ${sizeInfo.size}`;
                break;
              }
              colorSizeCombos.add(combo);
            }
          }
          if (hasDuplicate) break;
        }

        if (hasDuplicate) {
          throw new Error(`Phát hiện biến thể trùng lặp: ${duplicateInfo}`);
        }
      }

      // 3. Biến thể sản phẩm (sử dụng dữ liệu tương tự như inventory data)
      const variantData = [...(inventoryData || [])];

      // Thực hiện lần lượt các thao tác cập nhật để có thể xử lý lỗi tốt hơn
      try {
        // Cập nhật thông tin cơ bản trước
        await ProductService.updateProductBasicInfo(productId, basicInfoData);

        // Cập nhật tồn kho và biến thể nếu có
        if (inventoryData && inventoryData.length > 0) {
          try {
            await ProductService.updateProductInventory(
              productId,
              inventoryData
            );
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(`Lỗi khi cập nhật tồn kho: ${error.message}`);
            }
            throw new Error("Lỗi không xác định khi cập nhật tồn kho");
          }

          try {
            await ProductService.updateProductVariants(productId, variantData);
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(`Lỗi khi cập nhật biến thể: ${error.message}`);
            }
            throw new Error("Lỗi không xác định khi cập nhật biến thể");
          }
        } // Xóa hình ảnh nếu có
        if (
          removedData.removedImageIds &&
          removedData.removedImageIds.length > 0
        ) {
          try {
            // Check if we have valid numeric image IDs before attempting to delete
            const validImageIds = removedData.removedImageIds.filter(
              (id) => typeof id === "number" && id > 0
            );

            if (validImageIds.length > 0) {
              // Call our removeProductImages method to delete the images
              await ProductService.removeProductImages(
                productId,
                validImageIds
              );
            } else {
            }
          } catch (imgError) {
            throw new Error(
              `Lỗi khi xóa hình ảnh: ${
                imgError instanceof Error ? imgError.message : "Không xác định"
              }`
            );
          }
        }
        // Xóa chi tiết sản phẩm nếu có
        if (removedData.removedDetailIds.length > 0) {
          await ProductService.removeProductDetails(
            removedData.removedDetailIds
          );
        }
      } catch (error) {
        throw error;
      }

      return {
        success: true,
        message: "Cập nhật sản phẩm thành công",
        productId,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Lỗi cập nhật sản phẩm: ${error.message}`);
      }
      throw new Error("Đã xảy ra lỗi không xác định khi cập nhật sản phẩm");
    }
  },

  // Thêm kích thước mới (Admin)
  createSize: async (sizeData: {
    value: string;
    displayName?: string;
    categoryId?: string;
    displayOrder?: number;
  }): Promise<{ id: number; value: string; displayName: string }> => {
    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/products/sizes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sizeData),
        }
      );
      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || "Không thể tạo kích thước";
        throw new Error(errorMessage);
      }
      return responseData;
    } catch (error) {
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
  ): Promise<{ success: boolean; message: string }> => {
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
      throw error;
    }
  },
};
