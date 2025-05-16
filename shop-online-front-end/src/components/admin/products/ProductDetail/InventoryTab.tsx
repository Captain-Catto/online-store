import React from "react";
import { FormattedProduct } from "../ProductDetailPage";
import { useToast } from "@/utils/useToast";

// Kiểu dữ liệu cho thông tin biến thể
interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

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
  const { showToast } = useToast();

  // Tạo biến variants từ product.details (cấu trúc mới)
  const variants = React.useMemo(() => {
    return product.details.flatMap((detail) =>
      detail.inventories.map((inv) => ({
        color: detail.color,
        size: inv.size,
        stock: inv.stock,
        detailId: detail.id,
      }))
    );
  }, [product.details]);

  // Tính tổng stock
  const totalStock = React.useMemo(() => {
    return product.details.reduce(
      (sum, detail) =>
        sum + detail.inventories.reduce((s, inv) => s + inv.stock, 0),
      0
    );
  }, [product.details]);

  const handleAddVariant = () => {
    if (!newVariant.color || !newVariant.size) {
      showToast("Vui lòng chọn màu sắc và kích thước cho biến thể", {
        type: "error",
      });
      return;
    }

    // Kiểm tra trùng lặp dựa trên variants từ details
    const isDuplicate = variants.some(
      (v) => v.color === newVariant.color && v.size === newVariant.size
    );

    if (isDuplicate) {
      showToast("Biến thể này đã tồn tại!", {
        type: "error",
      });
      return;
    }

    setProduct((prev) => {
      if (!prev) return prev;

      // Tìm detail với màu tương ứng hoặc tạo mới
      const detailWithColor = prev.details.find(
        (d) => d.color === newVariant.color
      );

      if (detailWithColor) {
        // Nếu detail với màu này đã tồn tại, thêm inventory mới
        return {
          ...prev,
          details: prev.details.map((detail) => {
            if (detail.color === newVariant.color) {
              return {
                ...detail,
                inventories: [
                  ...detail.inventories,
                  {
                    id: 0, // ID tạm thời
                    size: newVariant.size,
                    stock: newVariant.stock,
                  },
                ],
              };
            }
            return detail;
          }),
        };
      } else {
        // Nếu chưa có màu này, tạo detail mới
        return {
          ...prev,
          details: [
            ...prev.details,
            {
              id: 0, // ID tạm thời
              color: newVariant.color,
              price: prev.details[0]?.price || 0,
              originalPrice: prev.details[0]?.originalPrice || 0,
              inventories: [
                {
                  id: 0, // ID tạm thời
                  size: newVariant.size,
                  stock: newVariant.stock,
                },
              ],
              images: [],
            },
          ],
        };
      }
    });

    setNewVariant({
      color: "",
      size: "",
      stock: 0,
    });
  };

  const handleRemoveVariant = (variantToRemove: {
    color: string;
    size: string;
  }) => {
    setProduct((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        details: prev.details
          .map((detail) => {
            if (detail.color === variantToRemove.color) {
              return {
                ...detail,
                inventories: detail.inventories.filter(
                  (inv) => inv.size !== variantToRemove.size
                ),
              };
            }
            return detail;
          })
          .filter((detail) => detail.inventories.length > 0), // Xóa details không có inventory nào
      };
    });
  };

  const handleVariantStockChange = (
    variantToUpdate: { color: string; size: string },
    newStock: number
  ) => {
    setProduct((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        details: prev.details.map((detail) => {
          if (detail.color === variantToUpdate.color) {
            return {
              ...detail,
              inventories: detail.inventories.map((inv) => {
                if (inv.size === variantToUpdate.size) {
                  return { ...inv, stock: newStock };
                }
                return inv;
              }),
            };
          }
          return detail;
        }),
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
            {variants.length > 0 ? (
              variants.map((variant, index) => (
                <tr key={index}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div
                        style={{
                          backgroundColor: variant.color,
                          width: "20px",
                          height: "20px",
                          border: "1px solid #ddd",
                          marginRight: "8px",
                        }}
                      />
                      {availableColors.find((c) => c.key === variant.color)
                        ?.label || variant.color}
                    </div>
                  </td>
                  <td>{variant.size}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantStockChange(
                          { color: variant.color, size: variant.size },
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() =>
                        handleRemoveVariant({
                          color: variant.color,
                          size: variant.size,
                        })
                      }
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
              <th>{totalStock}</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="row mt-3">
        <div className="col-md-3">
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
            <option value="">Chọn màu sắc</option>
            {availableColors.map((color) => (
              <option key={color.key} value={color.key}>
                {color.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
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
            {["XXS", "XS", "S", "M", "L", "XL", "XXL"].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Số lượng"
            value={newVariant.stock}
            onChange={(e) =>
              setNewVariant({
                ...newVariant,
                stock: parseInt(e.target.value) || 0,
              })
            }
            min="0"
          />
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary w-100" onClick={handleAddVariant}>
            Thêm biến thể
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;
