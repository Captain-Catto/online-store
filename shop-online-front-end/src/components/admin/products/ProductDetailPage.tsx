"use client";

import { useState, useEffect, FC, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { useToast } from "@/utils/useToast";
import BasicInfoForm from "./ProductDetail/BasicInfoForm";
import AttributesTab from "./ProductDetail/AttributesTab";
import InventoryTab from "./ProductDetail/InventoryTab";
import ImagesTab from "./ProductDetail/ImagesTab";
import ConfirmModal from "@/components/admin/shared/ConfirmModal";
import { colorToVietnamese } from "@/utils/colorUtils";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { formatCurrency } from "@/utils/currencyUtils";

// Định nghĩa các kiểu dữ liệu
interface ProductDetail {
  id?: number;
  color: string;
  price: number;
  originalPrice: number;
  sizes: SizeVariant[];
}

interface SizeVariant {
  size: string;
  stock: number;
}

// interface ProductImage {
//   id: number | string;
//   url: string;
//   color: string;
//   isMain: boolean;
//   productDetailId?: number;
// }

// interface ModificationHistoryItem {
//   date: string;
//   user: string;
//   action: string;
//   detail: string;
// }

interface Category {
  id: number | string;
  name: string;
  parentId?: number | string | null;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  brand: string;
  material: string;
  featured: boolean;
  status: string;
  tags: string[];
  suitabilities: Array<{ id: number; name: string }>;
  createdAt: string;
  updatedAt: string;
  details: Array<{
    id: number;
    productId: number;
    color: string;
    price: number;
    originalPrice: number;
    inventories: Array<{
      id: number;
      productDetailId: number;
      size: string;
      stock: number;
    }>;
    images: Array<{
      id: number;
      productDetailId: number;
      url: string;
      isMain: boolean;
    }>;
  }>;
  categories: Array<{ id: number; name: string; parentId?: number }>;
}

const ProductDetailPage: FC = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { showToast, Toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [productVariants, setProductVariants] = useState<ProductDetail[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [subtypes, setSubtypes] = useState<Category[]>([]);
  const [suitabilities, setSuitabilities] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [selectedImageColor, setSelectedImageColor] = useState("");
  const [newImages, setNewImages] = useState<
    Array<{ file: File; color: string; isMain: boolean }>
  >([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [removedDetailIds, setRemovedDetailIds] = useState<number[]>([]);
  const [imageDeleteConfirmation, setImageDeleteConfirmation] = useState({
    isOpen: false,
    imageId: null as number | string | null,
    imageColor: "",
  });
  const [variantDeleteConfirmation, setVariantDeleteConfirmation] = useState({
    isOpen: false,
    variantIndex: -1,
    variantColor: "",
  });

  // Danh sách màu sắc khả dụng
  const availableColors = [
    { key: "black", label: "Đen" },
    { key: "white", label: "Trắng" },
    { key: "red", label: "Đỏ" },
    { key: "blue", label: "Xanh dương" },
    { key: "green", label: "Xanh lá" },
    { key: "yellow", label: "Vàng" },
    { key: "grey", label: "Xám" },
  ];

  const [availableSizes, setAvailableSizes] = useState<
    Array<{ value: string; label: string }>
  >([
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
  ]);

  // Lấy dữ liệu sản phẩm
  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      const productData = await ProductService.getProductVariants(id);
      console.log("data productData", productData);
      setProduct(productData);
      setProductVariants(
        productData.details.map((detail) => ({
          id: detail.id,
          color: detail.color,
          price: detail.price,
          originalPrice: detail.originalPrice || detail.price,
          sizes: detail.inventories.map((inv) => ({
            size: inv.size,
            stock: inv.stock,
          })),
        }))
      );
      setSelectedImageColor(
        productData.details.length > 0 ? productData.details[0].color : ""
      );
    } catch {
      setError("Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Sửa hàm fetchData để lấy kích thước theo danh mục
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách danh mục, kích thước, và suitabilities
        const [categories, suitData] = await Promise.all([
          CategoryService.getAllCategories(),
          ProductService.getSuitabilities(),
        ]);
        setCategoryList(categories.filter((cat: Category) => !cat.parentId));
        setSuitabilities(suitData);

        // Lấy kích thước dựa trên danh mục được chọn sẽ được xử lý riêng
      } catch {
        showToast("Không thể tải dữ liệu danh mục hoặc kích thước", {
          type: "error",
        });
      }
    };
    fetchData();
  }, [showToast]);

  // Thêm useEffect mới để lấy kích thước theo danh mục
  useEffect(() => {
    // Chỉ fetch kích thước khi có danh mục cha
    if (!product?.categories || product.categories.length === 0) return;

    const categoryId = product.categories[0]?.id;
    if (!categoryId) return;

    const fetchSizesByCategory = async () => {
      try {
        // Gọi API để lấy kích thước dựa trên danh mục
        const sizes = await ProductService.getSizesByCategory(categoryId);

        setAvailableSizes(
          sizes
            .filter((size: { active: boolean }) => size.active)
            .map((size: { value: string; displayName?: string }) => ({
              value: size.value,
              label: size.displayName || size.value,
            }))
        );
      } catch (error) {
        console.error("Không thể lấy kích thước theo danh mục:", error);
        // Sử dụng kích thước mặc định nếu có lỗi
        setAvailableSizes([
          { value: "S", label: "S" },
          { value: "M", label: "M" },
          { value: "L", label: "L" },
          { value: "XL", label: "XL" },
          { value: "XXL", label: "XXL" },
        ]);
      }
    };

    fetchSizesByCategory();
  }, [product?.categories]);

  // Lấy loại phụ dựa trên danh mục
  useEffect(() => {
    if (!product?.categories[0]?.id) return;
    const fetchSubtypes = async () => {
      try {
        const childCategories = await CategoryService.getChildCategories(
          product.categories[0].id
        );
        setSubtypes(childCategories);
      } catch {
        showToast("Không thể tải loại sản phẩm", { type: "error" });
        setSubtypes([]);
      }
    };
    fetchSubtypes();
  }, [product?.categories, showToast]);

  // Khởi tạo dữ liệu sản phẩm
  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // Xử lý đặt ảnh chính
  const handleSetMainImage = useCallback(
    (imageId: number | string) => {
      if (!product) return;
      const image = product.details
        .flatMap((d) => d.images)
        .find((img) => img.id === imageId);
      if (!image) return;

      setProduct((prev) => {
        if (!prev) return prev;
        const updatedDetails = prev.details.map((detail) => ({
          ...detail,
          images: detail.images.map((img) => ({
            ...img,
            isMain: img.color === image.color ? img.id === imageId : img.isMain,
          })),
        }));
        return { ...prev, details: updatedDetails };
      });

      if (typeof imageId === "number") {
        ProductService.setMainProductImage(product.id, imageId)
          .then(() => showToast("Đã đặt ảnh chính", { type: "success" }))
          .catch(() => showToast("Không thể đặt ảnh chính", { type: "error" }));
      }
    },
    [product, showToast]
  );

  // Xử lý xóa ảnh
  const handleImageDeleteRequest = (imageId: number | string) => {
    // tìm ảnh trong danh sách ảnh của sản phẩm
    const image = product?.details
      .flatMap((d) => d.images)
      .find((img) => img.id === imageId);
    if (!image) return;
    console.log("image", image);
    // tìm tên mầu khi id ảnh được chọn
    const colorName = product?.details.find(
      (d) => d.id === image.productDetailId
    )?.color;

    setImageDeleteConfirmation({
      isOpen: true,
      imageId,
      imageColor: colorName,
    });
  };

  // Sửa lại hàm handleConfirmImageDelete
  const handleConfirmImageDelete = () => {
    const { imageId, imageColor } = imageDeleteConfirmation;
    if (!imageId || !product) return;

    console.log(`Xóa hình ảnh ID: ${imageId}, Màu: ${imageColor}`);

    // Cập nhật state product
    setProduct((prev) => {
      if (!prev) return prev;

      // Tìm detail tương ứng với màu
      const colorDetail = prev.details.find(
        (detail) => detail.color === imageColor
      );

      // Nếu chỉ còn 1 hình, thì không xóa
      if (colorDetail && colorDetail.images.length <= 1) {
        showToast("Mỗi màu phải có ít nhất một hình ảnh", { type: "error" });
        // Trả về nguyên state, không thay đổi
        return prev;
      }

      // Cập nhật lại danh sách hình ảnh
      const updatedDetails = prev.details.map((detail) => {
        if (detail.color === imageColor) {
          // Lọc bỏ hình ảnh cần xóa
          const updatedImages = detail.images.filter(
            (img) => img.id !== imageId
          );

          // Nếu xóa hình chính, thì đặt hình đầu tiên làm hình chính
          if (
            updatedImages.length > 0 &&
            !updatedImages.some((img) => img.isMain)
          ) {
            updatedImages[0].isMain = true;
          }

          return {
            ...detail,
            images: updatedImages,
          };
        }
        return detail;
      });

      return { ...prev, details: updatedDetails };
    });

    // Nếu imageId là số, thêm vào danh sách hình cần xóa ở backend
    if (typeof imageId === "number") {
      setRemovedImageIds((prev) => [...prev, imageId]);
    }

    // Đóng modal xác nhận
    setImageDeleteConfirmation({
      isOpen: false,
      imageId: null,
      imageColor: "",
    });

    showToast("Đã xóa hình ảnh", { type: "success" });
  };

  // Xử lý xóa biến thể
  const handleVariantDeleteRequest = (variantIndex: number) => {
    const variant = productVariants[variantIndex];
    if (!variant) return;

    setVariantDeleteConfirmation({
      isOpen: true,
      variantIndex,
      variantColor: variant.color,
    });
  };

  const handleConfirmVariantDelete = async () => {
    const { variantIndex, variantColor } = variantDeleteConfirmation;
    if (variantIndex < 0 || !product) return;

    const newVariants = [...productVariants];
    const removedVariant = newVariants[variantIndex];
    if (removedVariant.id) {
      setRemovedDetailIds((prev) => [...prev, removedVariant.id]);
    }
    newVariants.splice(variantIndex, 1);
    setProductVariants(newVariants);

    setProduct((prev) => {
      if (!prev) return prev;
      const updatedDetails = prev.details.filter(
        (d) => d.color !== variantColor
      );
      return {
        ...prev,
        details: updatedDetails,
      };
    });

    setVariantDeleteConfirmation({
      isOpen: false,
      variantIndex: -1,
      variantColor: "",
    });
  };

  // Validate dữ liệu sản phẩm
  const validateProductData = useCallback((): boolean => {
    if (!product) return false;

    const checks = [
      [!product.name.trim(), "Vui lòng nhập tên sản phẩm"],
      [!product.sku.trim(), "Vui lòng nhập mã SKU"],
      [!product.categories[0]?.id, "Vui lòng chọn danh mục sản phẩm"],
      [product.details.every((d) => d.price <= 0), "Giá bán phải lớn hơn 0"],
      [
        product.details.length === 0,
        "Vui lòng thêm ít nhất một biến thể sản phẩm",
      ],
      [
        product.suitabilities.length === 0,
        "Vui lòng chọn ít nhất một loại phù hợp",
      ],
    ];

    for (const [condition, message] of checks) {
      if (condition) {
        showToast(message, { type: "error" });
        setActiveTab(
          condition === checks[6][0] || condition === checks[7][0]
            ? "images"
            : condition === checks[4][0]
            ? "variants"
            : "info"
        );
        return false;
      }
    }
    return true;
  }, [product, showToast]);

  // Lưu sản phẩm
  const handleSaveProduct = async () => {
    if (!product || !validateProductData()) return;

    setIsSubmitting(true);
    try {
      const basicInfoData = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        brand: product.brand,
        material: product.material,
        featured: product.featured,
        status: product.status,
        tags: product.tags,
        suitabilities: product.suitabilities.map((s) => s.id),
        categories: product.categories.map((c) => c.id),
      };
      await ProductService.updateProductBasicInfo(product.id, basicInfoData);

      const inventoryData = product.details.map((detail) => ({
        id: detail.id,
        color: detail.color,
        price: detail.price,
        originalPrice: detail.originalPrice,
        sizes: detail.inventories.map((inv) => ({
          size: inv.size,
          stock: inv.stock,
        })),
      }));
      await Promise.all([
        ProductService.updateProductInventory(product.id, inventoryData),
        ProductService.updateProductVariants(product.id, productVariants),
        removedImageIds.length > 0 &&
          ProductService.removeProductImages(product.id, removedImageIds),
        newImages.length > 0 &&
          ProductService.addProductImages(product.id, newImages),
        removedDetailIds.length > 0 &&
          ProductService.removeProductDetails(removedDetailIds),
      ]);

      await fetchProductData();
      setRemovedImageIds([]);
      setRemovedDetailIds([]);
      setNewImages([]);
      setIsEditing(false);
      showToast("Cập nhật sản phẩm thành công!", { type: "success" });
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Lỗi khi cập nhật sản phẩm",
        { type: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thêm biến thể mới
  const addVariant = () => {
    if (!product) return;
    const available = availableColors.find(
      (c) => !product.details.some((d) => d.color === c.key)
    );
    if (!available) {
      showToast("Không còn màu sắc nào để thêm!", { type: "warning" });
      return;
    }

    const newVariant: ProductDetail = {
      color: available.key,
      price: product.details[0]?.price || 0,
      originalPrice: product.details[0]?.originalPrice || 0,
      sizes: [{ size: "M", stock: 0 }],
    };
    setProductVariants([...productVariants, newVariant]);
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            details: [
              ...prev.details,
              {
                ...newVariant,
                id: 0,
                productId: prev.id,
                images: [],
                inventories: newVariant.sizes.map((s) => ({
                  id: 0,
                  productDetailId: 0,
                  size: s.size,
                  stock: s.stock,
                })),
              },
            ],
          }
        : prev
    );
  };

  // Xử lý thay đổi biến thể
  const handleVariantChange = (
    variantIndex: number,
    field: keyof ProductDetail,
    value: string | number
  ) => {
    if (field === "color" && typeof value === "string") {
      if (
        productVariants.some(
          (v, idx) => idx !== variantIndex && v.color === value
        )
      ) {
        showToast(`Màu "${value}" đã tồn tại`, { type: "error" });
        return;
      }
    }

    const newVariants = [...productVariants];
    const oldColor = newVariants[variantIndex].color;
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      [field]: value,
    };
    setProductVariants(newVariants);

    if (field === "color" && typeof value === "string") {
      setProduct((prev) => {
        if (!prev) return prev;
        const updatedDetails = prev.details.map((d) => ({
          ...d,
          color: d.color === oldColor ? value : d.color,
          images: d.images.map((img) => ({
            ...img,
            color: img.color === oldColor ? value : img.color,
          })),
        }));
        return { ...prev, details: updatedDetails };
      });
    }
  };

  // Thêm kích thước cho biến thể
  const addSize = (variantIndex: number) => {
    const newVariants = [...productVariants];
    newVariants[variantIndex].sizes.push({ size: "M", stock: 0 });
    setProductVariants(newVariants);
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            details: prev.details.map((d, i) =>
              i === variantIndex
                ? {
                    ...d,
                    inventories: [
                      ...d.inventories,
                      { id: 0, productDetailId: d.id, size: "M", stock: 0 },
                    ],
                  }
                : d
            ),
          }
        : prev
    );
  };

  // Xóa kích thước khỏi biến thể
  const removeSize = (variantIndex: number, sizeIndex: number) => {
    const newVariants = [...productVariants];
    newVariants[variantIndex].sizes.splice(sizeIndex, 1);
    setProductVariants(newVariants);
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            details: prev.details.map((d, i) =>
              i === variantIndex
                ? {
                    ...d,
                    inventories: d.inventories.filter(
                      (_, idx) => idx !== sizeIndex
                    ),
                  }
                : d
            ),
          }
        : prev
    );
  };

  // Xử lý thay đổi kích thước
  const handleSizeChange = (
    variantIndex: number,
    sizeIndex: number,
    field: keyof SizeVariant,
    value: string | number
  ) => {
    const newVariants = [...productVariants];
    newVariants[variantIndex].sizes[sizeIndex] = {
      ...newVariants[variantIndex].sizes[sizeIndex],
      [field]: value,
    };
    setProductVariants(newVariants);
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            details: prev.details.map((d, i) =>
              i === variantIndex
                ? {
                    ...d,
                    inventories: d.inventories.map((inv, idx) =>
                      idx === sizeIndex ? { ...inv, [field]: value } : inv
                    ),
                  }
                : d
            ),
          }
        : prev
    );
  };

  return (
    <AdminLayout
      title={
        product ? `Chi tiết sản phẩm ${product.name}` : "Chi tiết sản phẩm"
      }
    >
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Chi tiết sản phẩm</h1>
            </div>
            <div className="col-sm-6">
              <Breadcrumb
                items={[
                  { label: "Trang chủ", href: "/admin" },
                  { label: "Sản phẩm", href: "/admin/products" },
                  {
                    label: product
                      ? product.name
                      : loading
                      ? "Đang tải..."
                      : "Chi tiết sản phẩm",
                    active: true,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="mb-3">
            <Link href="/admin/products" className="btn btn-secondary mr-2">
              <i className="fas fa-arrow-left mr-1" /> Quay lại
            </Link>
            {!loading && !error && product && (
              <>
                <button
                  className="btn btn-danger mr-2"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="fas fa-trash mr-1" /> Xóa
                </button>
                {isEditing ? (
                  <>
                    <button
                      className="btn btn-success mr-2"
                      onClick={handleSaveProduct}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-1" /> Đang
                          lưu...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-1" /> Lưu thay đổi
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                    >
                      <i className="fas fa-times mr-1" /> Hủy
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit mr-1" /> Chỉnh sửa
                  </button>
                )}
              </>
            )}
          </div>

          {loading ? (
            <div className="card">
              <div
                className="card-body d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
              >
                <LoadingSpinner
                  size="lg"
                  text="Đang tải thông tin sản phẩm..."
                />
              </div>
            </div>
          ) : error ? (
            <div className="card">
              <div
                className="card-body text-center"
                style={{ minHeight: "300px" }}
              >
                <div className="text-danger mb-3">
                  <i className="fas fa-exclamation-circle fa-3x" />
                </div>
                <h5 className="mb-3">{error}</h5>
                <button
                  className="btn btn-primary"
                  onClick={() => router.push("/admin/products")}
                >
                  <i className="fas fa-arrow-left mr-2" /> Quay lại danh sách
                  sản phẩm
                </button>
              </div>
            </div>
          ) : !product ? (
            <div className="card">
              <div
                className="card-body text-center"
                style={{ minHeight: "300px" }}
              >
                <div className="text-warning mb-3">
                  <i className="fas fa-exclamation-triangle fa-3x" />
                </div>
                <h5 className="mb-3">Không tìm thấy thông tin sản phẩm</h5>
                <button
                  className="btn btn-primary"
                  onClick={() => router.push("/admin/products")}
                >
                  <i className="fas fa-arrow-left mr-2" /> Quay lại danh sách
                  sản phẩm
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Thông tin cơ bản</h3>
                </div>
                <div className="card-body">
                  {isEditing ? (
                    <BasicInfoForm
                      product={product}
                      setProduct={setProduct}
                      categoryList={categoryList}
                      subtypes={subtypes}
                      categoryLoading={false}
                      subtypeLoading={false}
                    />
                  ) : (
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
                                {product.categories[0].name}
                              </span>
                            ) : (
                              <span className="text-muted">Không có</span>
                            )}
                          </p>
                        </div>
                        <div className="form-group">
                          <label>Loại sản phẩm</label>
                          <p>
                            {product.categories.length > 1 ? (
                              <span className="badge badge-info">
                                {product.categories[1].name}
                              </span>
                            ) : (
                              <span className="text-muted">Không có</span>
                            )}
                          </p>
                        </div>
                        <div className="form-group">
                          <label>Thương hiệu</label>
                          <p>{product.brand || "Không có"}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Giá bán</label>
                          <p>
                            {formatCurrency(product.details[0]?.price || 0)}đ
                          </p>
                        </div>
                        <div className="form-group">
                          <label>Giá gốc</label>
                          <p>
                            {formatCurrency(
                              product.details[0]?.originalPrice || 0
                            )}
                            đ
                          </p>
                        </div>
                        <div className="form-group">
                          <label>Trạng thái</label>
                          <p>
                            <span
                              className={`badge badge-${
                                product.status === "active"
                                  ? "success"
                                  : "warning"
                              }`}
                            >
                              {product.status === "active"
                                ? "Hoạt động"
                                : "Bản nháp"}
                            </span>
                          </p>
                        </div>
                        <div className="form-group">
                          <label>Nổi bật</label>
                          <p>
                            <span
                              className={`badge badge-${
                                product.featured ? "success" : "secondary"
                              }`}
                            >
                              {product.featured ? "Có" : "Không"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="form-group col-12">
                        <label>Mô tả</label>
                        <p>{product.description || "Chưa có mô tả"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card card-primary card-outline card-tabs">
                <div className="card-header p-0 pt-1 border-bottom-0">
                  <ul className="nav nav-tabs" role="tablist">
                    {[
                      { id: "info", label: "Chi tiết", icon: "fa-info-circle" },
                      { id: "variants", label: "Biến thể", icon: "fa-cubes" },
                      { id: "inventory", label: "Tồn kho", icon: "fa-box" },
                      { id: "images", label: "Hình ảnh", icon: "fa-images" },
                      { id: "history", label: "Lịch sử", icon: "fa-history" },
                    ].map((tab) => (
                      <li key={tab.id} className="nav-item">
                        <a
                          className={`nav-link ${
                            activeTab === tab.id ? "active" : ""
                          }`}
                          onClick={() => setActiveTab(tab.id)}
                          href={`#${tab.id}-tab`}
                          role="tab"
                          aria-selected={activeTab === tab.id}
                        >
                          <i className={`fas ${tab.icon} mr-1`} /> {tab.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card-body">
                  <div className="tab-content">
                    <div
                      className={`tab-pane ${
                        activeTab === "info" ? "active" : ""
                      }`}
                      id="info-tab"
                    >
                      {isEditing ? (
                        <>
                          {console.log("availableColors", availableColors)}
                          {console.log("availableSizes", availableSizes)}
                          <AttributesTab
                            product={product}
                            setProduct={setProduct}
                            suitabilities={suitabilities}
                            suitabilityLoading={false}
                            availableColors={availableColors}
                            availableSizes={availableSizes}
                            tagInput=""
                            setTagInput={() => {}}
                          />
                        </>
                      ) : (
                        <div className="row">
                          <div className="col-md-6 form-group">
                            <label>Màu sắc</label>
                            <div>
                              {product.details.map((d, i) => (
                                <div
                                  key={i}
                                  className="d-inline-flex align-items-center mr-2 mb-2"
                                >
                                  <div
                                    style={{
                                      backgroundColor: d.color.toLowerCase(),
                                      width: "20px",
                                      height: "20px",
                                      border: "1px solid #ddd",
                                    }}
                                  />
                                  <span className="badge badge-primary ml-1">
                                    {colorToVietnamese[d.color] || d.color}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="col-md-6 form-group">
                            <label>Kích thước</label>
                            <div>
                              {product.details
                                .flatMap((d) =>
                                  d.inventories.map((inv) => inv.size)
                                )
                                .map((size, i) => (
                                  <span
                                    key={i}
                                    className="badge badge-info mr-1"
                                  >
                                    {size}
                                  </span>
                                ))}
                            </div>
                          </div>
                          <div className="col-md-6 form-group">
                            <label>Phù hợp cho</label>
                            <div>
                              {product.suitabilities &&
                              product.suitabilities.length > 0 ? (
                                product.suitabilities.map((s) => (
                                  <span
                                    key={s.id}
                                    className="badge badge-info mr-2 mb-2"
                                  >
                                    {s.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted">
                                  Chưa có thông tin phù hợp
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6 form-group">
                            <label>Tags</label>
                            <div>
                              {product.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="badge badge-secondary mr-1"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className={`tab-pane ${
                        activeTab === "variants" ? "active" : ""
                      }`}
                      id="variants-tab"
                    >
                      {isEditing ? (
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Màu sắc</th>
                                <th>Giá bán</th>
                                <th>Giá gốc</th>
                                <th>Kích thước</th>
                                <th>Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productVariants.map((variant, index) => (
                                <tr key={index}>
                                  <td>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={variant.color}
                                      onChange={(e) =>
                                        handleVariantChange(
                                          index,
                                          "color",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={variant.price}
                                      onChange={(e) =>
                                        handleVariantChange(
                                          index,
                                          "price",
                                          parseInt(e.target.value)
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={variant.originalPrice}
                                      onChange={(e) =>
                                        handleVariantChange(
                                          index,
                                          "originalPrice",
                                          parseInt(e.target.value)
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    {variant.sizes.map(
                                      (sizeItem, sizeIndex) => (
                                        <div
                                          key={sizeIndex}
                                          className="d-flex mb-2"
                                        >
                                          <select
                                            className="form-control mr-2"
                                            value={sizeItem.size}
                                            onChange={(e) =>
                                              handleSizeChange(
                                                index,
                                                sizeIndex,
                                                "size",
                                                e.target.value
                                              )
                                            }
                                          >
                                            {availableSizes.map((size) => (
                                              <option
                                                key={size.value}
                                                value={size.value}
                                              >
                                                {size.label}
                                              </option>
                                            ))}
                                          </select>
                                          <input
                                            type="number"
                                            className="form-control"
                                            value={sizeItem.stock}
                                            onChange={(e) =>
                                              handleSizeChange(
                                                index,
                                                sizeIndex,
                                                "stock",
                                                parseInt(e.target.value)
                                              )
                                            }
                                          />
                                          <button
                                            className="btn btn-danger ml-2"
                                            onClick={() =>
                                              removeSize(index, sizeIndex)
                                            }
                                          >
                                            <i className="fas fa-times" />
                                          </button>
                                        </div>
                                      )
                                    )}
                                    <button
                                      className="btn btn-sm btn-info mt-2"
                                      onClick={() => addSize(index)}
                                    >
                                      <i className="fas fa-plus mr-1" /> Thêm
                                      kích thước
                                    </button>
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() =>
                                        handleVariantDeleteRequest(index)
                                      }
                                    >
                                      <i className="fas fa-trash" /> Xóa
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan={2}>
                                  <button
                                    className="btn btn-success"
                                    onClick={addVariant}
                                  >
                                    <i className="fas fa-plus mr-1" /> Thêm biến
                                    thể
                                  </button>
                                </td>
                                <td colSpan={3}>
                                  <button
                                    className="btn btn-primary"
                                    onClick={async () => {
                                      try {
                                        await ProductService.updateProductVariants(
                                          product.id,
                                          productVariants
                                        );
                                        showToast(
                                          "Cập nhật biến thể thành công!",
                                          { type: "success" }
                                        );
                                        await fetchProductData();
                                      } catch (error) {
                                        showToast(
                                          "Lỗi khi cập nhật: " +
                                            (error instanceof Error
                                              ? error.message
                                              : "Lỗi không xác định"),
                                          {
                                            type: "error",
                                          }
                                        );
                                      }
                                    }}
                                    disabled={isSubmitting}
                                  >
                                    Lưu biến thể
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Màu sắc</th>
                                <th>Giá bán</th>
                                <th>Giá gốc</th>
                                <th>Kích thước</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productVariants.map((variant, index) => (
                                <tr key={index}>
                                  <td>
                                    {colorToVietnamese[variant.color] ||
                                      variant.color}
                                  </td>
                                  <td>{formatCurrency(variant.price)}đ</td>
                                  <td>
                                    {formatCurrency(variant.originalPrice)}đ
                                  </td>
                                  <td>
                                    {variant.sizes
                                      .map((s) => `${s.size}: ${s.stock}`)
                                      .join(", ")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div
                      className={`tab-pane ${
                        activeTab === "inventory" ? "active" : ""
                      }`}
                      id="inventory-tab"
                    >
                      {isEditing ? (
                        <InventoryTab
                          product={product}
                          setProduct={setProduct}
                          availableColors={availableColors}
                          newVariant={{
                            color: product.details[0]?.color || "",
                            size:
                              product.details[0]?.inventories[0]?.size || "",
                            stock: 0,
                          }}
                          setNewVariant={() => {}}
                        />
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Màu sắc</th>
                                <th>Kích thước</th>
                                <th>Số lượng tồn</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.details
                                .flatMap((d) =>
                                  d.inventories.map((inv) => ({
                                    color: d.color,
                                    size: inv.size,
                                    stock: inv.stock,
                                  }))
                                )
                                .map((variant, index) => (
                                  <tr key={index}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <div
                                          style={{
                                            backgroundColor:
                                              variant.color.toLowerCase(),
                                            width: "20px",
                                            height: "20px",
                                            border: "1px solid #ddd",
                                          }}
                                        />
                                        <span className="ml-2">
                                          {colorToVietnamese[variant.color] ||
                                            variant.color}
                                        </span>
                                      </div>
                                    </td>
                                    <td>{variant.size}</td>
                                    <td
                                      className={
                                        variant.stock <= 5
                                          ? "text-danger font-weight-bold"
                                          : ""
                                      }
                                    >
                                      {variant.stock}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <th colSpan={2}>Tổng tồn kho:</th>
                                <th>
                                  {product.details.reduce(
                                    (sum, d) =>
                                      sum +
                                      d.inventories.reduce(
                                        (s, inv) => s + inv.stock,
                                        0
                                      ),
                                    0
                                  )}
                                </th>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>

                    <div
                      className={`tab-pane ${
                        activeTab === "images" ? "active" : ""
                      }`}
                      id="images-tab"
                    >
                      {isEditing ? (
                        <ImagesTab
                          productColors={product.details.map((d) => d.color)}
                          selectedColor={selectedImageColor}
                          setSelectedColor={setSelectedImageColor}
                          colorImages={Object.fromEntries(
                            product.details.map((d) => [d.color, d.images])
                          )}
                          setColorImages={(updatedImages) => {
                            setProduct((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    details: prev.details.map((d) => ({
                                      ...d,
                                      images:
                                        updatedImages[d.color] || d.images,
                                    })),
                                  }
                                : prev
                            );
                          }}
                          availableColors={availableColors}
                          handleImageChange={(e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0 || !product)
                              return;

                            if (
                              !product.details.some(
                                (d) => d.color === selectedImageColor
                              )
                            ) {
                              showToast("Vui lòng chọn màu hợp lệ", {
                                type: "error",
                              });
                              return;
                            }

                            const currentImages = product.details
                              .flatMap((d) => d.images)
                              .filter(
                                (img) => img.color === selectedImageColor
                              );
                            const remainingSlots = 10 - currentImages.length;
                            if (remainingSlots <= 0) {
                              showToast("Tối đa 10 hình ảnh mỗi màu", {
                                type: "warning",
                              });
                              return;
                            }

                            const selectedFiles = Array.from(files).slice(
                              0,
                              remainingSlots
                            );
                            const hasMainImage = currentImages.some(
                              (img) => img.isMain
                            );

                            const newUploadedImages = selectedFiles.map(
                              (file, index) => ({
                                file,
                                color: selectedImageColor,
                                isMain: !hasMainImage && index === 0,
                              })
                            );

                            setNewImages((prev) => [
                              ...prev,
                              ...newUploadedImages,
                            ]);

                            const imageURLs = selectedFiles.map(
                              (file, index) => ({
                                id: `new-${Date.now()}-${Math.random()
                                  .toString(36)
                                  .substring(2, 9)}`,
                                url: URL.createObjectURL(file),
                                color: selectedImageColor,
                                isMain: !hasMainImage && index === 0,
                              })
                            );

                            setProduct((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    details: prev.details.map((d) =>
                                      d.color === selectedImageColor
                                        ? {
                                            ...d,
                                            images: [...d.images, ...imageURLs],
                                          }
                                        : d
                                    ),
                                  }
                                : prev
                            );
                            e.target.value = "";
                          }}
                          handleSetMainImage={handleSetMainImage}
                          handleRemoveImage={handleImageDeleteRequest}
                        />
                      ) : (
                        <ImagesTab
                          productColors={product.details.map((d) => d.color)}
                          selectedColor={selectedImageColor}
                          setSelectedColor={setSelectedImageColor}
                          colorImages={Object.fromEntries(
                            product.details.map((d) => [d.color, d.images])
                          )}
                          setColorImages={() => {}}
                          availableColors={availableColors}
                          handleImageChange={() => {}}
                          handleSetMainImage={handleSetMainImage}
                          handleRemoveImage={handleImageDeleteRequest} // Đảm bảo truyền hàm này
                          viewMode={false} // Đổi thành false khi bạn muốn chỉnh sửa
                        />
                      )}
                    </div>

                    {/* <div
                      className={`tab-pane ${
                        activeTab === "history" ? "active" : ""
                      }`}
                      id="history-tab"
                    >
                      <ul className="timeline-inverse">
                        {product.modificationHistory.map((item, index) => (
                          <li key={index}>
                            <div className="timeline-item">
                              <span className="time">
                                <i className="fas fa-clock" /> {item.date}
                              </span>
                              <h3 className="timeline-header">
                                <a href="#">{item.user}</a> - {item.action}
                              </h3>
                              <div className="timeline-body">{item.detail}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div> */}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Xác nhận xóa sản phẩm"
          message={`Bạn có chắc chắn muốn xóa sản phẩm "${product?.name}"? Hành động này không thể hoàn tác.`}
          confirmLabel="Xóa"
          cancelLabel="Hủy"
          confirmButtonClass="btn-danger"
          onConfirm={async () => {
            try {
              await ProductService.deleteProduct(String(product?.id));
              showToast("Đã xóa sản phẩm thành công!", { type: "success" });
              router.push("/admin/products");
            } catch (err) {
              showToast(
                err instanceof Error ? err.message : "Lỗi khi xóa sản phẩm",
                { type: "error" }
              );
            } finally {
              setShowDeleteModal(false);
            }
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={imageDeleteConfirmation.isOpen}
        title="Xác nhận xóa ảnh"
        message={`Xóa hình ảnh của màu ${
          colorToVietnamese[imageDeleteConfirmation.imageColor] ||
          imageDeleteConfirmation.imageColor
        }?`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmButtonClass="btn-danger"
        onConfirm={handleConfirmImageDelete}
        onCancel={() =>
          setImageDeleteConfirmation({
            isOpen: false,
            imageId: null,
            imageColor: "",
          })
        }
      />

      <ConfirmModal
        isOpen={variantDeleteConfirmation.isOpen}
        title="Xác nhận xóa biến thể"
        message={`Xóa biến thể màu ${
          colorToVietnamese[variantDeleteConfirmation.variantColor] ||
          variantDeleteConfirmation.variantColor
        }?`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmButtonClass="btn-danger"
        onConfirm={handleConfirmVariantDelete}
        onCancel={() =>
          setVariantDeleteConfirmation({
            isOpen: false,
            variantIndex: -1,
            variantColor: "",
          })
        }
      />

      {Toast}
    </AdminLayout>
  );
};

export default ProductDetailPage;
