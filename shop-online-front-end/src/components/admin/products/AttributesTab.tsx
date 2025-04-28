import React from "react";

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
  availableSizes: string[];
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
  const handleColorsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setProduct({
      ...product,
      colors: selectedOptions,
    });
  };

  const handleSizesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setProduct({
      ...product,
      sizes: selectedOptions,
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

  return (
    <div className="row">
      <div className="col-md-6">
        <div className="form-group">
          <label>
            Màu sắc <span className="text-danger">*</span>
          </label>
          <select
            multiple
            className="form-control"
            value={product.colors}
            onChange={handleColorsChange}
          >
            {availableColors.map((color) => (
              <option key={color.key} value={color.key}>
                {color.label}
              </option>
            ))}
          </select>
          <small className="form-text text-muted">
            Giữ Ctrl để chọn nhiều màu. Bạn sẽ cần tải lên hình ảnh cho mỗi màu.
          </small>
        </div>
      </div>
      <div className="col-md-6">
        <div className="form-group">
          <label>
            Kích thước <span className="text-danger">*</span>
          </label>
          <select
            multiple
            className="form-control"
            value={product.sizes}
            onChange={handleSizesChange}
          >
            {availableSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <small className="form-text text-muted">
            Giữ Ctrl để chọn nhiều kích thước
          </small>
        </div>
      </div>
      <div className="form-group">
        <label>Phù hợp cho</label>
        <select
          multiple
          className="form-control"
          value={product.suitability}
          onChange={(e) => {
            const selected = Array.from(
              e.target.selectedOptions,
              (option) => option.value
            );
            setProduct({
              ...product,
              suitability: selected,
            });
          }}
          disabled={suitabilityLoading}
        >
          {suitabilityLoading ? (
            <option value="">Đang tải...</option>
          ) : suitabilities.length > 0 ? (
            suitabilities.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))
          ) : (
            <option value="">Không có dữ liệu</option>
          )}
        </select>
        <small className="form-text text-muted">
          {suitabilityLoading
            ? "Đang tải dữ liệu..."
            : "Giữ Ctrl để chọn nhiều mục"}
        </small>
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

export default AttributesTab;
