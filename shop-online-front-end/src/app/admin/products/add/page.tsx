"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { ProductService } from "@/services/ProductService";

// Kiểu dữ liệu cho hình ảnh của một màu
interface ColorImage {
  id: number;
  file: File;
  url: string; // URL xem trước
  isMain: boolean;
}

// Kiểu dữ liệu cho thông tin biến thể
interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

export default function AddProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [tagInput, setTagInput] = useState("");

  // State cho sản phẩm mới
  const [product, setProduct] = useState({
    name: "",
    sku: "",
    description: "",
    category: "shirts", // Danh mục mặc định
    categoryName: "Áo",
    brand: "Shop Online",
    material: "",
    price: 0,
    originalPrice: 0,
    suitability: [] as string[],
    stock: {
      total: 0,
      variants: [] as ProductVariant[],
    },
    colors: [] as string[],
    sizes: [] as string[],
    status: "draft", // Mặc định là bản nháp
    statusLabel: "Nháp",
    statusClass: "bg-secondary",
    featured: false,
    tags: [] as string[],
  });

  // State cho hình ảnh theo từng màu sắc
  const [colorImages, setColorImages] = useState<Record<string, ColorImage[]>>(
    {}
  );

  // State cho variant tạm khi thêm mới
  const [newVariant, setNewVariant] = useState({
    color: "",
    size: "",
    stock: 0,
  });

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Sản phẩm", href: "/admin/products" },
    { label: "Thêm sản phẩm mới", active: true },
  ];

  // Danh sách màu sắc và kích thước mẫu
  const availableColors = [
    { key: "black", label: "Đen" },
    { key: "white", label: "Trắng" },
    { key: "red", label: "Đỏ" },
    { key: "blue", label: "Xanh dương" },
    { key: "green", label: "Xanh lá" },
    { key: "yellow", label: "Vàng" },
    { key: "grey", label: "Xám" },
  ];
  const availableSizes = ["S", "M", "L", "XL", "XXL"];

  // Danh sách danh mục mẫu
  const categories = [
    { value: "shirts", label: "Áo" },
    { value: "pants", label: "Quần" },
    { value: "jackets", label: "Áo khoác" },
    { value: "accessories", label: "Phụ kiện" },
  ];

  // Theo dõi màu sắc được chọn
  useEffect(() => {
    if (product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    } else if (product.colors.length === 0) {
      setSelectedColor("");
    } else if (!product.colors.includes(selectedColor)) {
      setSelectedColor(product.colors[0]);
    }
  }, [product.colors, selectedColor]);

  // Hàm xử lý khi chọn hình ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const files = e.target.files;
    if (!files || files.length === 0 || !selectedColor) return;

    // Giới hạn số lượng hình ảnh cho mỗi màu là 3
    const currentImages = colorImages[selectedColor] || [];
    const remainingSlots = 3 - currentImages.length;

    if (remainingSlots <= 0) {
      alert("Mỗi màu chỉ được phép tải lên tối đa 3 hình ảnh");
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots);
    const newImages = [...currentImages];

    selectedFiles.forEach((file, index) => {
      // Tạo ID duy nhất cho hình ảnh
      const uniqueId = Date.now() + index;

      // Tạo URL xem trước
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const newImage: ColorImage = {
            id: uniqueId,
            file,
            url: reader.result,
            isMain: currentImages.length === 0 && index === 0, // Ảnh đầu tiên là ảnh chính
          };

          newImages.push(newImage);

          // Cập nhật state sau khi đọc xong
          setColorImages({
            ...colorImages,
            [selectedColor]: [...newImages],
          });
        }
      };
      reader.readAsDataURL(file);
    });

    // Đặt lại giá trị input file để có thể tải lại cùng một tệp
    e.target.value = "";
  };

  // Hàm đặt hình ảnh làm ảnh chính cho màu đang chọn
  const handleSetMainImage = (imageId: number) => {
    if (!selectedColor || !colorImages[selectedColor]) return;

    const updatedImages = colorImages[selectedColor].map((img) => ({
      ...img,
      isMain: img.id === imageId,
    }));

    setColorImages({
      ...colorImages,
      [selectedColor]: updatedImages,
    });
  };

  // Hàm xóa hình ảnh
  const handleRemoveImage = (imageId: number) => {
    if (!selectedColor || !colorImages[selectedColor]) return;

    const updatedImages = colorImages[selectedColor].filter(
      (img) => img.id !== imageId
    );

    // Nếu xóa hình ảnh chính, cần đặt hình đầu tiên còn lại làm hình chính
    if (updatedImages.length > 0 && !updatedImages.some((img) => img.isMain)) {
      updatedImages[0].isMain = true;
    }

    setColorImages({
      ...colorImages,
      [selectedColor]: updatedImages,
    });
  };

  // Hàm thêm variant mới
  const handleAddVariant = () => {
    if (!newVariant.color || !newVariant.size) {
      alert("Vui lòng chọn màu sắc và kích thước cho biến thể");
      return;
    }

    // Kiểm tra trùng lặp variant
    const isDuplicate = product.stock.variants.some(
      (v) => v.color === newVariant.color && v.size === newVariant.size
    );

    if (isDuplicate) {
      alert("Biến thể này đã tồn tại!");
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

    // Reset form thêm variant
    setNewVariant({
      color: "",
      size: "",
      stock: 0,
    });
  };

  // Hàm xóa variant
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

  // Hàm cập nhật variant
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

  // Hàm xử lý thay đổi màu sắc
  const handleColorsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    // Tạo object mới chứa chỉ các màu sắc đã chọn
    const updatedColorImages: Record<string, ColorImage[]> = {};
    selectedOptions.forEach((color) => {
      if (colorImages[color]) {
        updatedColorImages[color] = colorImages[color];
      } else {
        updatedColorImages[color] = [];
      }
    });

    setProduct({
      ...product,
      colors: selectedOptions,
    });

    // Cập nhật state colorImages, chỉ giữ lại các màu đã chọn
    setColorImages(updatedColorImages);
  };

  // Hàm xử lý thay đổi kích thước
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

  // Hàm xử lý thay đổi tags
  // Cập nhật hàm handleTagsChange
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Xử lý khi nhấn Enter hoặc Tab hoặc dấu phẩy
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

  // Hàm kiểm tra dữ liệu trước khi lưu
  const validateProductData = (): boolean => {
    // Kiểm tra thông tin cơ bản
    if (!product.name) {
      alert("Vui lòng nhập tên sản phẩm");
      setActiveTab("info");
      return false;
    }

    if (!product.sku) {
      alert("Vui lòng nhập mã SKU");
      setActiveTab("info");
      return false;
    }

    if (product.price <= 0) {
      alert("Giá bán phải lớn hơn 0");
      setActiveTab("info");
      return false;
    }

    // Kiểm tra màu sắc và kích thước
    if (product.colors.length === 0) {
      alert("Vui lòng chọn ít nhất một màu sắc");
      setActiveTab("attributes");
      return false;
    }

    if (product.sizes.length === 0) {
      alert("Vui lòng chọn ít nhất một kích thước");
      setActiveTab("attributes");
      return false;
    }

    // Kiểm tra biến thể
    if (product.stock.variants.length === 0) {
      alert("Vui lòng thêm ít nhất một biến thể sản phẩm");
      setActiveTab("inventory");
      return false;
    }

    // Kiểm tra hình ảnh cho từng màu
    const colorsWithoutImages = product.colors.filter(
      (color) => !colorImages[color] || colorImages[color].length === 0
    );

    if (colorsWithoutImages.length > 0) {
      alert(`Các màu sau chưa có hình ảnh: ${colorsWithoutImages.join(", ")}`);
      setActiveTab("images");
      return false;
    }

    // Kiểm tra số lượng hình ảnh của từng màu
    const colorsWithTooFewImages = product.colors.filter(
      (color) => colorImages[color] && colorImages[color].length < 1
    );

    if (colorsWithTooFewImages.length > 0) {
      alert(
        `Các màu sau cần ít nhất 1 hình ảnh: ${colorsWithTooFewImages.join(
          ", "
        )}`
      );
      setActiveTab("images");
      return false;
    }

    // Kiểm tra từng màu có hình chính chưa
    const colorsWithoutMainImage = product.colors.filter(
      (color) => !colorImages[color].some((img) => img.isMain)
    );

    if (colorsWithoutMainImage.length > 0) {
      alert(
        `Các màu sau chưa có hình ảnh chính: ${colorsWithoutMainImage.join(
          ", "
        )}`
      );
      setActiveTab("images");
      return false;
    }

    return true;
  };

  // Hàm xử lý lưu sản phẩm
  const handleSaveProduct = async () => {
    if (!validateProductData()) return;
    setIsSubmitting(true);

    try {
      // Chuyển đổi dữ liệu từ form
      const productData = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        brand: product.brand,
        material: product.material,
        featured: product.featured,
        status: product.status,
        tags: product.tags,
        suitability: product.suitability,
        categories: [parseInt(product.category) || 1],
        details: [] as Array<{
          color: string;
          price: number;
          originalPrice: number;
          sizes: Array<{ size: string; stock: number }>;
        }>,
      };

      // Nhóm variants theo màu sắc
      const colorGroups: Record<
        string,
        {
          color: string;
          price: number;
          originalPrice: number;
          sizes: Array<{ size: string; stock: number }>;
        }
      > = {};

      product.stock.variants.forEach((variant) => {
        if (!colorGroups[variant.color]) {
          colorGroups[variant.color] = {
            color: variant.color,
            price: product.price,
            originalPrice: product.originalPrice,
            sizes: [],
          };
        }

        colorGroups[variant.color].sizes.push({
          size: variant.size,
          stock: variant.stock,
        });
      });

      // Chuyển đổi thành mảng details
      productData.details = Object.values(colorGroups);

      // Chuẩn bị đối tượng lưu trữ file hình ảnh theo màu
      const imageFiles: File[] = [];
      const imageColorMapping: Record<number, string> = {};

      // Chuyển từ state colorImages sang mảng
      let fileIndex = 0;
      const imageMainMapping: Record<number, boolean> = {};

      Object.entries(colorImages).forEach(([color, images]) => {
        images.forEach((img) => {
          imageFiles.push(img.file);
          imageColorMapping[fileIndex] = color;
          imageMainMapping[fileIndex] = img.isMain;
          fileIndex++;
        });
      });

      // Gọi API tạo sản phẩm kèm ảnh
      const result = await ProductService.createProductWithImages(
        productData,
        imageFiles,
        imageColorMapping,
        imageMainMapping
      );

      alert("Thêm sản phẩm thành công!");
      router.push(`/admin/products/${result.productId}`);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      alert(
        `Có lỗi xảy ra: ${
          error instanceof Error ? error.message : "Vui lòng thử lại"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Thêm sản phẩm mới">
      {/* Content Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Thêm sản phẩm mới</h1>
            </div>
            <div className="col-sm-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          {/* Action buttons */}
          <div className="mb-3">
            <Link href="/admin/products" className="btn btn-secondary mr-2">
              <i className="fas fa-arrow-left mr-1"></i> Quay lại
            </Link>
            <button
              className="btn btn-success mr-2"
              onClick={handleSaveProduct}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i> Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-1"></i> Lưu sản phẩm
                </>
              )}
            </button>
          </div>

          {/* Basic Info Card */}
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
                    <label htmlFor="productCategory">Danh mục</label>
                    <select
                      className="form-control"
                      id="productCategory"
                      value={product.category}
                      onChange={(e) => {
                        const selectedCategory = categories.find(
                          (c) => c.value === e.target.value
                        );
                        setProduct({
                          ...product,
                          category: e.target.value,
                          categoryName: selectedCategory
                            ? selectedCategory.label
                            : "",
                        });
                      }}
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
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
                  <label
                    className="custom-control-label"
                    htmlFor="featuredSwitch"
                  >
                    Sản phẩm nổi bật
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for additional info */}
          <div className="card card-primary card-outline card-tabs">
            <div className="card-header p-0 pt-1 border-bottom-0">
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "attributes" ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("attributes");
                    }}
                    href="#"
                  >
                    <i className="fas fa-tags mr-1"></i>
                    Thuộc tính
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "inventory" ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("inventory");
                    }}
                    href="#"
                  >
                    <i className="fas fa-box mr-1"></i>
                    Tồn kho
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "images" ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("images");
                    }}
                    href="#"
                  >
                    <i className="fas fa-images mr-1"></i>
                    Hình ảnh
                  </a>
                </li>
              </ul>
            </div>
            <div className="card-body">
              <div className="tab-content">
                {/* Attributes Tab */}
                <div
                  className={`tab-pane ${
                    activeTab === "attributes" ? "active" : ""
                  }`}
                >
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
                          Giữ Ctrl để chọn nhiều màu. Bạn sẽ cần tải lên hình
                          ảnh cho mỗi màu.
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
                        value={product.suitability || []}
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
                      >
                        <option value="casual">Thường ngày</option>
                        <option value="daily">Hàng ngày</option>
                        <option value="sport">Thể thao</option>
                      </select>
                      <small className="form-text text-muted">
                        Giữ Ctrl để chọn nhiều mục
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
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inventory Tab */}
                <div
                  className={`tab-pane ${
                    activeTab === "inventory" ? "active" : ""
                  }`}
                >
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
                                {color}
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
                        <button
                          className="btn btn-primary mb-3"
                          onClick={handleAddVariant}
                        >
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
                              <td>{variant.color}</td>
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
                              Chưa có biến thể nào. Vui lòng thêm biến thể sản
                              phẩm.
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

                {/* Images Tab */}
                <div
                  className={`tab-pane ${
                    activeTab === "images" ? "active" : ""
                  }`}
                >
                  {product.colors.length === 0 ? (
                    <div className="alert alert-warning">
                      Vui lòng chọn ít nhất một màu sắc trong tab Thuộc tính
                      trước khi tải lên hình ảnh.
                    </div>
                  ) : (
                    <>
                      {/* Màu sắc tabs */}
                      <ul className="nav nav-tabs mb-3">
                        {product.colors.map((color) => (
                          <li className="nav-item" key={color}>
                            <a
                              href="#"
                              className={`nav-link ${
                                color === selectedColor ? "active" : ""
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedColor(color);
                              }}
                            >
                              {color}
                              <span className="badge ml-1 badge-pill badge-secondary">
                                {colorImages[color]?.length || 0}/3
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>

                      {selectedColor && (
                        <div className="mb-4">
                          <h5>Tải lên hình ảnh cho màu: {selectedColor}</h5>
                          {(colorImages[selectedColor]?.length || 0) >= 3 ? (
                            <div className="alert alert-info">
                              Đã đạt giới hạn 3 hình ảnh cho màu này. Nếu muốn
                              thay đổi, hãy xóa một hình trước khi tải lên hình
                              mới.
                            </div>
                          ) : (
                            <div className="custom-file">
                              <input
                                type="file"
                                className="custom-file-input"
                                id="productImages"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                              />
                              <label
                                className="custom-file-label"
                                htmlFor="productImages"
                              >
                                Chọn hình ảnh cho màu {selectedColor} (
                                {colorImages[selectedColor]?.length || 0}/3)
                              </label>
                            </div>
                          )}

                          <div className="mt-3 mb-4">
                            <small className="form-text text-muted">
                              <span className="text-danger">Lưu ý:</span> Mỗi
                              màu sắc cần có tối đa 3 hình ảnh và có 1 hình ảnh
                              chính. Ảnh đầu tiên được tải lên sẽ tự động trở
                              thành ảnh chính.
                            </small>
                          </div>

                          {/* Hiển thị hình ảnh của màu đang chọn */}
                          {colorImages[selectedColor]?.length > 0 ? (
                            <div className="row">
                              {colorImages[selectedColor].map((image) => (
                                <div
                                  key={image.id}
                                  className="col-md-4 col-sm-6 mb-3"
                                >
                                  <div className="card h-100">
                                    <div
                                      className="position-relative"
                                      style={{
                                        height: "0",
                                        paddingBottom: "75%",
                                      }}
                                    >
                                      <Image
                                        src={image.url}
                                        alt={`${product.name} - ${selectedColor}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="card-img-top"
                                        style={{ objectFit: "cover" }}
                                        priority={image.isMain}
                                      />
                                      {image.isMain && (
                                        <div className="position-absolute top-0 left-0 bg-success text-white py-1 px-2">
                                          <i className="fas fa-star mr-1"></i>{" "}
                                          Ảnh chính
                                        </div>
                                      )}
                                    </div>
                                    <div className="card-body">
                                      <div className="d-flex justify-content-between">
                                        <button
                                          className="btn btn-sm btn-danger"
                                          onClick={() =>
                                            handleRemoveImage(image.id)
                                          }
                                        >
                                          <i className="fas fa-trash mr-1"></i>{" "}
                                          Xóa
                                        </button>
                                        {!image.isMain && (
                                          <button
                                            className="btn btn-sm btn-info"
                                            onClick={() =>
                                              handleSetMainImage(image.id)
                                            }
                                          >
                                            <i className="fas fa-star mr-1"></i>{" "}
                                            Đặt làm ảnh chính
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="alert alert-warning">
                              Chưa có hình ảnh nào cho màu {selectedColor}. Vui
                              lòng tải lên ít nhất một hình ảnh.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bảng tổng quan hình ảnh theo màu */}
                      <div className="mt-4">
                        <h5>Tổng quan hình ảnh theo màu</h5>
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Màu sắc</th>
                                <th>Số lượng hình ảnh</th>
                                <th>Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.colors.map((color) => (
                                <tr key={color}>
                                  <td>{color}</td>
                                  <td>{colorImages[color]?.length || 0}/3</td>
                                  <td>
                                    {!colorImages[color] ||
                                    colorImages[color].length === 0 ? (
                                      <span className="badge badge-danger">
                                        Chưa có hình ảnh
                                      </span>
                                    ) : !colorImages[color].some(
                                        (img) => img.isMain
                                      ) ? (
                                      <span className="badge badge-warning">
                                        Chưa có hình chính
                                      </span>
                                    ) : (
                                      <span className="badge badge-success">
                                        Đã hoàn thành
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save button at the bottom */}
          <div className="text-center mb-4">
            <button
              className="btn btn-lg btn-success"
              onClick={handleSaveProduct}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i> Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-1"></i> Lưu sản phẩm
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
