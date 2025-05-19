import React, { useState, useEffect } from "react";
import { checkDuplicateVariants } from "@/utils/validateProductData";
import { FormattedProduct } from "@/components/admin/products/types";

interface ProductValidationAlertProps {
  product: FormattedProduct | null;
}

/**
 * Component hiển thị thông báo lỗi khi phát hiện dữ liệu không hợp lệ
 * Đặc biệt phát hiện các biến thể trùng lặp trước khi gửi lên server
 */
const ProductValidationAlert: React.FC<ProductValidationAlertProps> = ({
  product,
}) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Kiểm tra dữ liệu sản phẩm khi có thay đổi
  useEffect(() => {
    if (!product) {
      setValidationErrors([]);
      return;
    }

    const errors: string[] = []; // Kiểm tra biến thể trùng lặp
    if (product.details && product.details.length > 0) {
      // Transform ProductDetailType[] to ProductDetail[] for checkDuplicateVariants
      const transformedDetails = product.details.map((detail) => ({
        id: detail.id,
        color: detail.color,
        price: detail.price,
        originalPrice: detail.originalPrice,
        sizes: detail.inventories.map((inv) => ({
          size: inv.size,
          stock: inv.stock,
        })),
      }));

      const duplicateError = checkDuplicateVariants(transformedDetails);
      if (duplicateError) {
        errors.push(duplicateError);
      }
    }

    // Kiểm tra các trường bắt buộc khác
    if (!product.name || product.name.trim() === "") {
      errors.push("Tên sản phẩm không được để trống");
    }

    if (!product.sku || product.sku.trim() === "") {
      errors.push("Mã SKU không được để trống");
    }

    setValidationErrors(errors);
  }, [product]);

  // Không hiển thị gì nếu không có lỗi
  if (validationErrors.length === 0) {
    return null;
  }

  // Hiển thị thông báo lỗi
  return (
    <div className="alert alert-warning">
      <h5>
        <i className="icon fas fa-exclamation-triangle"></i> Cảnh báo lỗi dữ
        liệu
      </h5>
      <ul style={{ marginBottom: 0, paddingLeft: "20px" }}>
        {validationErrors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProductValidationAlert;
