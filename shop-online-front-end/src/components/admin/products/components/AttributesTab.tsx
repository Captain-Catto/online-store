"use client";

import React, { memo, useState } from "react";
import { useProductContext } from "../context/ProductContext";
import TabPanel from "./TabPanel";
import { ProductDetailType, ProductInventory } from "../types";

interface AttributesTabProps {
  suitabilities: Array<{ id: number; name: string }>;
  suitabilityLoading: boolean;
  availableColors: { key: string; label: string }[];
  availableSizes: Array<{ value: string; label: string }>;
}

const AttributesTab: React.FC<AttributesTabProps> = memo(
  ({ suitabilities, suitabilityLoading, availableColors, availableSizes }) => {
    const { state, updateProduct, dispatch } = useProductContext();
    const { product, isEditing } = state;
    const [tagInput, setTagInput] = useState<string>("");

    if (!product) return null;

    const colorExists = (colorKey: string): boolean => {
      return (
        product.details?.some(
          (detail: ProductDetailType) => detail.color === colorKey
        ) || false
      );
    };

    const sizeExists = (sizeValue: string): boolean => {
      return (
        product.details?.some((detail: ProductDetailType) =>
          detail.inventories?.some(
            (inv: ProductInventory) => inv.size === sizeValue
          )
        ) || false
      );
    };
    const handleColorChange = (colorKey: string, checked: boolean): void => {
      if (checked) {
        // Add new color detail
        const newDetail: ProductDetailType = {
          id: 0,
          productId: product.id,
          color: colorKey,
          price: product.details[0]?.price || 0,
          originalPrice: product.details[0]?.originalPrice || 0,
          inventories:
            product.details[0]?.inventories.map((inv) => ({
              id: 0,
              productDetailId: 0,
              size: inv.size,
              stock: 0,
            })) || [],
          images: [],
        };

        // Update product with new color
        updateProduct({
          ...product,
          details: [...product.details, newDetail],
        });

        // Also update the selected image color to this newly added color
        dispatch({ type: "SET_SELECTED_IMAGE_COLOR", payload: colorKey });
      } else {
        // Remove color
        const updatedDetails = product.details.filter(
          (detail) => detail.color !== colorKey
        );

        // Sử dụng updateProduct thay vì updateProductField
        updateProduct({
          ...product,
          details: updatedDetails,
        });
      }
    };
    const handleSizeChange = (size: string, checked: boolean): void => {
      if (checked) {
        // Add the size to all color variants
        const updatedDetails = product.details.map((detail) => ({
          ...detail,
          inventories: [
            ...detail.inventories,
            {
              id: 0,
              productDetailId: detail.id,
              size: size,
              stock: 0,
            },
          ],
        }));

        // Update product with new details
        updateProduct({
          ...product,
          details: updatedDetails,
        });
      } else {
        // Remove the size from all color variants
        const updatedDetails = product.details.map((detail) => ({
          ...detail,
          inventories: detail.inventories.filter((inv) => inv.size !== size),
        }));

        // Update product with new details
        updateProduct({
          ...product,
          details: updatedDetails,
        });
      }
    };
    const handleAddTag = (): void => {
      if (!tagInput.trim()) return;

      const newTag = tagInput.trim();
      if (product.tags.includes(newTag)) return;

      const newTags = [...product.tags, newTag];

      // Sử dụng updateProduct để cập nhật tags
      updateProduct({
        ...product,
        tags: newTags,
      });

      setTagInput("");
    };

    const handleRemoveTag = (tag: string): void => {
      const newTags = product.tags.filter((t) => t !== tag);

      // Sử dụng updateProduct để cập nhật tags
      updateProduct({
        ...product,
        tags: newTags,
      });
    };
    const handleSuitabilityChange = (
      suitabilityId: number,
      checked: boolean
    ): void => {
      let updatedSuitabilities;
      if (checked) {
        updatedSuitabilities = [
          ...product.suitabilities,
          {
            id: suitabilityId,
            name: suitabilities.find((s) => s.id === suitabilityId)?.name || "",
          },
        ];
      } else {
        updatedSuitabilities = product.suitabilities.filter(
          (s) => s.id !== suitabilityId
        );
      }

      // Sử dụng updateProduct để cập nhật
      updateProduct({
        ...product,
        suitabilities: updatedSuitabilities,
      });
    };

    return (
      <TabPanel tabId="variants">
        {isEditing ? (
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Màu sắc</h3>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-wrap">
                    {availableColors.map((color) => (
                      <div key={color.key} className="form-check mb-2 mr-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`color-${color.key}`}
                          checked={colorExists(color.key)}
                          onChange={(e) =>
                            handleColorChange(color.key, e.target.checked)
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`color-${color.key}`}
                        >
                          {color.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Kích thước</h3>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-wrap">
                    {availableSizes.map((size) => (
                      <div key={size.value} className="form-check mb-2 mr-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`size-${size.value}`}
                          checked={sizeExists(size.value)}
                          onChange={(e) =>
                            handleSizeChange(size.value, e.target.checked)
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`size-${size.value}`}
                        >
                          {size.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Phù hợp với</h3>
                </div>
                <div className="card-body">
                  {suitabilityLoading ? (
                    <div className="text-center">
                      <i className="fas fa-spinner fa-spin" /> Đang tải...
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap">
                      {suitabilities.map((suitability) => (
                        <div
                          key={suitability.id}
                          className="form-check mb-2 mr-4"
                        >
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`suitability-${suitability.id}`}
                            checked={product.suitabilities.some(
                              (s) => s.id === suitability.id
                            )}
                            onChange={(e) =>
                              handleSuitabilityChange(
                                suitability.id,
                                e.target.checked
                              )
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`suitability-${suitability.id}`}
                          >
                            {suitability.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Tags</h3>
                </div>
                <div className="card-body">
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập tag và nhấn Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <div className="input-group-append">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={handleAddTag}
                      >
                        <i className="fas fa-plus" />
                      </button>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap">
                    {product.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="badge badge-info mr-2 mb-2 p-2 d-flex align-items-center"
                      >
                        {tag}
                        <button
                          type="button"
                          className="close ml-2"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">Màu sắc</div>
                <div className="card-body">
                  {product.details.length > 0 ? (
                    <div className="d-flex flex-wrap">
                      {product.details.map((detail) => (
                        <span
                          key={detail.color}
                          className="badge badge-info mr-2 mb-2 p-2"
                        >
                          {availableColors.find((c) => c.key === detail.color)
                            ?.label || detail.color}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">Không có màu sắc</p>
                  )}
                </div>
              </div>

              <div className="card mt-4">
                <div className="card-header">Kích thước</div>
                <div className="card-body">
                  {product.details.length > 0 &&
                  product.details[0].inventories.length > 0 ? (
                    <div className="d-flex flex-wrap">
                      {[
                        ...new Set(
                          product.details.flatMap((d) =>
                            d.inventories.map((i) => i.size)
                          )
                        ),
                      ].map((size) => (
                        <span
                          key={size}
                          className="badge badge-info mr-2 mb-2 p-2"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">Không có kích thước</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">Phù hợp với</div>
                <div className="card-body">
                  {product.suitabilities.length > 0 ? (
                    <div className="d-flex flex-wrap">
                      {product.suitabilities.map((suitability) => (
                        <span
                          key={suitability.id}
                          className="badge badge-info mr-2 mb-2 p-2"
                        >
                          {suitability.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">Không có thông tin phù hợp</p>
                  )}
                </div>
              </div>

              <div className="card mt-4">
                <div className="card-header">Tags</div>
                <div className="card-body">
                  {product.tags.length > 0 ? (
                    <div className="d-flex flex-wrap">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="badge badge-info mr-2 mb-2 p-2"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">Không có tags</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </TabPanel>
    );
  }
);

AttributesTab.displayName = "AttributesTab";

export default AttributesTab;
