"use client";

import React, { memo } from "react";
import { useProductContext } from "../context/ProductContext";
import TabPanel from "./TabPanel";
import { FormattedProduct } from "../types";

interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  parentId?: number | string | null;
  isActive?: boolean;
}

interface BasicInfoTabProps {
  categoryList: Category[];
  subtypes: Category[];
  categoryLoading: boolean;
  subtypeLoading: boolean;
}

type ProductValueTypes =
  | string
  | number
  | boolean
  | { id: number; name: string }[]
  | null;

const BasicInfoTab: React.FC<BasicInfoTabProps> = memo(
  ({ categoryList, subtypes, categoryLoading, subtypeLoading }) => {
    const { state, updateProduct } = useProductContext();
    const { product, isEditing } = state;

    if (!product) return null;

    const handleInputChange = (
      field: keyof FormattedProduct,
      value: ProductValueTypes
    ) => {
      updateProduct({
        ...product,
        [field]: value,
      });
    };

    return (
      <TabPanel tabId="info">
        {isEditing ? (
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="productName">
                  Tên sản phẩm <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="productName"
                  placeholder="Nhập tên sản phẩm"
                  value={product.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="productSKU">
                  Mã SKU <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="productSKU"
                  placeholder="Ví dụ: AT-NAM-001"
                  value={product.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="productCategory">
                  Danh mục <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  id="productCategory"
                  value={product.categories[0]?.id || ""}
                  onChange={(e) => {
                    const categoryId = e.target.value;
                    const categoryName = categoryList.find(
                      (cat) => cat.id.toString() === categoryId
                    )?.name;

                    // Update categories array with new value
                    const updatedCategories = [...product.categories];
                    if (updatedCategories.length === 0) {
                      updatedCategories.push({
                        id: parseInt(categoryId),
                        name: categoryName || "",
                      });
                    } else {
                      updatedCategories[0] = {
                        id: parseInt(categoryId),
                        name: categoryName || "",
                      };
                    }

                    handleInputChange("categories", updatedCategories);
                  }}
                  required
                  disabled={categoryLoading}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categoryList.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoryLoading && (
                  <div className="text-info mt-1">
                    <i className="fas fa-spinner fa-spin mr-1"></i> Đang tải
                    danh mục...
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="productSubtype">
                  Loại sản phẩm <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  id="productSubtype"
                  value={product.categories[1]?.id || ""}
                  onChange={(e) => {
                    const subtypeId = e.target.value;
                    const subtypeName = subtypes.find(
                      (sub) => sub.id.toString() === subtypeId
                    )?.name;

                    // Update categories array with new subtype
                    const updatedCategories = [...product.categories];
                    if (updatedCategories.length <= 1) {
                      updatedCategories.push({
                        id: parseInt(subtypeId),
                        name: subtypeName || "",
                      });
                    } else {
                      updatedCategories[1] = {
                        id: parseInt(subtypeId),
                        name: subtypeName || "",
                      };
                    }

                    handleInputChange("categories", updatedCategories);
                  }}
                  required
                  disabled={subtypeLoading || !product.categories[0]}
                >
                  <option value="">-- Chọn loại sản phẩm --</option>
                  {subtypes.map((subtype) => (
                    <option key={subtype.id} value={subtype.id}>
                      {subtype.name}
                    </option>
                  ))}
                </select>
                {subtypeLoading && (
                  <div className="text-info mt-1">
                    <i className="fas fa-spinner fa-spin mr-1"></i> Đang tải
                    loại sản phẩm...
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="productBrand">Thương hiệu</label>
                <input
                  type="text"
                  className="form-control"
                  id="productBrand"
                  placeholder="Nhập thương hiệu"
                  value={product.brand || ""}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="productMaterial">Chất liệu</label>
                <input
                  type="text"
                  className="form-control"
                  id="productMaterial"
                  placeholder="Ví dụ: Cotton, Polyester, v.v."
                  value={product.material || ""}
                  onChange={(e) =>
                    handleInputChange("material", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="productStatus">Trạng thái</label>
                <select
                  className="form-control"
                  id="productStatus"
                  value={product.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                  <option value="draft">Bản nháp</option>
                </select>
              </div>
              <div className="form-group">
                <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="featuredProduct"
                    checked={product.featured}
                    onChange={(e) =>
                      handleInputChange("featured", e.target.checked)
                    }
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="featuredProduct"
                  >
                    Sản phẩm nổi bật
                  </label>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <label htmlFor="productDescription">Mô tả sản phẩm</label>
                <textarea
                  className="form-control"
                  id="productDescription"
                  rows={5}
                  placeholder="Nhập mô tả chi tiết về sản phẩm"
                  value={product.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          // View mode
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Tên sản phẩm</label>
                <p>{product.name}</p>
              </div>
              <div className="form-group">
                <label>Mã SKU</label>
                <p>{product.sku}</p>
              </div>
              <div className="form-group">
                <label>Danh mục</label>
                <p>
                  {product.categories.length > 0 ? (
                    <span className="badge badge-info">
                      {product.categories[0]?.name}
                    </span>
                  ) : (
                    "Chưa phân loại"
                  )}
                </p>
              </div>
              <div className="form-group">
                <label>Loại sản phẩm</label>
                <p>
                  {product.categories.length > 1 ? (
                    <span className="badge badge-info">
                      {product.categories[1]?.name}
                    </span>
                  ) : (
                    "Chưa phân loại"
                  )}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Thương hiệu</label>
                <p>{product.brand || "Chưa có thương hiệu"}</p>
              </div>
              <div className="form-group">
                <label>Chất liệu</label>
                <p>{product.material || "Chưa có thông tin"}</p>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <p>
                  {product.status === "active" ? (
                    <span className="badge badge-success">Đang bán</span>
                  ) : product.status === "inactive" ? (
                    <span className="badge badge-danger">Ngừng bán</span>
                  ) : (
                    <span className="badge badge-secondary">Bản nháp</span>
                  )}
                </p>
              </div>
              <div className="form-group">
                <label>Sản phẩm nổi bật</label>
                <p>{product.featured ? "Có" : "Không"}</p>
              </div>
            </div>
            <div className="form-group col-12">
              <label>Mô tả</label>
              <p>{product.description || "Chưa có mô tả"}</p>
            </div>
          </div>
        )}
      </TabPanel>
    );
  }
);

BasicInfoTab.displayName = "BasicInfoTab";

export default BasicInfoTab;
