"use client";

import React, { memo, useState } from "react";
import { useProductContext } from "@/contexts/ProductContext";
import TabPanel from "./TabPanel";
import {
  ProductInventory,
  ProductDetailType,
} from "@/components/admin/products/types";
import { useToast } from "@/utils/useToast";

interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

interface InventoryTabProps {
  availableColors: { key: string; label: string }[];
  availableSizes: { value: string; label: string }[];
}

const InventoryTab: React.FC<InventoryTabProps> = memo(
  ({ availableColors, availableSizes }) => {
    const { state, updateProduct } = useProductContext();
    const { product, isEditing } = state;
    const { showToast } = useToast();

    const [newVariant, setNewVariant] = useState<ProductVariant>({
      color: product?.details[0]?.color || "",
      size: product?.details[0]?.inventories[0]?.size || "",
      stock: 0,
    });

    if (!product) return null;

    // sử dụng flatMap để tạo danh sách biến thể
    // mỗi biến thể bao gồm màu sắc, kích thước, số lượng, id chi tiết và id tồn kho
    const variants = product.details.flatMap((detail) =>
      detail.inventories.map((inventory) => ({
        color: detail.color,
        size: inventory.size,
        stock: inventory.stock,
        detailId: detail.id,
        inventoryId: inventory.id,
      }))
    );

    // Tính tổng số lượng tồn kho
    const totalStock = product.details.reduce(
      (sum, detail) =>
        sum + detail.inventories.reduce((s, inv) => s + inv.stock, 0),
      0
    );

    // Tạo một mảng các biến thể từ danh sách tồn kho
    const handleVariantChange = (
      detailIndex: number,
      inventoryIndex: number,
      field: string,
      value: string | number
    ) => {
      // tạo một bản sao của chi tiết sản phẩm
      // để tránh thay đổi trực tiếp trạng thái
      const updatedDetails = [...product.details];

      // Chỉ cập nhật trường cụ thể (stock hoặc size)
      updatedDetails[detailIndex] = {
        ...updatedDetails[detailIndex],
        inventories: updatedDetails[detailIndex].inventories.map((inv, idx) =>
          idx === inventoryIndex
            ? {
                ...inv,
                [field]: field === "stock" ? parseInt(value.toString()) : value,
              }
            : inv
        ),
      };

      // Cập nhật sản phẩm với chi tiết mới
      // và gọi hàm updateProduct từ context
      updateProduct({
        ...product,
        details: updatedDetails,
      });
    };

    // Hàm thêm biến thể mới
    const handleAddVariant = () => {
      if (!newVariant.color || !newVariant.size) {
        showToast("Vui lòng chọn màu sắc và kích thước cho biến thể", {
          type: "error",
        });
        return;
      }

      // Kiểm tra xem biến thể đã tồn tại chưa
      const isDuplicate = variants.some(
        (v) => v.color === newVariant.color && v.size === newVariant.size
      );

      // Nếu đã tồn tại, hiển thị thông báo lỗi
      if (isDuplicate) {
        showToast("Biến thể này đã tồn tại!", {
          type: "error",
        });
        return;
      }

      // Tìm kiếm chi tiết sản phẩm theo màu sắc
      // Nếu không tìm thấy, tạo mới chi tiết
      const detailIndex = product.details.findIndex(
        (d) => d.color === newVariant.color
      );

      // Nếu tìm thấy chi tiết, thêm tồn kho mới vào chi tiết đó
      if (detailIndex >= 0) {
        const detail = product.details[detailIndex];
        const newInventory: ProductInventory = {
          id: 0,
          productDetailId: detail.id,
          size: newVariant.size,
          stock: newVariant.stock,
        };

        // Cập nhật tồn kho mới vào chi tiết
        // và tạo một bản sao của chi tiết để tránh thay đổi trực tiếp trạng thái
        const updatedDetails = [...product.details];
        updatedDetails[detailIndex] = {
          ...detail,
          inventories: [...detail.inventories, newInventory],
        };

        // Cập nhật sản phẩm với chi tiết mới
        // và gọi hàm updateProduct từ context
        updateProduct({
          ...product,
          details: updatedDetails,
        });
      } else {
        // Nếu không tìm thấy chi tiết, tạo mới chi tiết với tồn kho mới
        const newDetail: ProductDetailType = {
          id: 0,
          productId: product.id,
          color: newVariant.color,
          price: product.details[0]?.price || 0,
          originalPrice: product.details[0]?.originalPrice || 0,
          inventories: [
            {
              id: 0,
              productDetailId: 0,
              size: newVariant.size,
              stock: newVariant.stock,
            },
          ],
          images: [],
        };

        // Cập nhật sản phẩm với chi tiết mới
        // và gọi hàm updateProduct từ context
        updateProduct({
          ...product,
          details: [...product.details, newDetail],
        });
      }

      // Reset form
      setNewVariant({
        color: newVariant.color,
        size: "",
        stock: 0,
      });
    };

    return (
      <TabPanel tabId="inventory">
        {isEditing ? (
          <div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Thêm biến thể mới</h3>
              </div>
              <div className="card-body">
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
                        <option value="">-- Chọn màu --</option>
                        {availableColors.map((color) => (
                          <option key={color.key} value={color.key}>
                            {color.label}
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
                          setNewVariant({ ...newVariant, size: e.target.value })
                        }
                      >
                        <option value="">-- Chọn size --</option>
                        {availableSizes.map((size) => (
                          <option key={size.value} value={size.value}>
                            {size.label}
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
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={handleAddVariant}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Danh sách tồn kho</h3>
                <span className="badge badge-info ml-2">
                  Tổng: {totalStock} sản phẩm
                </span>
              </div>
              <div className="card-body">
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
                      {product.details.flatMap((detail, detailIndex) =>
                        detail.inventories.map((inventory, inventoryIndex) => (
                          <tr key={`${detail.color}-${inventory.size}`}>
                            <td>
                              {availableColors.find(
                                (c) => c.key === detail.color
                              )?.label || detail.color}
                            </td>
                            <td>{inventory.size}</td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                min="0"
                                value={inventory.stock}
                                onChange={(e) =>
                                  handleVariantChange(
                                    detailIndex,
                                    inventoryIndex,
                                    "stock",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td>
                              {" "}
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => {
                                  // Xóa tồn kho
                                  // Tạo một bản sao của chi tiết sản phẩm
                                  const updatedDetails = [...product.details];
                                  updatedDetails[detailIndex] = {
                                    ...detail,
                                    inventories: detail.inventories.filter(
                                      (_, idx) => idx !== inventoryIndex
                                    ),
                                  };

                                  // Cập nhật sản phẩm với chi tiết mới
                                  // và gọi hàm updateProduct từ context
                                  updateProduct({
                                    ...product,
                                    details: updatedDetails,
                                  });
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Màu sắc</th>
                  <th>Kích thước</th>
                  <th>Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {variants.length > 0 ? (
                  variants.map((variant, idx) => (
                    <tr key={idx}>
                      <td>
                        {availableColors.find((c) => c.key === variant.color)
                          ?.label || variant.color}
                      </td>
                      <td>{variant.size}</td>
                      <td>{variant.stock}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center">
                      Không có dữ liệu tồn kho
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
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </TabPanel>
    );
  }
);

InventoryTab.displayName = "InventoryTab";

export default InventoryTab;
