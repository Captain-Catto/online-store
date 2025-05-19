"use client";

import React, { memo, useState } from "react";
import { useProductContext } from "../context/ProductContext";
import TabPanel from "./TabPanel";
import { ProductInventory, ProductDetailType } from "../types";
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

    // Create flat view of variants for display
    const variants = product.details.flatMap((detail) =>
      detail.inventories.map((inventory) => ({
        color: detail.color,
        size: inventory.size,
        stock: inventory.stock,
        detailId: detail.id,
        inventoryId: inventory.id,
      }))
    ); // Calculate total stock
    const totalStock = product.details.reduce(
      (sum, detail) =>
        sum + detail.inventories.reduce((s, inv) => s + inv.stock, 0),
      0
    );
    const handleVariantChange = (
      detailIndex: number,
      inventoryIndex: number,
      field: string,
      value: string | number
    ) => {
      // Create a deep copy of the product details
      const updatedDetails = [...product.details];

      // Update the specific inventory item
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

      // Update the product with the new details
      updateProduct({
        ...product,
        details: updatedDetails,
      });
    };

    const handleAddVariant = () => {
      if (!newVariant.color || !newVariant.size) {
        showToast("Vui lòng chọn màu sắc và kích thước cho biến thể", {
          type: "error",
        });
        return;
      }

      // Check for duplicate
      const isDuplicate = variants.some(
        (v) => v.color === newVariant.color && v.size === newVariant.size
      );

      if (isDuplicate) {
        showToast("Biến thể này đã tồn tại!", {
          type: "error",
        });
        return;
      }

      // Find existing detail with this color or create a new one
      const detailIndex = product.details.findIndex(
        (d) => d.color === newVariant.color
      );

      if (detailIndex >= 0) {
        // Add new inventory to existing detail
        const detail = product.details[detailIndex];
        const newInventory: ProductInventory = {
          id: 0,
          productDetailId: detail.id,
          size: newVariant.size,
          stock: newVariant.stock,
        };

        // Create updated details with the new inventory
        const updatedDetails = [...product.details];
        updatedDetails[detailIndex] = {
          ...detail,
          inventories: [...detail.inventories, newInventory],
        };

        // Update product with new details
        updateProduct({
          ...product,
          details: updatedDetails,
        });
      } else {
        // Create new detail with this color
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

        // Update product with the new detail
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
                                  // Remove inventory - filter out this inventory
                                  const updatedDetails = [...product.details];
                                  updatedDetails[detailIndex] = {
                                    ...detail,
                                    inventories: detail.inventories.filter(
                                      (_, idx) => idx !== inventoryIndex
                                    ),
                                  };

                                  // Update product with the modified details
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
