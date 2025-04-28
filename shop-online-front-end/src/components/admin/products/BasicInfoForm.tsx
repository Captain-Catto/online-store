import React from "react";

// Kiểu dữ liệu cho danh mục
interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  parentId?: number | string | null;
  isActive?: boolean;
}

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

interface BasicInfoFormProps {
  product: Product; // Sử dụng kiểu Product thay vì ProductBasicInfo
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
  categoryList: Category[];
  subtypes: Category[];
  categoryLoading: boolean;
  subtypeLoading: boolean;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  product,
  setProduct,
  categoryList,
  subtypes,
  categoryLoading,
  subtypeLoading,
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Thông tin cơ bản</h3>
      </div>
      <div className="card-body">
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
                onChange={(e) =>
                  setProduct({ ...product, name: e.target.value })
                }
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
                onChange={(e) =>
                  setProduct({ ...product, sku: e.target.value })
                }
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
                value={product.category}
                onChange={(e) => {
                  const selectedCategoryId = e.target.value;
                  const selectedCategory = categoryList.find(
                    (c) => c.id.toString() === selectedCategoryId
                  );
                  setProduct({
                    ...product,
                    category: selectedCategoryId,
                    categoryName: selectedCategory ? selectedCategory.name : "",
                    subtype: "",
                    subtypeName: "",
                  });
                }}
                disabled={categoryLoading}
              >
                <option value="">-- Chọn danh mục --</option>
                {categoryList.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categoryLoading && (
                <small className="form-text text-muted">
                  Đang tải danh mục...
                </small>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="productSubtype">Loại sản phẩm</label>
              <select
                className="form-control"
                id="productSubtype"
                value={product.subtype}
                onChange={(e) => {
                  const selectedSubtypeId = e.target.value;
                  const selectedSubtype = subtypes.find(
                    (s) => s.id.toString() === selectedSubtypeId
                  );
                  setProduct({
                    ...product,
                    subtype: selectedSubtypeId,
                    subtypeName: selectedSubtype ? selectedSubtype.name : "",
                  });
                }}
                disabled={subtypeLoading || !product.category}
              >
                <option value="">-- Chọn loại sản phẩm --</option>
                {subtypes.map((subtype) => (
                  <option key={subtype.id} value={subtype.id.toString()}>
                    {subtype.name}
                  </option>
                ))}
              </select>
              {subtypeLoading && (
                <small className="form-text text-muted">
                  Đang tải loại sản phẩm...
                </small>
              )}
              {!subtypeLoading && subtypes.length === 0 && product.category && (
                <small className="form-text text-muted">
                  Không có loại sản phẩm cho danh mục này
                </small>
              )}
              {!product.category && (
                <small className="form-text text-muted">
                  Hãy chọn danh mục trước
                </small>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="productBrand">Thương hiệu</label>
              <input
                type="text"
                className="form-control"
                id="productBrand"
                placeholder="Nhập tên thương hiệu"
                value={product.brand}
                onChange={(e) =>
                  setProduct({ ...product, brand: e.target.value })
                }
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="productPrice">
                Giá bán <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  id="productPrice"
                  placeholder="Nhập giá bán"
                  value={product.price}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  required
                />
                <div className="input-group-append">
                  <span className="input-group-text">VNĐ</span>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="productOriginalPrice">Giá gốc</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  id="productOriginalPrice"
                  placeholder="Nhập giá gốc"
                  value={product.originalPrice}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      originalPrice: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
                <div className="input-group-append">
                  <span className="input-group-text">VNĐ</span>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="productStatus">Trạng thái</label>
              <select
                className="form-control"
                id="productStatus"
                value={product.status}
                onChange={(e) => {
                  const status = e.target.value;
                  setProduct({
                    ...product,
                    status,
                    statusLabel:
                      status === "active"
                        ? "Đang bán"
                        : status === "outofstock"
                        ? "Hết hàng"
                        : "Nháp",
                    statusClass:
                      status === "active"
                        ? "bg-success"
                        : status === "outofstock"
                        ? "bg-danger"
                        : "bg-secondary",
                  });
                }}
              >
                <option value="active">Đang bán</option>
                <option value="outofstock">Hết hàng</option>
                <option value="draft">Nháp</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="productMaterial">Chất liệu</label>
              <input
                type="text"
                className="form-control"
                id="productMaterial"
                placeholder="Ví dụ: 100% Cotton"
                value={product.material}
                onChange={(e) =>
                  setProduct({ ...product, material: e.target.value })
                }
              />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="productDescription">Mô tả sản phẩm</label>
          <textarea
            className="form-control"
            id="productDescription"
            rows={5}
            placeholder="Nhập mô tả chi tiết về sản phẩm"
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
          ></textarea>
        </div>

        <div className="form-group">
          <div className="custom-control custom-switch">
            <input
              type="checkbox"
              className="custom-control-input"
              id="featuredSwitch"
              checked={product.featured}
              onChange={(e) =>
                setProduct({ ...product, featured: e.target.checked })
              }
            />
            <label className="custom-control-label" htmlFor="featuredSwitch">
              Sản phẩm nổi bật
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
