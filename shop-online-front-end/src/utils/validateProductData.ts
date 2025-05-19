import { ProductDetail } from "@/services/ProductService";
import { ProductDetail as WishlistProductDetail } from "@/types/wishlist";

/**
 * Kiểm tra và xác thực dữ liệu biến thể sản phẩm
 * @param inventoryData - Dữ liệu các biến thể sản phẩm
 * @returns Đối tượng kết quả xác thực
 */
export const validateProductVariants = (
  inventoryData: ProductDetail[] | undefined
) => {
  if (!inventoryData || inventoryData.length === 0) {
    return {
      isValid: true,
      error: null,
    };
  }

  // Kiểm tra trùng lặp màu sắc + size
  const colorSizeCombos = new Set();
  let duplicateInfo = null;

  for (const detail of inventoryData) {
    if (detail.sizes) {
      for (const sizeInfo of detail.sizes) {
        const combo = `${detail.color}-${sizeInfo.size}`;
        if (colorSizeCombos.has(combo)) {
          duplicateInfo = {
            color: detail.color,
            size: sizeInfo.size,
            combo,
          };
          break;
        }
        colorSizeCombos.add(combo);
      }
    }
    if (duplicateInfo) break;
  }

  if (duplicateInfo) {
    return {
      isValid: false,
      error: {
        message: `Phát hiện biến thể trùng lặp: Màu ${duplicateInfo.color} và size ${duplicateInfo.size}`,
        details: duplicateInfo,
      },
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Kiểm tra nhanh sự trùng lặp giữa các biến thể màu sắc và kích thước
 * Trả về undefined nếu không phát hiện trùng lặp
 * Trả về thông báo lỗi nếu có trùng lặp
 */
export function checkDuplicateVariants(
  details: (ProductDetail | WishlistProductDetail)[]
): string | undefined {
  if (!details || details.length === 0) return undefined;

  const colorSizeMap = new Map<string, boolean>();

  for (const detail of details) {
    const color = detail.color;

    // Check if the detail has inventories property (from WishlistProductDetail)
    if ("inventories" in detail && detail.inventories) {
      for (const inv of detail.inventories) {
        const combo = `${color}-${inv.size}`;
        if (colorSizeMap.has(combo)) {
          return `Phát hiện biến thể trùng lặp: Màu "${color}" và size "${inv.size}"`;
        }
        colorSizeMap.set(combo, true);
      }
    } else if ("sizes" in detail && detail.sizes) {
      // If not, use sizes property (from ProductDetail)
      for (const sizeInfo of detail.sizes) {
        const combo = `${color}-${sizeInfo.size}`;
        if (colorSizeMap.has(combo)) {
          return `Phát hiện biến thể trùng lặp: Màu "${color}" và size "${sizeInfo.size}"`;
        }
        colorSizeMap.set(combo, true);
      }
    }
  }

  return undefined;
}

/**
 * Kiểm tra và xác thực dữ liệu sản phẩm trước khi lưu
 * @param productData - Dữ liệu sản phẩm
 * @returns Đối tượng kết quả xác thực
 */
interface ProductData {
  name: string;
  sku: string;
  category?: string;
  categories?: string[];
  price: number;
  details?: ProductDetail[];
}

export const validateProductData = (productData: ProductData) => {
  const errors = [];

  // Kiểm tra các trường bắt buộc
  if (!productData.name || productData.name.trim() === "") {
    errors.push({
      field: "name",
      message: "Tên sản phẩm không được để trống",
    });
  }

  if (!productData.sku || productData.sku.trim() === "") {
    errors.push({
      field: "sku",
      message: "Mã SKU không được để trống",
    });
  }

  // Kiểm tra danh mục
  if (
    !productData.category &&
    (!productData.categories || productData.categories.length === 0)
  ) {
    errors.push({
      field: "category",
      message: "Vui lòng chọn danh mục sản phẩm",
    });
  }

  // Kiểm tra giá
  if (!productData.price && productData.price !== 0) {
    errors.push({
      field: "price",
      message: "Giá sản phẩm không được để trống",
    });
  }

  // Kiểm tra biến thể
  if (productData.details && productData.details.length > 0) {
    // Dùng checkDuplicateVariants thay thế validateProductVariants để hỗ trợ cả hai cấu trúc dữ liệu
    const duplicateMessage = checkDuplicateVariants(productData.details);
    if (duplicateMessage) {
      errors.push({
        field: "variants",
        message: duplicateMessage,
      });
    }
  } else {
    errors.push({
      field: "variants",
      message: "Sản phẩm phải có ít nhất một biến thể",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
