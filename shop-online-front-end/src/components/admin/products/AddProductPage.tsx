"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { useToast } from "@/utils/useToast";
import BasicInfoForm from "./BasicInfoForm";
import AttributesTab from "./AttributesTab";
import InventoryTab from "./InventoryTab";
import ImagesTab from "./ImagesTab";

// Kiểu dữ liệu cho hình ảnh của một màu
interface ColorImage {
  id: number;
  file: File;
  url: string;
  isMain: boolean;
}

// Kiểu dữ liệu cho thông tin biến thể
interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

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

// Kiểu dữ liệu cho sản phẩm
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

export default function AddProductPage() {
  const router = useRouter();
  const { showToast, Toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [tagInput, setTagInput] = useState("");

  // State cho danh mục từ API
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);

  // State cho danh mục con từ API
  const [subtypes, setSubtypes] = useState<Category[]>([]);
  const [subtypeLoading, setSubtypeLoading] = useState<boolean>(false);

  // State cho suitabilities
  const [suitabilities, setSuitabilities] = useState<
    { id: number; name: string }[]
  >([]);
  const [suitabilityLoading, setSuitabilityLoading] = useState(false);

  // State cho sản phẩm mới
  const [product, setProduct] = useState<Product>({
    name: "",
    sku: "",
    description: "",
    category: "",
    categoryName: "",
    brand: "Shop Online",
    subtype: "",
    subtypeName: "",
    material: "",
    price: 0,
    originalPrice: 0,
    suitability: ["casual"],
    stock: {
      total: 0,
      variants: [],
    },
    colors: [],
    sizes: [],
    status: "draft",
    statusLabel: "Nháp",
    statusClass: "bg-secondary",
    featured: false,
    tags: [],
  });

  // State cho hình ảnh theo từng màu sắc
  const [colorImages, setColorImages] = useState<Record<string, ColorImage[]>>(
    {}
  );

  // State cho variant tạm khi thêm mới
  const [newVariant, setNewVariant] = useState<ProductVariant>({
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

  // Lấy danh sách danh mục khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const data = await CategoryService.getAllCategories();
        const parentCategories = data.filter((cat) => cat.parentId === null);
        console.log("Parent categories:", parentCategories);
        setCategoryList(parentCategories);

        if (parentCategories.length > 0) {
          setProduct((prev) => ({
            ...prev,
            category: parentCategories[0].id.toString(),
            categoryName: parentCategories[0].name,
          }));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        showToast("Không thể tải danh mục sản phẩm", { type: "error" });
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, [showToast]);

  // Lấy danh mục con khi danh mục cha thay đổi
  useEffect(() => {
    const fetchSubtypes = async () => {
      if (!product.category) {
        setSubtypes([]);
        return;
      }

      try {
        setSubtypeLoading(true);
        console.log("Fetching subtypes for categoryId:", product.category);
        const childCategories = await CategoryService.getChildCategories(
          product.category
        );
        console.log("Child categories:", childCategories);
        setSubtypes(childCategories);
        setProduct((prev) => ({
          ...prev,
          subtype: "",
          subtypeName: "",
        }));
      } catch (error) {
        console.error("Error fetching subtypes:", error);
        showToast("Không thể tải loại sản phẩm", { type: "error" });
        setSubtypes([]);
      } finally {
        setSubtypeLoading(false);
      }
    };

    if (product.category) {
      fetchSubtypes();
    }
  }, [product.category, showToast]);

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

  // Tải suitabilities
  useEffect(() => {
    const fetchSuitabilities = async () => {
      try {
        setSuitabilityLoading(true);
        const data = await ProductService.getSuitabilities();
        console.log("Suitabilities:", data);
        setSuitabilities(data);
      } catch (error) {
        console.error("Error fetching suitabilities:", error);
        showToast("Không thể tải danh sách phù hợp cho sản phẩm", {
          type: "error",
        });
      } finally {
        setSuitabilityLoading(false);
      }
    };

    fetchSuitabilities();
  }, [showToast]);

  // Hàm xử lý khi chọn hình ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const files = e.target.files;
    if (!files || files.length === 0 || !selectedColor) return;

    const currentImages = colorImages[selectedColor] || [];
    const remainingSlots = 3 - currentImages.length;

    if (remainingSlots <= 0) {
      showToast("Mỗi màu chỉ được phép tải lên tối đa 3 hình ảnh", {
        type: "warning",
      });
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots);
    const newImages = [...currentImages];

    selectedFiles.forEach((file, index) => {
      const uniqueId = Date.now() + index;
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const newImage: ColorImage = {
            id: uniqueId,
            file,
            url: reader.result,
            isMain: currentImages.length === 0 && index === 0,
          };
          newImages.push(newImage);
          setColorImages({
            ...colorImages,
            [selectedColor]: [...newImages],
          });
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  // Hàm đặt hình ảnh làm ảnh chính
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

    if (updatedImages.length > 0 && !updatedImages.some((img) => img.isMain)) {
      updatedImages[0].isMain = true;
    }

    setColorImages({
      ...colorImages,
      [selectedColor]: updatedImages,
    });
  };

  // Hàm kiểm tra dữ liệu trước khi lưu
  const validateProductData = (): boolean => {
    if (!product.name) {
      showToast("Vui lòng nhập tên sản phẩm", { type: "error" });
      setActiveTab("info");
      return false;
    }

    if (!product.sku) {
      showToast("Vui lòng nhập mã SKU", { type: "error" });
      setActiveTab("info");
      return false;
    }

    if (!product.category) {
      showToast("Vui lòng chọn danh mục sản phẩm", { type: "error" });
      setActiveTab("info");
      return false;
    }

    if (product.price <= 0) {
      showToast("Giá bán phải lớn hơn 0", { type: "error" });
      setActiveTab("info");
      return false;
    }

    if (product.colors.length === 0) {
      showToast("Vui lòng chọn ít nhất một màu sắc", { type: "error" });
      setActiveTab("attributes");
      return false;
    }

    if (product.sizes.length === 0) {
      showToast("Vui lòng chọn ít nhất một kích thước", { type: "error" });
      setActiveTab("attributes");
      return false;
    }

    if (product.stock.variants.length === 0) {
      showToast("Vui lòng thêm ít nhất một biến thể sản phẩm", {
        type: "error",
      });
      setActiveTab("inventory");
      return false;
    }

    const colorsWithoutImages = product.colors.filter(
      (color) => !colorImages[color] || colorImages[color].length === 0
    );

    if (colorsWithoutImages.length > 0) {
      showToast(
        `Các màu sau chưa có hình ảnh: ${colorsWithoutImages.join(", ")}`,
        { type: "error" }
      );
      setActiveTab("images");
      return false;
    }

    const colorsWithoutMainImage = product.colors.filter(
      (color) => !colorImages[color].some((img) => img.isMain)
    );

    if (colorsWithoutMainImage.length > 0) {
      showToast(
        `Các màu sau chưa có hình ảnh chính: ${colorsWithoutMainImage.join(
          ", "
        )}`,
        { type: "error" }
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
        categories: [
          parseInt(product.category) || 0,
          ...(product.subtype ? [parseInt(product.subtype)] : []),
        ],
        details: [] as Array<{
          color: string;
          price: number;
          originalPrice: number;
          sizes: Array<{ size: string; stock: number }>;
        }>,
      };

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

      productData.details = Object.values(colorGroups);

      const imageFiles: File[] = [];
      const imageColorMapping: Record<number, string> = {};
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

      const result = await ProductService.createProductWithImages(
        productData,
        imageFiles,
        imageColorMapping,
        imageMainMapping
      );

      showToast("Thêm sản phẩm thành công!", { type: "success" });
      router.push(`/admin/products/${result.productId}`);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      showToast(
        `Có lỗi xảy ra: ${
          error instanceof Error ? error.message : "Vui lòng thử lại"
        }`,
        { type: "error" }
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
          <BasicInfoForm
            product={product}
            setProduct={setProduct}
            categoryList={categoryList}
            subtypes={subtypes}
            categoryLoading={categoryLoading}
            subtypeLoading={subtypeLoading}
          />

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
                {activeTab === "attributes" && (
                  <AttributesTab
                    product={product}
                    setProduct={setProduct}
                    suitabilities={suitabilities}
                    suitabilityLoading={suitabilityLoading}
                    availableColors={availableColors}
                    availableSizes={availableSizes}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                  />
                )}

                {/* Inventory Tab */}
                {activeTab === "inventory" && (
                  <InventoryTab
                    product={product}
                    setProduct={setProduct}
                    availableColors={availableColors}
                    newVariant={newVariant}
                    setNewVariant={setNewVariant}
                  />
                )}

                {/* Images Tab */}
                {activeTab === "images" && (
                  <ImagesTab
                    productColors={product.colors}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    colorImages={colorImages}
                    setColorImages={setColorImages}
                    availableColors={availableColors}
                    handleImageChange={handleImageChange}
                    handleSetMainImage={handleSetMainImage}
                    handleRemoveImage={handleRemoveImage}
                  />
                )}
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

      {/* Toast notifications */}
      {Toast}
    </AdminLayout>
  );
}
