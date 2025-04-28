"use client";

import { useState, useEffect, FC } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { useToast } from "@/utils/useToast";
import BasicInfoForm from "./BasicInfoForm";
import AttributesTab from "./AttributesTab";
import InventoryTab from "./InventoryTab";
import ImagesTab from "./ImagesTab";

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

interface ProductImage {
  id: number | string;
  url: string;
  color: string;
  isMain: boolean;
  productDetailId?: number;
}

interface StockVariant {
  color: string;
  size: string;
  stock: number;
  detailId?: number;
}

interface ModificationHistoryItem {
  date: string;
  user: string;
  action: string;
  detail: string;
}

interface FormattedProduct {
  id: number;
  name: string;
  sku: string;
  description: string;
  category: number | string;
  categoryName: string;
  subtype: number | string;
  subtypeName: string;
  material: string;
  brand: string;
  price: number;
  originalPrice: number;
  stock: {
    total: number;
    variants: StockVariant[];
  };
  colors: string[];
  sizes: string[];
  status: string;
  statusLabel: string;
  statusClass: string;
  featured: boolean;
  tags: string[];
  suitability: string[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
  modificationHistory: ModificationHistoryItem[];
  details: Array<{
    id: number;
    color: string;
    price: number;
    originalPrice: number;
    sizes: Array<{ size: string; stock: number }>;
    images: Array<{ id: number; url: string; isMain: boolean }>;
  }>;
  categories: Array<{ id: number; name: string }>;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface NewImage {
  file: File;
  color: string;
  isMain: boolean;
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

// API response types
interface ProductApiResponse {
  id: number;
  name: string;
  sku: string;
  description: string;
  brand: string;
  material: string;
  featured: boolean;
  status: string;
  tags: string[] | string;
  suitability: string[] | string;
  createdAt: string;
  updatedAt: string;
  details: ProductDetailApiResponse[];
  categories: { id: number; name: string; parentId?: number }[];
}

interface ProductDetailApiResponse {
  id: number;
  productId: number;
  color: string;
  price: number;
  originalPrice: number;
  createdAt: string;
  updatedAt: string;
  inventories: {
    id: number;
    productDetailId: number;
    size: string;
    stock: number;
  }[];
  images: {
    id: number;
    productDetailId: number;
    url: string;
    isMain: boolean;
    displayOrder: number;
  }[];
}

const ProductDetailPage: FC = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { showToast, Toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("info");

  // States cho việc chỉnh sửa
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] =
    useState<FormattedProduct | null>(null);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [removedDetailIds, setRemovedDetailIds] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [productVariants, setProductVariants] = useState<ProductDetail[]>([]);
  const [product, setProduct] = useState<FormattedProduct | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [subtypes, setSubtypes] = useState<Category[]>([]);
  const [subtypeLoading, setSubtypeLoading] = useState<boolean>(false);
  const [suitabilities, setSuitabilities] = useState<
    { id: number; name: string }[]
  >([]);
  const [suitabilityLoading, setSuitabilityLoading] = useState(false);
  const [selectedImageColor, setSelectedImageColor] = useState<string>("");

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

  /**
   * Hàm tiện ích để định dạng dữ liệu sản phẩm từ API
   */
  const formatProductData = (
    productData: ProductApiResponse
  ): FormattedProduct => {
    const parentCategory = productData.categories.find(
      (c: { id: number; name: string; parentId?: number }) => !c.parentId
    );
    const subCategory = productData.categories.find(
      (c: { id: number; name: string; parentId?: number }) => c.parentId
    );

    const tags =
      typeof productData.tags === "string"
        ? JSON.parse(productData.tags as string)
        : productData.tags;

    const suitability =
      typeof productData.suitability === "string"
        ? JSON.parse(productData.suitability as string)
        : productData.suitability;

    const totalStock = productData.details.reduce((total, detail) => {
      return (
        total + detail.inventories.reduce((sum, inv) => sum + inv.stock, 0)
      );
    }, 0);

    const colors = productData.details.map((detail) => detail.color);
    const sizes = [
      ...new Set(
        productData.details.flatMap((detail) =>
          detail.inventories.map((inv) => inv.size)
        )
      ),
    ];

    const stockVariants = productData.details.flatMap((detail) =>
      detail.inventories.map((inv) => ({
        color: detail.color,
        size: inv.size,
        stock: inv.stock,
        detailId: detail.id,
      }))
    );

    const images = productData.details.flatMap((detail) =>
      detail.images.map((image) => ({
        ...image,
        color: detail.color,
        productDetailId: detail.id,
      }))
    );

    const details = productData.details.map((detail) => ({
      id: detail.id,
      color: detail.color,
      price: detail.price,
      originalPrice: detail.originalPrice,
      sizes: detail.inventories.map((inv) => ({
        size: inv.size,
        stock: inv.stock,
      })),
      images: detail.images.map((img) => ({
        id: img.id,
        url: img.url,
        isMain: img.isMain,
      })),
    }));

    return {
      id: productData.id,
      name: productData.name,
      sku: productData.sku,
      description: productData.description,
      category: parentCategory?.id || 0,
      categoryName: parentCategory?.name || "",
      subtype: subCategory?.id || "",
      subtypeName: subCategory?.name || "",
      material: productData.material,
      brand: productData.brand || "",
      price: productData.details[0]?.price || 0,
      originalPrice: productData.details[0]?.originalPrice || 0,
      stock: {
        total: totalStock,
        variants: stockVariants,
      },
      colors,
      sizes,
      status: productData.status,
      statusLabel:
        productData.status === "active"
          ? "Đang bán"
          : productData.status === "outofstock"
          ? "Hết hàng"
          : "Nháp",
      statusClass:
        productData.status === "active"
          ? "bg-success"
          : productData.status === "outofstock"
          ? "bg-danger"
          : "bg-secondary",
      featured: productData.featured,
      tags,
      suitability,
      images,
      createdAt: new Date(productData.createdAt).toLocaleDateString("vi-VN"),
      updatedAt: new Date(productData.updatedAt).toLocaleDateString("vi-VN"),
      modificationHistory: [
        {
          date: new Date(productData.updatedAt).toLocaleString("vi-VN"),
          user: "Admin",
          action: "Cập nhật sản phẩm",
          detail: "Cập nhật thông tin sản phẩm",
        },
        {
          date: new Date(productData.createdAt).toLocaleString("vi-VN"),
          user: "Admin",
          action: "Tạo sản phẩm",
          detail: "Tạo mới sản phẩm",
        },
      ],
      details,
      categories: productData.categories,
    };
  };

  // Fetch dữ liệu sản phẩm
  useEffect(() => {
    const fetchProduct = async (): Promise<void> => {
      try {
        setLoading(true);
        const productData = await ProductService.getProductVariants(id);

        // Set biến thể sản phẩm
        setProductVariants(
          productData.details.map(
            (detail: ProductDetailApiResponse): ProductDetail => ({
              id: detail.id,
              color: detail.color,
              price: detail.price,
              originalPrice: detail.originalPrice,
              sizes: detail.inventories.map(
                (inv): SizeVariant => ({
                  size: inv.size,
                  stock: inv.stock,
                })
              ),
            })
          )
        );

        // Định dạng và set dữ liệu sản phẩm
        const formattedProduct = formatProductData(productData);
        setProduct(formattedProduct);
        setSelectedImageColor(formattedProduct.colors[0] || "");
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Lấy danh sách danh mục khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const data = await CategoryService.getAllCategories();
        const parentCategories = data.filter((cat) => cat.parentId === null);
        console.log("Parent categories:", parentCategories);
        setCategoryList(parentCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showToast("Không thể tải danh mục sản phẩm", { type: "error" });
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Lấy danh mục con khi danh mục cha thay đổi
  useEffect(() => {
    const fetchSubtypes = async () => {
      if (!product?.category) {
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
      } catch (error) {
        console.error("Error fetching subtypes:", error);
        showToast("Không thể tải loại sản phẩm", { type: "error" });
        setSubtypes([]);
      } finally {
        setSubtypeLoading(false);
      }
    };

    if (product?.category) {
      fetchSubtypes();
    }
  }, [product?.category]);

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
  }, []);

  // // Hàm xử lý thay đổi màu sắc
  // const handleColorsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedOptions = Array.from(
  //     e.target.selectedOptions,
  //     (option) => option.value
  //   );

  //   const removedColors = product!.colors.filter(
  //     (color) => !selectedOptions.includes(color)
  //   );

  //   const detailsToRemove = product!.details
  //     .filter((detail) => removedColors.includes(detail.color))
  //     .map((detail) => detail.id);

  //   setRemovedDetailIds((prev) => [
  //     ...prev,
  //     ...detailsToRemove.filter((id) => !prev.includes(id)),
  //   ]);

  //   setProduct((prev) => {
  //     if (!prev) return prev;
  //     return {
  //       ...prev,
  //       colors: selectedOptions,
  //     };
  //   });

  //   const updatedImages = [...product!.images];
  //   removedColors.forEach((color) => {
  //     const imagesToRemove = product!.images
  //       .filter((img) => img.color === color)
  //       .map((img) => Number(img.id));
  //     setRemovedImageIds((prev) => [
  //       ...prev,
  //       ...imagesToRemove.filter((id) => !prev.includes(id)),
  //     ]);
  //   });

  //   setProduct((prev) => {
  //     if (!prev) return prev;
  //     return {
  //       ...prev,
  //       images: updatedImages.filter(
  //         (img) => !removedColors.includes(img.color)
  //       ),
  //     };
  //   });
  // };

  // // Hàm xử lý thay đổi kích thước
  // const handleSizesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedOptions = Array.from(
  //     e.target.selectedOptions,
  //     (option) => option.value
  //   );
  //   setProduct((prev) => {
  //     if (!prev) return prev;
  //     return {
  //       ...prev,
  //       sizes: selectedOptions,
  //     };
  //   });
  // };

  // Hàm xử lý thay đổi tags
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !product!.tags.includes(value)) {
        setProduct((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tags: [...prev.tags, value],
          };
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
      };
    });
  };

  // Hàm đặt hình ảnh làm ảnh chính cho từng màu sắc
  const handleSetMainImage = (imageId: number | string) => {
    // Tìm hình ảnh được chọn làm ảnh chính
    const imageToSetAsMain = product?.images.find((img) => img.id === imageId);
    if (!imageToSetAsMain) return;

    const imageColor = imageToSetAsMain.color;

    // Kiểm tra xem hình này đã là hình chính cho màu này chưa
    if (imageToSetAsMain.isMain) {
      console.log("[Debug] Hình ảnh đã là hình chính cho màu này rồi");
      return;
    }

    setProduct((prev) => {
      if (!prev) return prev;
      // Chỉ cập nhật isMain cho hình ảnh của cùng màu sắc
      const updatedImages = prev.images.map((img) => ({
        ...img,
        isMain: img.color === imageColor ? img.id === imageId : img.isMain,
      }));
      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  // Hàm xóa hình ảnh
  const handleRemoveImage = (imageId: number | string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hình ảnh này?")) return;

    setProduct((prev) => {
      if (!prev) return prev;
      const updatedImages = prev.images.filter((img) => img.id !== imageId);

      // Nếu hình ảnh bị xóa đã tồn tại trong DB (id là số), thêm vào danh sách removedImageIds
      if (typeof imageId === "number") {
        setRemovedImageIds((prev) => [...prev, imageId]);
      }

      const color = prev.images.find((img) => img.id === imageId)?.color;
      if (color) {
        const imagesForColor = updatedImages.filter(
          (img) => img.color === color
        );
        if (
          imagesForColor.length > 0 &&
          !imagesForColor.some((img) => img.isMain)
        ) {
          imagesForColor[0].isMain = true;
        }
      }

      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  // Hàm kiểm tra dữ liệu trước khi lưu
  const validateProductData = (): boolean => {
    if (!product) return false;

    if (!product.name.trim()) {
      showToast("Vui lòng nhập tên sản phẩm", { type: "error" });
      setActiveTab("info");
      return false;
    }

    if (!product.sku.trim()) {
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
      setActiveTab("info");
      return false;
    }

    if (product.sizes.length === 0) {
      showToast("Vui lòng chọn ít nhất một kích thước", { type: "error" });
      setActiveTab("info");
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
      (color) => !product.images.some((img) => img.color === color)
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
      (color) =>
        !product.images.some((img) => img.color === color && img.isMain)
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

  const checkDuplicateColorVariants = (variants: ProductDetail[]): string[] => {
    const colorCounts: Record<string, number> = {};
    const duplicates: string[] = [];

    variants.forEach((variant) => {
      if (!variant.color) return; // Skip variants with undefined color

      colorCounts[variant.color] = (colorCounts[variant.color] || 0) + 1;
      if (
        colorCounts[variant.color] > 1 &&
        !duplicates.includes(variant.color)
      ) {
        duplicates.push(variant.color);
      }
    });

    return duplicates;
  };

  // Hàm xử lý cập nhật biến thể
  const handleVariantsUpdate = async () => {
    console.log("[Debug] Starting variants-only update...");

    if (!product) {
      showToast("Không có dữ liệu sản phẩm", { type: "error" });
      return false;
    }

    // Validate variants before sending
    const duplicateColors = checkDuplicateColorVariants(productVariants);
    if (duplicateColors.length > 0) {
      showToast(`Phát hiện màu trùng lặp: ${duplicateColors.join(", ")}`, {
        type: "error",
      });
      return false;
    }

    // Check for empty colors
    const emptyColors = productVariants.some((v) => !v.color);
    if (emptyColors) {
      showToast("Tất cả các biến thể phải có màu sắc", { type: "error" });
      return false;
    }

    // Validate that every variant has at least one size
    const emptySizes = productVariants.some(
      (v) => !v.sizes || v.sizes.length === 0
    );
    if (emptySizes) {
      showToast("Mỗi biến thể phải có ít nhất một kích cỡ", { type: "error" });
      return false;
    }

    // Validate prices
    const invalidPrices = productVariants.some(
      (v) => v.price <= 0 || (v.originalPrice && v.originalPrice < v.price)
    );
    if (invalidPrices) {
      showToast("Giá sản phẩm không hợp lệ. Vui lòng kiểm tra lại.", {
        type: "error",
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      console.log("[Debug] Variants data to update:", productVariants);

      // Call the API endpoint to update variants
      await ProductService.updateProductVariants(product.id, productVariants);

      // Update modification history
      const newHistoryItem = {
        date: new Date().toLocaleString("vi-VN"),
        user: "Admin",
        action: "Cập nhật biến thể",
        detail: "Cập nhật thông tin biến thể sản phẩm",
      };

      // Update product state with the new history item
      setProduct((prev) => {
        if (!prev) return prev;

        // Calculate total stock based on updated variants
        const totalStock = productVariants.reduce(
          (sum, variant) =>
            sum +
            variant.sizes.reduce(
              (variantSum, size) => variantSum + size.stock,
              0
            ),
          0
        );

        // Update stock variants
        const stockVariants = [];
        for (const variant of productVariants) {
          for (const size of variant.sizes) {
            stockVariants.push({
              color: variant.color,
              size: size.size,
              stock: size.stock,
              detailId: variant.id,
            });
          }
        }

        // Create a list of unique colors from variants
        const uniqueColors = [...new Set(productVariants.map((v) => v.color))];

        // Create a list of unique sizes from variants
        const uniqueSizes = [
          ...new Set(
            productVariants.flatMap((v) => v.sizes.map((s) => s.size))
          ),
        ];

        return {
          ...prev,
          colors: uniqueColors,
          sizes: uniqueSizes,
          stock: {
            total: totalStock,
            variants: stockVariants,
          },
          modificationHistory: [newHistoryItem, ...prev.modificationHistory],
        };
      });

      showToast("Cập nhật biến thể thành công!", { type: "success" });

      return true;
    } catch (error) {
      console.error("[Error] Failed to update variants:", error);
      showToast(
        `Lỗi cập nhật biến thể: ${
          error instanceof Error ? error.message : "Vui lòng thử lại"
        }`,
        { type: "error" }
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm xử lý cập nhật sản phẩm
  const handleSaveProduct = async () => {
    console.log("[Debug] Starting product save process...");
    console.log("[Debug] Current product state:", product);
    if (!validateProductData()) return;
    console.log("[Debug] Product validation successful");

    setIsSubmitting(true);

    try {
      // 1. Cập nhật thông tin cơ bản
      console.log("[Debug] Updating basic product info");
      const basicInfoData = {
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
          parseInt(String(product.category), 10),
          ...(product.subtype ? [parseInt(String(product.subtype), 10)] : []),
        ],
      };
      console.log("[Debug] Basic info payload:", basicInfoData);

      // Validate variants before saving
      const duplicateColors = checkDuplicateColorVariants(productVariants);
      if (duplicateColors.length > 0) {
        showToast(`Phát hiện màu trùng lặp: ${duplicateColors.join(", ")}`, {
          type: "error",
        });
        setActiveTab("variants");
        setIsSubmitting(false);
        return;
      }

      // Check for empty colors
      const emptyColors = productVariants.some((v) => !v.color);
      if (emptyColors) {
        showToast("Tất cả các biến thể phải có màu sắc", { type: "error" });
        setActiveTab("variants");
        setIsSubmitting(false);
        return;
      }

      await ProductService.updateProductBasicInfo(product.id, basicInfoData);
      showToast("Cập nhật thông tin cơ bản thành công!", { type: "success" });

      // 2. Cập nhật tồn kho
      console.log("[Debug] Updating inventory");
      const inventoryData = product.colors.map((color) => {
        const colorVariants = product.stock.variants.filter(
          (v) => v.color === color
        );
        const existingDetailId = colorVariants[0]?.detailId;

        return {
          id: existingDetailId,
          color,
          price: product.price,
          originalPrice: product.originalPrice,
          sizes: colorVariants.map((v) => ({
            size: v.size,
            stock: v.stock,
          })),
        };
      });

      await ProductService.updateProductInventory(product.id, inventoryData);
      showToast("Cập nhật tồn kho thành công!", { type: "success" });

      // 3. Cập nhật biến thể
      console.log("[Debug] Updating variants");
      await ProductService.updateProductVariants(product.id, productVariants);
      showToast("Cập nhật biến thể thành công!", { type: "success" });

      // 4. Xử lý hình ảnh
      console.log("[Debug] Updating images");
      if (removedImageIds.length > 0) {
        await ProductService.removeProductImages(product.id, removedImageIds);
        showToast(`Đã xóa ${removedImageIds.length} hình ảnh!`, {
          type: "success",
        });
      }

      if (newImages.length > 0) {
        await ProductService.addProductImages(product.id, newImages);
        showToast(`Đã thêm ${newImages.length} hình ảnh mới!`, {
          type: "success",
        });
      }

      const mainImage = product.images.find((img) => img.isMain);
      if (mainImage && typeof mainImage.id === "number") {
        await ProductService.setMainProductImage(product.id, mainImage.id);
        showToast("Đã cập nhật ảnh chính!", { type: "success" });
      }

      // 5. Xóa các biến thể bị xóa (nếu có)
      if (removedDetailIds.length > 0) {
        console.log("[Debug] Removing product details:", removedDetailIds);
        // Giả định rằng backend có một API để xóa các biến thể
        // Ví dụ: await ProductService.removeProductDetails(product.id, removedDetailIds);
        showToast(`Đã xóa ${removedDetailIds.length} biến thể!`, {
          type: "success",
        });
      }

      // Cập nhật lịch sử sửa đổi
      const newHistoryItem = {
        date: new Date().toLocaleString("vi-VN"),
        user: "Admin",
        action: "Cập nhật sản phẩm",
        detail: "Cập nhật thông tin cơ bản, tồn kho, biến thể và hình ảnh",
      };

      setProduct((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modificationHistory: [newHistoryItem, ...prev.modificationHistory],
        };
      });

      setRemovedImageIds([]);
      setRemovedDetailIds([]);
      setNewImages([]);
      setIsEditing(false);

      showToast("Cập nhật sản phẩm thành công!", { type: "success" });
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
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

  // Thêm biến thể mới
  const addVariant = (): void => {
    if (!product) return;

    const colorOptions = availableColors.filter(
      (color) => !product.colors.includes(color.label)
    );
    if (colorOptions.length === 0) {
      showToast("Không còn màu sắc nào để thêm!", { type: "warning" });
      return;
    }

    const selectedColor = colorOptions[0].label;

    const newVariant = {
      color: selectedColor,
      price: product.price,
      originalPrice: product.originalPrice,
      sizes: [{ size: "M", stock: 0 }],
    };

    setProductVariants((prev) => [...prev, newVariant]);

    // Đồng bộ product.colors
    setProduct((prev) => {
      if (!prev) return prev;
      const updatedColors = [...new Set([...prev.colors, newVariant.color])];
      return {
        ...prev,
        colors: updatedColors,
      };
    });
  };

  // Xóa biến thể
  const removeVariant = (variantIndex: number): void => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa biến thể này không?")) {
      return;
    }

    const newVariants = [...productVariants];
    const removedColor = newVariants[variantIndex].color;

    if (newVariants[variantIndex].id) {
      setRemovedDetailIds((prev) => [...prev, newVariants[variantIndex].id!]);
    }

    newVariants.splice(variantIndex, 1);
    setProductVariants(newVariants);

    // Cập nhật product.colors và xóa ảnh liên quan
    setProduct((prev) => {
      if (!prev) return prev;
      const updatedColors = prev.colors.filter(
        (color) => color !== removedColor
      );
      const updatedImages = prev.images.filter(
        (img) => img.color !== removedColor
      );
      return {
        ...prev,
        colors: updatedColors,
        images: updatedImages,
      };
    });
  };

  // Thay đổi thuộc tính biến thể
  const handleVariantChange = (
    variantIndex: number,
    field: keyof ProductDetail,
    value: string | number
  ): void => {
    console.log(
      `[Debug] Changing variant ${variantIndex}, field ${field} to:`,
      value
    );

    // If changing color, check for duplicates first
    if (field === "color" && typeof value === "string") {
      const newVariants = [...productVariants];
      const newColor = value;

      // Check if this color already exists in another variant
      const colorExists = productVariants.some(
        (variant, idx) => idx !== variantIndex && variant.color === newColor
      );

      if (colorExists) {
        showToast(`Màu "${newColor}" đã tồn tại. Vui lòng chọn màu khác.`, {
          type: "error",
        });
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

    // If color changed, update product.colors and images
    if (field === "color" && typeof value === "string") {
      const newColor = value;

      setProduct((prev) => {
        if (!prev) return prev;
        const updatedColors = prev.colors.map((c) =>
          c === oldColor ? newColor : c
        );

        // Also update color in all related stock variants
        const updatedStockVariants = prev.stock.variants.map((v) => ({
          ...v,
          color: v.color === oldColor ? newColor : v.color,
        }));

        // Update image colors too
        const updatedImages = prev.images.map((img) => ({
          ...img,
          color: img.color === oldColor ? newColor : img.color,
        }));

        return {
          ...prev,
          colors: updatedColors,
          stock: {
            ...prev.stock,
            variants: updatedStockVariants,
          },
          images: updatedImages,
        };
      });
    }
  };

  // Thêm kích thước mới cho biến thể
  const addSize = (variantIndex: number): void => {
    const newVariants = [...productVariants];
    newVariants[variantIndex].sizes = [
      ...newVariants[variantIndex].sizes,
      { size: "M", stock: 0 },
    ];
    setProductVariants(newVariants);

    // Cập nhật product.sizes
    setProduct((prev) => {
      if (!prev) return prev;
      const variantSizes = [
        ...new Set(newVariants.flatMap((v) => v.sizes.map((s) => s.size))),
      ];
      return {
        ...prev,
        sizes: variantSizes,
      };
    });
  };

  // Xóa kích thước
  const removeSize = (variantIndex: number, sizeIndex: number): void => {
    const newVariants = [...productVariants];
    newVariants[variantIndex].sizes.splice(sizeIndex, 1);
    setProductVariants(newVariants);

    // Cập nhật product.sizes
    setProduct((prev) => {
      if (!prev) return prev;
      const variantSizes = [
        ...new Set(newVariants.flatMap((v) => v.sizes.map((s) => s.size))),
      ];
      return {
        ...prev,
        sizes: variantSizes,
      };
    });
  };

  // Thay đổi thuộc tính kích thước
  const handleSizeChange = (
    variantIndex: number,
    sizeIndex: number,
    field: keyof SizeVariant,
    value: string | number
  ): void => {
    const newVariants = [...productVariants];
    newVariants[variantIndex].sizes[sizeIndex] = {
      ...newVariants[variantIndex].sizes[sizeIndex],
      [field]: value,
    };
    setProductVariants(newVariants);

    // Nếu kích thước thay đổi, cập nhật product.sizes
    if (field === "size") {
      setProduct((prev) => {
        if (!prev) return prev;
        const variantSizes = [
          ...new Set(
            productVariants.flatMap((v) => v.sizes.map((s) => s.size))
          ),
        ];
        return {
          ...prev,
          sizes: variantSizes,
        };
      });
    }
  };

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <AdminLayout title="Đang tải...">
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
                    { label: "Đang tải...", active: true },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
        <section className="content">
          <div className="container-fluid">
            <div className="card">
              <div
                className="card-body d-flex justify-content-center align-items-center"
                style={{ minHeight: "300px" }}
              >
                <div className="text-center">
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  >
                    <span className="sr-only">Đang tải...</span>
                  </div>
                  <p className="mb-0">Đang tải thông tin sản phẩm...</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AdminLayout>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <AdminLayout title="Lỗi">
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
                    { label: "Lỗi", active: true },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
        <section className="content">
          <div className="container-fluid">
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
                  type="button"
                  className="btn btn-primary"
                  onClick={() => router.push("/admin/products")}
                >
                  <i className="fas fa-arrow-left mr-2" />
                  Quay lại danh sách sản phẩm
                </button>
              </div>
            </div>
          </div>
        </section>
      </AdminLayout>
    );
  }

  // Nếu không có dữ liệu sản phẩm
  if (!product) {
    return (
      <AdminLayout title="Không tìm thấy sản phẩm">
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
                    { label: "Không tìm thấy", active: true },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
        <section className="content">
          <div className="container-fluid">
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
                  type="button"
                  className="btn btn-primary"
                  onClick={() => router.push("/admin/products")}
                >
                  <i className="fas fa-arrow-left mr-2" />
                  Quay lại danh sách sản phẩm
                </button>
              </div>
            </div>
          </div>
        </section>
      </AdminLayout>
    );
  }

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Sản phẩm", href: "/admin/products" },
    { label: product.name || "Chi tiết sản phẩm", active: true },
  ];

  return (
    <AdminLayout title={`Chi tiết sản phẩm ${product.name}`}>
      {/* Content Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Chi tiết sản phẩm</h1>
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
              <i className="fas fa-arrow-left mr-1" /> Quay lại
            </Link>
            <button
              type="button"
              className="btn btn-danger mr-2"
              onClick={() => {
                setProductToDelete(product);
                setShowDeleteModal(true);
              }}
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
                      <i className="fas fa-spinner fa-spin mr-1" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-1" />
                      Lưu thay đổi
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
                <i className="fas fa-edit mr-1" /> Chỉnh sửa sản phẩm
              </button>
            )}
          </div>

          {/* Product Overview Card */}
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
                  categoryLoading={categoryLoading}
                  subtypeLoading={subtypeLoading}
                />
              ) : (
                <>
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
                        <p>{product.categoryName}</p>
                      </div>
                      <div className="form-group">
                        <label>Loại sản phẩm</label>
                        <p>{product.subtypeName || "Không có"}</p>
                      </div>
                      <div className="form-group">
                        <label>Thương hiệu</label>
                        <p>{product.brand || "Không có"}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Giá bán</label>
                        <p>{product.price.toLocaleString("vi-VN")}đ</p>
                      </div>
                      <div className="form-group">
                        <label>Giá gốc</label>
                        <p>{product.originalPrice.toLocaleString("vi-VN")}đ</p>
                      </div>
                      <div className="form-group">
                        <label>Trạng thái</label>
                        <p>
                          <span className={`badge ${product.statusClass}`}>
                            {product.statusLabel}
                          </span>
                        </p>
                      </div>
                      <div className="form-group">
                        <label>Chất liệu</label>
                        <p>{product.material || "Không có"}</p>
                      </div>
                      <div className="form-group">
                        <label>Sản phẩm nổi bật</label>
                        <p>
                          <span
                            className={`badge ${
                              product.featured
                                ? "badge-success"
                                : "badge-secondary"
                            }`}
                          >
                            {product.featured ? "Có" : "Không"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Mô tả sản phẩm</label>
                    <p>{product.description || "Chưa có mô tả"}</p>
                  </div>
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <label>Màu sắc</label>
                      <div>
                        {product.colors.map((color, index) => (
                          <div
                            key={index}
                            className="d-inline-flex align-items-center mr-2 mb-2"
                          >
                            <div
                              className="mr-1"
                              style={{
                                backgroundColor: color.toLowerCase(),
                                width: "20px",
                                height: "20px",
                                border: "1px solid #ddd",
                                display: "inline-block",
                              }}
                            ></div>
                            <span className="badge badge-primary">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-6 form-group">
                      <label>Kích thước</label>
                      <div>
                        {product.sizes.map((size, index) => (
                          <span key={index} className="badge badge-info mr-1">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Tags</label>
                    <div>
                      {product.tags.length > 0 ? (
                        product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="badge badge-secondary mr-1"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">Chưa có tag</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tabs cho thông tin chi tiết */}
          <div className="card card-primary card-outline card-tabs">
            <div className="card-header p-0 pt-1 border-bottom-0">
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "info" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("info")}
                    href="#info-tab"
                    role="tab"
                    aria-controls="info-tab"
                    aria-selected={activeTab === "info"}
                  >
                    <i className="fas fa-info-circle mr-1" />
                    Chi tiết
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "inventory" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("inventory")}
                    href="#inventory-tab"
                    role="tab"
                    aria-controls="inventory-tab"
                    aria-selected={activeTab === "inventory"}
                  >
                    <i className="fas fa-box mr-1" />
                    Tồn kho
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "images" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("images")}
                    href="#images-tab"
                    role="tab"
                    aria-controls="images-tab"
                    aria-selected={activeTab === "images"}
                  >
                    <i className="fas fa-images mr-1" />
                    Hình ảnh
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "history" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("history")}
                    href="#history-tab"
                    role="tab"
                    aria-controls="history-tab"
                    aria-selected={activeTab === "history"}
                  >
                    <i className="fas fa-history mr-1" />
                    Lịch sử
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "variants" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("variants")}
                    href="#variants-tab"
                    role="tab"
                    aria-controls="variants-tab"
                    aria-selected={activeTab === "variants"}
                  >
                    <i className="fas fa-cubes mr-1" />
                    Biến thể
                  </a>
                </li>
              </ul>
            </div>
            <div className="card-body">
              <div className="tab-content">
                {/* Nội dung tab Info */}
                <div
                  className={`tab-pane ${activeTab === "info" ? "active" : ""}`}
                  id="info-tab"
                  role="tabpanel"
                  aria-labelledby="info-tab"
                >
                  {isEditing ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label>Mô tả sản phẩm</label>
                        <p>{product.description || "Chưa có mô tả"}</p>
                      </div>
                      <div className="row">
                        <div className="col-md-6 form-group">
                          <label>Màu sắc</label>
                          <div>
                            {product.colors.map((color, index) => (
                              <div
                                key={index}
                                className="d-inline-flex align-items-center mr-2 mb-2"
                              >
                                <div
                                  className="mr-1"
                                  style={{
                                    backgroundColor: color.toLowerCase(),
                                    width: "20px",
                                    height: "20px",
                                    border: "1px solid #ddd",
                                    display: "inline-block",
                                  }}
                                ></div>
                                <span className="badge badge-primary">
                                  {color}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="col-md-6 form-group">
                          <label>Kích thước</label>
                          <div>
                            {product.sizes.map((size, index) => (
                              <span
                                key={index}
                                className="badge badge-info mr-1"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Tags</label>
                        <div>
                          {product.tags.length > 0 ? (
                            product.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="badge badge-secondary mr-1"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted">Chưa có tag</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Inventory Tab */}
                <div
                  className={`tab-pane ${
                    activeTab === "inventory" ? "active" : ""
                  }`}
                  id="inventory-tab"
                  role="tabpanel"
                  aria-labelledby="inventory-tab"
                >
                  {isEditing ? (
                    <InventoryTab
                      product={product}
                      setProduct={setProduct}
                      availableColors={availableColors}
                      newVariant={{
                        color: product.colors[0] || "",
                        size: product.sizes[0] || "",
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
                          {product.stock.variants.map((variant, index) => (
                            <tr key={index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div
                                    className="mr-2"
                                    style={{
                                      backgroundColor:
                                        variant.color.toLowerCase(),
                                      width: "20px",
                                      height: "20px",
                                      border: "1px solid #ddd",
                                      display: "inline-block",
                                    }}
                                  ></div>
                                  {variant.color}
                                </div>
                              </td>
                              <td>{variant.size}</td>
                              <td>
                                <span
                                  className={
                                    variant.stock <= 5
                                      ? "text-danger font-weight-bold"
                                      : ""
                                  }
                                >
                                  {variant.stock}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th colSpan={2}>Tổng số lượng tồn kho:</th>
                            <th>{product.stock.total}</th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {/* Images Tab */}
                <div
                  className={`tab-pane ${
                    activeTab === "images" ? "active" : ""
                  }`}
                  id="images-tab"
                  role="tabpanel"
                  aria-labelledby="images-tab"
                >
                  {isEditing ? (
                    <ImagesTab
                      productColors={product.colors}
                      selectedColor={selectedImageColor}
                      setSelectedColor={setSelectedImageColor}
                      colorImages={Object.fromEntries(
                        product.colors.map((color) => [
                          color,
                          product.images.filter((img) => img.color === color),
                        ])
                      )}
                      setColorImages={(updatedImages) => {
                        const allImages: ProductImage[] = [];
                        Object.values(updatedImages).forEach((images) => {
                          allImages.push(...images);
                        });
                        setProduct((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            images: allImages,
                          };
                        });
                      }}
                      availableColors={availableColors}
                      handleImageChange={(e) => {
                        e.preventDefault();
                        const files = e.target.files;
                        if (!files || files.length === 0 || !product) return;

                        if (!product.colors.includes(selectedImageColor)) {
                          showToast("Vui lòng chọn màu hợp lệ", {
                            type: "error",
                          });
                          return;
                        }

                        const currentImagesForColor = product.images.filter(
                          (img) => img.color === selectedImageColor
                        );
                        const remainingSlots =
                          10 - currentImagesForColor.length;

                        if (remainingSlots <= 0) {
                          showToast(
                            "Mỗi màu chỉ được phép tải lên tối đa 10 hình ảnh để hiển thị tốt hơn trên trang sản phẩm.",
                            {
                              type: "warning",
                            }
                          );
                          return;
                        }

                        const selectedFiles = Array.from(files).slice(
                          0,
                          remainingSlots
                        );
                        const hasMainImage = currentImagesForColor.some(
                          (img) => img.isMain
                        );

                        const newUploadedImages = selectedFiles.map(
                          (file, index) => ({
                            file,
                            color: selectedImageColor,
                            isMain: !hasMainImage && index === 0, // Chỉ đặt ảnh đầu tiên làm ảnh chính nếu không có ảnh chính
                          })
                        );

                        setNewImages((prev) => [...prev, ...newUploadedImages]);

                        const imageURLs = selectedFiles.map((file, index) => ({
                          id: `new-${Date.now()}-${Math.random()
                            .toString(36)
                            .substring(2, 9)}`,
                          url: URL.createObjectURL(file),
                          color: selectedImageColor,
                          isMain: !hasMainImage && index === 0, // Chỉ đặt ảnh đầu tiên làm ảnh chính nếu không có ảnh chính
                        }));

                        setProduct((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            images: [...prev.images, ...imageURLs],
                          };
                        });

                        e.target.value = "";
                      }}
                      handleSetMainImage={handleSetMainImage}
                      handleRemoveImage={handleRemoveImage}
                    />
                  ) : (
                    <ImagesTab
                      productColors={product.colors}
                      selectedColor={selectedImageColor}
                      setSelectedColor={setSelectedImageColor}
                      colorImages={Object.fromEntries(
                        product.colors.map((color) => [
                          color,
                          product.images.filter((img) => img.color === color),
                        ])
                      )}
                      setColorImages={() => {}} // Hàm rỗng vì không cần cập nhật hình ảnh ở view mode
                      availableColors={availableColors}
                      handleImageChange={() => {}} // Hàm rỗng vì không cho phép tải ảnh ở view mode
                      handleSetMainImage={() => {}} // Hàm rỗng vì không cho phép đặt ảnh chính ở view mode
                      handleRemoveImage={() => {}} // Hàm rỗng vì không cho phép xóa ảnh ở view mode
                      viewMode={true} // Thêm prop để báo hiệu view mode
                    />
                  )}
                </div>

                {/* History Tab */}
                <div
                  className={`tab-pane ${
                    activeTab === "history" ? "active" : ""
                  }`}
                >
                  <ul className="timeline-inverse">
                    {product.modificationHistory.map((item, index) => (
                      <li key={index}>
                        <div className="timeline-item">
                          <span className="time">
                            <i className="fas fa-clock"></i> {item.date}
                          </span>
                          <h3 className="timeline-header">
                            <a href="#">{item.user}</a> - {item.action}
                          </h3>
                          <div className="timeline-body">{item.detail}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Variants Tab */}
                <div
                  className={`tab-pane ${
                    activeTab === "variants" ? "active" : ""
                  }`}
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
                                <div className="variant-sizes">
                                  {variant.sizes.map((sizeItem, sizeIndex) => (
                                    <div
                                      key={sizeIndex}
                                      className="size-item d-flex mb-2"
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
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
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
                                        placeholder="Tồn kho"
                                      />
                                      <button
                                        className="btn btn-danger ml-2"
                                        onClick={() =>
                                          removeSize(index, sizeIndex)
                                        }
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    className="btn btn-sm btn-info mt-2"
                                    onClick={() => addSize(index)}
                                  >
                                    <i className="fas fa-plus mr-1"></i> Thêm
                                    kích thước
                                  </button>
                                </div>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeVariant(index)}
                                >
                                  <i className="fas fa-trash"></i> Xóa
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
                                <i className="fas fa-plus mr-1"></i> Thêm biến
                                thể mới
                              </button>
                            </td>
                            <td colSpan={2}>
                              <button
                                className="btn btn-primary"
                                onClick={handleVariantsUpdate}
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
                              <td>{variant.color}</td>
                              <td>{variant.price.toLocaleString("vi-VN")}đ</td>
                              <td>
                                {variant.originalPrice.toLocaleString("vi-VN")}đ
                              </td>
                              <td>
                                {variant.sizes.map((sizeItem, sizeIndex) => (
                                  <div key={sizeIndex}>
                                    {sizeItem.size}: {sizeItem.stock}
                                  </div>
                                ))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div
          className={`modal fade ${showDeleteModal ? "show" : ""}`}
          style={{
            display: showDeleteModal ? "block" : "none",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="deleteModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header bg-danger">
                <h5 className="modal-title text-white" id="deleteModalLabel">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Xác nhận xóa sản phẩm
                </h5>
                <button
                  type="button"
                  className="close text-white"
                  onClick={() => setShowDeleteModal(false)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Bạn có chắc chắn muốn xóa sản phẩm{" "}
                  <strong>"{productToDelete.name}"</strong>?
                </p>
                <p className="mb-0 text-danger">
                  <i className="fas fa-info-circle mr-1"></i>
                  Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến
                  sản phẩm này sẽ bị xóa vĩnh viễn.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <i className="fas fa-times mr-1"></i>
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    try {
                      await ProductService.deleteProduct(
                        String(productToDelete.id)
                      );
                      setShowDeleteModal(false);
                      showToast("Đã xóa sản phẩm thành công!", {
                        type: "success",
                      });
                      setTimeout(() => {
                        router.push("/admin/products");
                      }, 2000);
                    } catch (error) {
                      console.error("Error deleting product:", error);
                      showToast("Không thể xóa sản phẩm này.", {
                        type: "error",
                      });
                    }
                  }}
                >
                  <i className="fas fa-trash mr-1"></i>
                  Xóa sản phẩm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {Toast}
    </AdminLayout>
  );
};

export default ProductDetailPage;
