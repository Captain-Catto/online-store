import React from "react";
import { useToast } from "@/utils/useToast";

// Kiểu dữ liệu cho thông tin biến thể
interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

// Kiểu dữ liệu cho sản phẩm (đồng bộ với AddProductPage)
interface Product {
  name: string;
  sku: string;
  description: string;
  category: string;
  categoryName: string;
  brand: string;
  subtype: string;
  subtypeName: string;
  material: string;
  price: number;
  originalPrice: number;
  suitability: string[];
  stock: {
    total: number;
    variants: ProductVariant[];
  };
  colors: string[];
  sizes: string[];
  status: string;
  statusLabel: string;
  statusClass: string;
  featured: boolean;
  tags: string[];
}

interface InventoryTabProps {
  product: Product; // Sử dụng kiểu Product thay vì ProductInventory
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
  availableColors: { key: string; label: string }[];
  availableSizes: Array<{ value: string; label: string }>;

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
  const { showToast } = useToast();
  const handleAddVariant = () => {
    if (!newVariant.color || !newVariant.size) {
      showToast("Vui lòng chọn màu sắc và kích thước cho biến thể", {
        type: "error",
      });
      return;
    }

    const isDuplicate = product.stock.variants.some(
      (v) => v.color === newVariant.color && v.size === newVariant.size
    );

    if (isDuplicate) {
      showToast("Biến thể này đã tồn tại!", {
        type: "error",
      });
      return;
    }

    const updatedVariants = [...product.stock.variants, { ...newVariant }];
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

    setProduct({
      ...product,
      stock: {
        variants: updatedVariants,
        total: totalStock,
      },
    });
  };

  return (
    <div>
      <div className="mb-4">
        <h5>Thêm biến thể sản phẩm</h5>
        <div className="row">
          <div className="col-md-4">
            <div className="form-group">
              <label>Màu sắc</label>
              <select
                className="form-control"
                value={newVariant.color}
                onChange={(e) =>
                  setNewVariant({
                    ...newVariant,
                    color: e.target.value,
                  })
                }
              >
                <option value="">Chọn màu</option>
                {product.colors.map((color) => (
                  <option key={color} value={color}>
                    {availableColors.find((c) => c.key === color)?.label ||
                      color}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label>Kích thước</label>
              <select
                className="form-control"
                value={newVariant.size}
                onChange={(e) =>
                  setNewVariant({
                    ...newVariant,
                    size: e.target.value,
                  })
                }
              >
                <option value="">Chọn kích thước</option>
                {product.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label>Số lượng</label>
              <input
                type="number"
                className="form-control"
                min="0"
                value={newVariant.stock}
                onChange={(e) =>
                  setNewVariant({
                    ...newVariant,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="col-md-1 d-flex align-items-end">
            <button className="btn btn-primary mb-3" onClick={handleAddVariant}>
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default InventoryTab;
