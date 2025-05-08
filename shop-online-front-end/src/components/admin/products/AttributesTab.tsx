import React, { useCallback } from "react";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

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

interface Suitability {
  id: number;
  name: string;
}

interface AttributesTabProps {
  product: Product; // Sử dụng kiểu Product thay vì ProductAttributes
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
  suitabilities: Suitability[];
  suitabilityLoading: boolean;
  availableColors: { key: string; label: string }[];
  availableSizes: Array<{ value: string; label: string }>;
  tagInput: string;
  setTagInput: React.Dispatch<React.SetStateAction<string>>;
}

const AttributesTab: React.FC<AttributesTabProps> = ({
  product,
  setProduct,
  suitabilities,
  suitabilityLoading,
  availableColors,
  availableSizes,
  tagInput,
  setTagInput,
}) => {
  console.log("AttributesTab availablesizes", availableSizes);
  // Hàm xử lý khi người dùng chọn/bỏ chọn size
  const handleSizeChange = useCallback(
    (size: string, checked: boolean) => {
      setProduct((prev) => {
        // Logic giống như trước, không thay đổi
        if (checked) {
          if (!prev.sizes.includes(size)) {
            const newSizes = [...prev.sizes, size];
            return { ...prev, sizes: newSizes };
          }
        } else {
          const newSizes = prev.sizes.filter((s) => s !== size);
          const newVariants = prev.stock.variants.filter(
            (variant) => variant.size !== size
          );
          return {
            ...prev,
            sizes: newSizes,
            stock: {
              ...prev.stock,
              variants: newVariants,
              total: newVariants.reduce(
                (sum, variant) => sum + variant.stock,
                0
              ),
            },
          };
        }
        return prev;
      });
    },
    [setProduct]
  );

  const handleColorChange = useCallback(
    (color: string, checked: boolean) => {
      setProduct((prev) => {
        // Logic giống như trước, không thay đổi
        if (checked && prev.colors.includes(color)) return prev;
        if (!checked && !prev.colors.includes(color)) return prev;

        if (checked) {
          return { ...prev, colors: [...prev.colors, color] };
        } else {
          const newColors = prev.colors.filter((c) => c !== color);
          const newVariants = prev.stock.variants.filter(
            (variant) => variant.color !== color
          );
          return {
            ...prev,
            colors: newColors,
            stock: {
              ...prev.stock,
              variants: newVariants,
              total: newVariants.reduce(
                (sum, variant) => sum + variant.stock,
                0
              ),
            },
          };
        }
      });
    },
    [setProduct]
  );

  // Hàm chọn tất cả size
  const handleSelectAllSizes = () => {
    setProduct((prev) => ({
      ...prev,
      sizes: availableSizes.map((size) => size.value),
    }));
  };

  // Hàm bỏ chọn tất cả size
  const handleDeselectAllSizes = () => {
    setProduct((prev) => {
      // Loại bỏ tất cả biến thể khi bỏ chọn tất cả size
      const newVariants = prev.stock.variants.filter(() => false);

      return {
        ...prev,
        sizes: [],
        stock: {
          ...prev.stock,
          variants: newVariants,
          total: 0,
        },
      };
    });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !product.tags.includes(value)) {
        setProduct({
          ...product,
          tags: [...product.tags, value],
        });
        setTagInput("");
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    setProduct({
      ...product,
      tags: product.tags.filter((_, index) => index !== indexToRemove),
    });
  };

  // Hàm chọn tất cả màu
  const handleSelectAllColors = () => {
    setProduct((prev) => ({
      ...prev,
      colors: availableColors.map((color) => color.key),
    }));
  };

  // Hàm bỏ chọn tất cả màu
  const handleDeselectAllColors = () => {
    setProduct((prev) => {
      // Loại bỏ tất cả biến thể khi bỏ chọn tất cả màu
      const newVariants = prev.stock.variants.filter(() => false);

      return {
        ...prev,
        colors: [],
        stock: {
          ...prev.stock,
          variants: newVariants,
          total: 0,
        },
      };
    });
  };

  // Hàm xử lý khi người dùng chọn/bỏ chọn suitability
  const handleSuitabilityChange = useCallback(
    (suitability: string, checked: boolean) => {
      setProduct((prev) => {
        if (checked) {
          // Thêm suitability mới nếu chưa có
          if (!prev.suitability.includes(suitability)) {
            return { ...prev, suitability: [...prev.suitability, suitability] };
          }
        } else {
          // Loại bỏ suitability
          return {
            ...prev,
            suitability: prev.suitability.filter((s) => s !== suitability),
          };
        }
        return prev;
      });
    },
    [setProduct]
  );

  // Hàm chọn tất cả suitability
  const handleSelectAllSuitabilities = () => {
    setProduct((prev) => ({
      ...prev,
      suitability: suitabilities.map((item) => item.name),
    }));
  };

  // Hàm bỏ chọn tất cả suitability
  const handleDeselectAllSuitabilities = () => {
    setProduct((prev) => ({
      ...prev,
      suitability: [],
    }));
  };

  return (
    <div className="row">
      <div className="col-md-6">
        <div className="form-group">
          <label>
            Màu sắc <span className="text-danger">*</span>
          </label>
          {/* Thêm nút "Chọn tất cả" và "Bỏ chọn tất cả" */}
          <div className="mb-2">
            <button
              type="button"
              className="btn btn-xs btn-outline-primary mr-2"
              onClick={handleSelectAllColors}
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline-secondary"
              onClick={handleDeselectAllColors}
            >
              Bỏ chọn tất cả
            </button>
          </div>

          {/* Thay thế select bằng checkbox */}
          <div className="d-flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <div
                className="form-check form-check-inline mb-2"
                key={color.key}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`color-${color.key}`}
                  checked={product.colors.includes(color.key)}
                  onChange={(e) =>
                    handleColorChange(color.key, e.target.checked)
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor={`color-${color.key}`}
                >
                  {/* Thêm mẫu màu trước tên màu */}
                  <span
                    className="color-sample mr-1"
                    style={{
                      display: "inline-block",
                      width: "16px",
                      height: "16px",
                      backgroundColor: color.key,
                      border: "1px solid #ddd",
                      marginRight: "5px",
                      verticalAlign: "middle",
                    }}
                  ></span>
                  {color.label}
                </label>
              </div>
            ))}
          </div>

          <small className="form-text text-muted">
            Chọn các màu sắc cho sản phẩm. Bạn sẽ cần tải lên hình ảnh cho mỗi
            màu.
          </small>
        </div>
      </div>
      <div className="col-md-6">
        <div className="form-group">
          <label className="form-label">Kích thước:</label>
          <div className="mb-2">
            <button
              type="button"
              className="btn btn-xs btn-outline-primary mr-2"
              onClick={handleSelectAllSizes}
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline-secondary"
              onClick={handleDeselectAllSizes}
            >
              Bỏ chọn tất cả
            </button>
          </div>

          {availableSizes.length === 0 ? (
            <div className="alert alert-info">
              Chưa có kích thước nào cho loại sản phẩm này. Vui lòng chọn danh
              mục sản phẩm trước.
            </div>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {availableSizes.map((size, index) => (
                <div
                  className="form-check form-check-inline mb-2"
                  key={`${size.value}-${index}`}
                >
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`size-${size.value}`}
                    checked={product.sizes.includes(size.value)}
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
          )}
        </div>
      </div>
      <div className="col-md-6">
        <div className="form-group">
          <label>Phù hợp cho</label>

          {/* Thêm nút "Chọn tất cả" và "Bỏ chọn tất cả" */}
          <div className="mb-2">
            <button
              type="button"
              className="btn btn-xs btn-outline-primary mr-2"
              onClick={handleSelectAllSuitabilities}
              disabled={suitabilityLoading || suitabilities.length === 0}
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline-secondary"
              onClick={handleDeselectAllSuitabilities}
              disabled={suitabilityLoading || suitabilities.length === 0}
            >
              Bỏ chọn tất cả
            </button>
          </div>

          {suitabilityLoading ? (
            <LoadingSpinner size="sm" text="Đang tải..." />
          ) : suitabilities.length === 0 ? (
            <div className="alert alert-warning">Không có dữ liệu phù hợp</div>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {suitabilities.map((item) => (
                <div
                  className="form-check form-check-inline mb-2"
                  key={item.id}
                >
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`suitability-${item.id}`}
                    checked={product.suitability?.includes(item.name) ?? false}
                    onChange={(e) =>
                      handleSuitabilityChange(item.name, e.target.checked)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`suitability-${item.id}`}
                  >
                    {item.name}
                  </label>
                </div>
              ))}
            </div>
          )}
          <small className="form-text text-muted">
            Chọn các loại phù hợp cho sản phẩm của bạn.
          </small>
        </div>
      </div>
      <div className="form-group">
        <label>Tags</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Nhập tag và nhấn Enter hoặc dấu phẩy để thêm"
            value={tagInput}
            onChange={handleTagsChange}
            onKeyDown={handleTagsKeyDown}
            onBlur={() => {
              if (tagInput.trim()) {
                handleTagsKeyDown({
                  key: "Enter",
                  preventDefault: () => {},
                } as React.KeyboardEvent<HTMLInputElement>);
              }
            }}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                if (tagInput.trim()) {
                  handleTagsKeyDown({
                    key: "Enter",
                    preventDefault: () => {},
                  } as React.KeyboardEvent<HTMLInputElement>);
                }
              }}
            >
              <i className="fas fa-plus"></i> Thêm
            </button>
          </div>
        </div>

        <div className="mt-2 d-flex flex-wrap gap-2">
          {product.tags.map((tag, index) => (
            <span
              key={index}
              className="badge badge-primary p-2 mr-1 mb-2 d-inline-flex align-items-center"
            >
              {tag}
              <button
                type="button"
                className="btn-close btn-close-white ml-2 border-0 bg-transparent"
                onClick={() => removeTag(index)}
                aria-label="Xóa"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
export default React.memo(AttributesTab);
