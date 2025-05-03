import React from "react";
import { FormattedProduct } from "../ProductDetailPage";

// Kiểu dữ liệu cho thông tin biến thể
interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

// Kiểu dữ liệu cho sản phẩm (đồng bộ với AddProductPage)
// interface Product {
//   name: string;
//   sku: string;
//   description: string;
//   category: string;
//   categoryName: string;
//   brand: string;
//   subtype: string;
//   subtypeName: string;
//   material: string;
//   price: number;
//   originalPrice: number;
//   suitability: string[];
//   stock: {
//     total: number;
//     variants: ProductVariant[];
//   };
//   colors: string[];
//   sizes: string[];
//   status: string;
//   statusLabel: string;
//   statusClass: string;
//   featured: boolean;
//   tags: string[];
// }

interface InventoryTabProps {
  product: FormattedProduct;
  setProduct: React.Dispatch<React.SetStateAction<FormattedProduct | null>>;
  availableColors: { key: string; label: string }[];
  newVariant: ProductVariant;
  setNewVariant: React.Dispatch<React.SetStateAction<ProductVariant>>;
}

const InventoryTab: React.FC<InventoryTabProps> = ({
  product,
  setProduct,
  availableColors,
  newVariant,
  setNewVariant,
}) => {
  const handleAddVariant = () => {
    if (!newVariant.color || !newVariant.size) {
      alert("Vui lòng chọn màu sắc và kích thước cho biến thể");
      return;
    }

    const isDuplicate = product.stock.variants.some(
      (v) => v.color === newVariant.color && v.size === newVariant.size
    );

    if (isDuplicate) {
      alert("Biến thể này đã tồn tại!");
      return;
    }

    setProduct((prev) => {
      if (!prev) return prev;

      const updatedVariants = [...prev.stock.variants, { ...newVariant }];
      const totalStock = updatedVariants.reduce(
        (sum, item) => sum + item.stock,
        0
      );

      return {
        ...prev,
        stock: {
          variants: updatedVariants,
          total: totalStock,
        },
      };
    });

    setNewVariant({
      color: "",
      size: "",
      stock: 0,
    });
  };

  const handleRemoveVariant = (index: number) => {
    const updatedVariants = [...product.stock.variants];
    updatedVariants.splice(index, 1);

    const totalStock = updatedVariants.reduce(
      (sum, item) => sum + item.stock,
      0
    );

    setProduct({
      ...product,
      stock: {
        variants: updatedVariants,
        total: totalStock,
      },
    });
  };

  const handleVariantStockChange = (index: number, newStock: number) => {
    const updatedVariants = [...product.stock.variants];
    updatedVariants[index].stock = newStock;

    const totalStock = updatedVariants.reduce(
      (sum, item) => sum + item.stock,
      0
    );

    setProduct((prev) => {
      if (!prev) return prev; // Kiểm tra null
      return {
        ...prev,
        stock: {
          variants: updatedVariants,
          total: totalStock,
        },
      };
    });
  };

  return (
    <div>
      <h5>Danh sách biến thể</h5>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Màu sắc</th>
              <th>Kích thước</th>
              <th>Số lượng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {product.stock.variants.length > 0 ? (
              product.stock.variants.map((variant, index) => (
                <tr key={index}>
                  <td>
                    {availableColors.find((c) => c.key === variant.color)
                      ?.label || variant.color}
                  </td>
                  <td>{variant.size}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantStockChange(
                          index,
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveVariant(index)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  Chưa có biến thể nào. Vui lòng thêm biến thể sản phẩm.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={2} className="text-right">
                Tổng số lượng:
              </th>
              <th>{product.stock.total}</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
      <button className="btn btn-primary mt-3" onClick={handleAddVariant}>
        Thêm biến thể
      </button>
    </div>
  );
};

export default InventoryTab;
