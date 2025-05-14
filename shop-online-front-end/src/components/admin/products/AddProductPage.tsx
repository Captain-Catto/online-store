"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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

// Các interface giữ nguyên...
interface SizeOption {
  value: string;
  label: string;
}

export interface ColorImage {
  id: number;
  file: File;
  url: string;
  isMain: boolean;
}

interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  parentId?: number | string | null;
  isActive?: boolean;
}

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

  // Sử dụng refs để theo dõi các thay đổi thực sự
  const prevCategoryRef = useRef<string | null>(null);
  const prevColorsRef = useRef<string[]>([]);
  const updatingProductRef = useRef(false);

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
  const [availableSizeOptions, setAvailableSizeOptions] = useState<
    SizeOption[]
  >([]);

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
    suitability: [""],
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
  const breadcrumbItems = useMemo(
    () => [
      { label: "Trang chủ", href: "/admin" },
      { label: "Sản phẩm", href: "/admin/products" },
      { label: "Thêm sản phẩm mới", active: true },
    ],
    []
  );

  // Danh sách màu sắc và kích thước mẫu (đã có useMemo trong code gốc)
  const availableColors = useMemo(
    () => [
      { key: "black", label: "Đen" },
      { key: "white", label: "Trắng" },
      { key: "red", label: "Đỏ" },
      { key: "blue", label: "Xanh dương" },
      { key: "green", label: "Xanh lá" },
      { key: "yellow", label: "Vàng" },
      { key: "grey", label: "Xám" },
    ],
    []
  );

  // Lấy danh sách danh mục khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const data = await CategoryService.getAllCategories();
        const parentCategories = data.filter((cat) => cat.parentId === null);
        setCategoryList(parentCategories);

        // Chỉ cập nhật nếu category hiện tại trống và chưa từng được cập nhật
        if (parentCategories.length > 0 && !product.category) {
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
  }, [product.category, showToast]); // Chạy lại khi product.category hoặc showToast thay đổi

  // Lấy danh mục con khi danh mục cha thay đổi
  useEffect(() => {
    // Kiểm tra xem danh mục đã thực sự thay đổi chưa
    if (product.category === prevCategoryRef.current) return;
    prevCategoryRef.current = product.category;

    const fetchSubtypes = async () => {
      if (!product.category) {
        setSubtypes([]);
        return;
      }

      try {
        setSubtypeLoading(true);
        const childCategories = await CategoryService.getChildCategories(
          product.category
        );
        setSubtypes(childCategories);

        // Xử lý bất đồng bộ an toàn hơn
        if (
          !updatingProductRef.current &&
          (product.subtype !== "" || product.subtypeName !== "")
        ) {
          updatingProductRef.current = true;
          setProduct((prev) => {
            updatingProductRef.current = false;
            return {
              ...prev,
              subtype: "",
              subtypeName: "",
            };
          });
        }
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
  }, [product.category, product.subtype, product.subtypeName, showToast]);

  // Theo dõi màu sắc được chọn (sử dụng useCallback và tránh setState không cần thiết)
  useEffect(() => {
    // So sánh sâu để xác định thay đổi thực sự
    const currentColors = product.colors || [];
    const areColorsSame =
      currentColors.length === prevColorsRef.current.length &&
      currentColors.every((color, i) => color === prevColorsRef.current[i]);

    if (areColorsSame) return;

    // Cập nhật ref danh sách màu hiện tại để so sánh trong lần sau
    prevColorsRef.current = [...currentColors];

    let newSelectedColor = selectedColor;
    let needsUpdate = false;

    if (currentColors.length > 0) {
      if (!selectedColor || !currentColors.includes(selectedColor)) {
        newSelectedColor = currentColors[0];
        needsUpdate = true;
      }
    } else if (selectedColor !== "") {
      newSelectedColor = "";
      needsUpdate = true;
    }

    // Chỉ cập nhật khi thực sự cần thiết
    if (needsUpdate) {
      setSelectedColor(newSelectedColor);
    }
  }, [product.colors, selectedColor]);

  // Tải suitabilities - chỉ chạy một lần khi component mount
  useEffect(() => {
    const fetchSuitabilities = async () => {
      try {
        setSuitabilityLoading(true);
        const data = await ProductService.getSuitabilities();
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
  }, [showToast]); // Đã thêm showToast vào dependency array

  // Tải kích thước dựa trên danh mục
  useEffect(() => {
    if (!product.category || categoryList.length === 0) {
      return;
    }

    const loadSizes = async () => {
      try {
        // Tải tất cả các kích thước từ API
        const sizes = await ProductService.getSizes();
        console.log("All sizes loaded:", sizes);

        // Chuyển category ID về dạng số để so sánh
        const selectedCategoryId = parseInt(product.category);
        console.log("Selected Category ID:", selectedCategoryId);

        // Lọc size theo categoryId thực tế, không dùng getSizeCategory nữa
        const sizeOptions = sizes
          .filter(
            (size) => size.active && size.categoryId === selectedCategoryId
          )
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((size) => ({
            value: size.value,
            label: size.displayName || size.value,
          }));

        console.log("Filtered size options:", sizeOptions);
        setAvailableSizeOptions(sizeOptions);

        // Kiểm tra các size đã chọn, giữ lại những gì vẫn hợp lệ với danh mục mới
        const validSelectedSizes = product.sizes.filter((selectedSize) =>
          sizeOptions.some((option) => option.value === selectedSize)
        );

        // Kiểm tra xem có sự thay đổi thực sự nào không
        const sizesChanged =
          validSelectedSizes.length !== product.sizes.length ||
          !validSelectedSizes.every((size) => product.sizes.includes(size));

        // Nếu sizes thay đổi, cập nhật cả sizes và variants
        if (sizesChanged) {
          setProduct((prev) => {
            // Lọc ra các biến thể có size vẫn còn hợp lệ
            const validVariants = prev.stock.variants.filter((variant) =>
              validSelectedSizes.includes(variant.size)
            );

            // Tính lại tổng tồn kho
            const newTotal = validVariants.reduce(
              (sum, variant) => sum + variant.stock,
              0
            );

            // Hiển thị thông báo nếu có variants bị xóa
            if (validVariants.length < prev.stock.variants.length) {
              showToast(
                "Một số biến thể đã bị xóa do không còn phù hợp với danh mục mới",
                { type: "warning" }
              );
            }

            return {
              ...prev,
              sizes: validSelectedSizes,
              stock: {
                ...prev.stock,
                variants: validVariants,
                total: newTotal,
              },
            };
          });
        }
      } catch (error) {
        console.error("Không thể tải danh sách kích thước:", error);
        showToast("Không thể tải danh sách kích thước", { type: "error" });
        setAvailableSizeOptions([]);
      }
    };

    loadSizes();
  }, [product.category, showToast, categoryList, product.sizes]);

  // Các hàm xử lý (hầu hết đã tốt, thêm useCallback nếu cần)
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setColorImages((prev) => ({
              ...prev,
              [selectedColor]: [...newImages],
            }));
          }
        };
        reader.readAsDataURL(file);
      });

      e.target.value = "";
    },
    [selectedColor, colorImages, showToast]
  );

  // Các hàm xử lý khác có thể thêm useCallback tương tự

  const handleSetMainImage = useCallback(
    (imageId: number) => {
      if (!selectedColor || !colorImages[selectedColor]) return;

      const updatedImages = colorImages[selectedColor].map((img) => ({
        ...img,
        isMain: img.id === imageId,
      }));

      setColorImages((prev) => ({
        ...prev,
        [selectedColor]: updatedImages,
      }));
    },
    [selectedColor, colorImages]
  );

  const handleRemoveImage = useCallback(
    (imageId: number) => {
      if (!selectedColor || !colorImages[selectedColor]) return;

      const updatedImages = colorImages[selectedColor].filter(
        (img) => img.id !== imageId
      );

      if (
        updatedImages.length > 0 &&
        !updatedImages.some((img) => img.isMain)
      ) {
        updatedImages[0].isMain = true;
      }

      setColorImages((prev) => ({
        ...prev,
        [selectedColor]: updatedImages,
      }));
    },
    [selectedColor, colorImages]
  );

  // Các hàm validateProductData và handleSaveProduct giữ nguyên

  const validateProductData = useCallback((): boolean => {
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

    if (product.originalPrice > 0 && product.price > product.originalPrice) {
      showToast("Giá bán phải thấp hơn hoặc bằng giá gốc", { type: "error" });
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
      (color) => !colorImages[color]?.some((img) => img.isMain)
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
  }, [product, colorImages, showToast, setActiveTab]);

  const handleSaveProduct = useCallback(async () => {
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
        suitabilities: product.suitability
          .map((id) => Number(id))
          .filter((id) => !isNaN(id)),
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
  }, [product, colorImages, validateProductData, router, showToast]);

  // Component JSX giữ nguyên
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
                    availableSizes={availableSizeOptions}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                  />
                )}

                {/* Inventory Tab */}
                {activeTab === "inventory" && (
                  <InventoryTab
                    product={product}
                    setProduct={setProduct}
                    availableSizes={availableSizeOptions}
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
