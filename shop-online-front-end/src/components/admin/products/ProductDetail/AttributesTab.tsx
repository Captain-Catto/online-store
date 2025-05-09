import React, { useCallback } from "react";
import { FormattedProduct } from "../ProductDetailPage";

interface Suitability {
  id: number;
  name: string;
}

interface AttributesTabProps {
  product: FormattedProduct; // Sử dụng kiểu Product thay vì ProductAttributes
  setProduct: React.Dispatch<React.SetStateAction<FormattedProduct | null>>;
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
  // Hàm xử lý khi người dùng chọn/bỏ chọn size
  const handleSizeChange = useCallback(
    (size: string, checked: boolean) => {
      setProduct((prev) => {
        if (!prev) return prev;

        if (checked) {
          if (!prev.sizes.includes(size)) {
            const newSizes = [...prev.sizes, size];
            return { ...prev, sizes: newSizes };
          }
        } else {
          // Rest of the code...
        }
        return prev;
      });
    },
    [setProduct]
  );

  const handleColorChange = useCallback(
    (color: string, checked: boolean) => {
      setProduct((prev) => {
        if (!prev) return null;

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

  // Cập nhật các hàm chọn tất cả và bỏ chọn tất cả:
  const handleSelectAllSizes = () => {
    setProduct((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sizes: availableSizes.map((size) => size.value),
      };
    });
  };

  const handleDeselectAllSizes = () => {
    setProduct((prev) => {
      if (!prev) return prev; // ko có product thì return null

      // Loại bỏ tất cả biến thể khi bỏ chọn tất cả size
      const newVariants = prev?.stock.variants.filter(() => false) || [];

      return {
        ...prev,
        sizes: [],
        stock: {
          ...prev.stock,
          variants: newVariants,
          total: 0,
        },
      } as FormattedProduct; // Đảm bảo kiểu trả về là FormattedProduct
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
        setProduct((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tags: [...prev.tags, value],
          } as FormattedProduct;
        });
        setTagInput("");
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    setProduct((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tags: prev.tags.filter((_, index) => index !== indexToRemove),
      } as FormattedProduct;
    });
  };

  // Hàm chọn tất cả màu
  const handleSelectAllColors = () => {
    setProduct((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        colors: availableColors.map((color) => color.key),
      } as FormattedProduct;
    });
  };

  // Hàm bỏ chọn tất cả màu
  const handleDeselectAllColors = () => {
    setProduct((prev) => {
      if (!prev) return prev; // Thêm kiểm tra null

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
      } as FormattedProduct; // Thêm type casting
    });
  };

  // Hàm xử lý khi người dùng chọn/bỏ chọn suitability
  const handleSuitabilityChange = useCallback(
    (suitabilityId: number, checked: boolean) => {
      setProduct((prev) => {
        if (!prev) return prev;

        if (checked) {
          // Thêm ID vào mảng nếu chưa có
          if (!prev.suitabilities.includes(suitabilityId)) {
            return {
              ...prev,
              suitabilities: [...prev.suitabilities, suitabilityId],
            } as FormattedProduct;
          }
        } else {
          // Xóa ID khỏi mảng
          return {
            ...prev,
            suitabilities: prev.suitabilities.filter(
              (id) => id !== suitabilityId
            ),
          } as FormattedProduct;
        }
        return prev;
      });
    },
    [setProduct]
  );

  // Hàm chọn tất cả suitability
  const handleSelectAllSuitabilities = () => {
    setProduct((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        suitabilities: suitabilities.map((item) => item.id),
      } as FormattedProduct;
    });
  };

  // Hàm bỏ chọn tất cả suitability
  const handleDeselectAllSuitabilities = () => {
    setProduct((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        suitabilities: [],
      } as FormattedProduct;
    });
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
              disabled
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline-secondary"
              onClick={handleDeselectAllSizes}
              disabled
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
                    disabled
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`size-${size.value}`}
                  >
                    {size.label}
                  </label>
                </div>
              ))}
              {/* thêm dòng chữ xám */}
              <small className="form-text text-muted">
                Nếu thêm biến thể mới, hay qua tab &quot;Biến thể&quot; để thêm
                kích thước và số lượng sản phẩm
              </small>
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
            <div className="alert alert-info">Đang tải dữ liệu...</div>
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
                    checked={product.suitabilities.includes(item.id)}
                    // Sử dụng ID trực tiếp
                    onChange={
                      (e: React.ChangeEvent<HTMLInputElement>) =>
                        handleSuitabilityChange(item.id, e.target.checked) // Truyền ID
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
