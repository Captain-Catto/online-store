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

export interface FormattedProduct {
  id: number;
  name: string;
  sku: string;
  description: string;
  category: string;
  categoryName: string;
  subtype: string;
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
  suitabilities: Array<number>;
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
  suitabilities?: Array<{ id: number; name: string }>;
  createdAt: string;
  updatedAt: string;
  details: ProductDetailApiResponse[];
  categories: Array<{ id: number; name: string; parentId?: number }>;
}

interface ProductDetailApiResponse {
  id: number;
  productId: number;
  color: string;
  price: number;
  originalPrice: number;
  createdAt: string;
  updatedAt: string;
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
    displayOrder: number;
  }>;
}

const ProductDetailPage: FC = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { showToast, Toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("info");
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
  const [tagInput, setTagInput] = useState<string>("");
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [subtypes, setSubtypes] = useState<Category[]>([]);
  const [subtypeLoading, setSubtypeLoading] = useState<boolean>(false);
  const [suitabilities, setSuitabilities] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [suitabilityLoading, setSuitabilityLoading] = useState<boolean>(false);
  const [selectedImageColor, setSelectedImageColor] = useState<string>("");

  const [imageDeleteConfirmation, setImageDeleteConfirmation] = useState<{
    isOpen: boolean;
    imageId: number | string | null;
    imageColor: string;
  }>({
    isOpen: false,
    imageId: null,
    imageColor: "",
  });

  const [variantDeleteConfirmation, setVariantDeleteConfirmation] = useState<{
    isOpen: boolean;
    variantIndex: number;
    variantColor: string;
  }>({
    isOpen: false,
    variantIndex: -1,
    variantColor: "",
  });

  const availableColors: Array<{ key: string; label: string }> = [
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

  // Tách logic fetch sản phẩm thành một hàm riêng

  const fetchProductData = useCallback(async () => {
    const formatProductData = (
      productData: ProductApiResponse
    ): FormattedProduct => {
      const parentCategory = productData.categories.find((c) => !c.parentId);
      const subCategory = productData.categories.find((c) => c.parentId);

      const tags =
        typeof productData.tags === "string"
          ? JSON.parse(productData.tags)
          : productData.tags;

      const totalStock = productData.details.reduce(
        (total, detail) =>
          total + detail.inventories.reduce((sum, inv) => sum + inv.stock, 0),
        0
      );

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
        category: parentCategory?.id?.toString() || "",
        categoryName: parentCategory?.name || "",
        subtype: subCategory?.id ? String(subCategory.id) : "",
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
        suitabilities: productData.suitabilities?.map((suit) => suit.id) || [],
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

    try {
      setLoading(true);
      const productData = await ProductService.getProductVariants(id);
      console.log("Product data:", productData);
      const formattedProduct = formatProductData(productData);
      setProduct(formattedProduct);
      console.log("Formatted product:", formattedProduct);
      setProductVariants(
        productData.details.map((detail: ProductDetailApiResponse) => ({
          id: detail.id,
          color: detail.color,
          price: detail.price,
          originalPrice: detail.originalPrice,
          sizes: detail.inventories.map((inv) => ({
            size: inv.size,
            stock: inv.stock,
          })),
        }))
      );
      setSelectedImageColor(formattedProduct.colors[0] || "");
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Sửa useEffect ban đầu để sử dụng hàm này
  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const data = await CategoryService.getAllCategories();
        setCategoryList(data.filter((cat: Category) => cat.parentId === null));
      } catch (err) {
        console.error("Error fetching categories:", err);
        showToast("Không thể tải danh mục sản phẩm", { type: "error" });
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, [showToast]);

  useEffect(() => {
    const fetchSubtypes = async () => {
      if (!product?.category) {
        setSubtypes([]);
        return;
      }

      try {
        setSubtypeLoading(true);
        const childCategories = await CategoryService.getChildCategories(
          product.category
        );
        setSubtypes(childCategories);
      } catch (err) {
        console.error("Error fetching subtypes:", err);
        showToast("Không thể tải loại sản phẩm", { type: "error" });
        setSubtypes([]);
      } finally {
        setSubtypeLoading(false);
      }
    };

    if (product?.category) {
      fetchSubtypes();
    }
  }, [product?.category, showToast]);

  useEffect(() => {
    const fetchSuitabilities = async () => {
      try {
        setSuitabilityLoading(true);
        const data = await ProductService.getSuitabilities();
        setSuitabilities(data);
      } catch (err) {
        console.error("Error fetching suitabilities:", err);
        showToast("Không thể tải danh sách phù hợp cho sản phẩm", {
          type: "error",
        });
      } finally {
        setSuitabilityLoading(false);
      }
    };

    fetchSuitabilities();
  }, [showToast]);

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const sizes = await ProductService.getSizes();
        if (sizes?.length > 0) {
          setAvailableSizes(
            sizes
              .filter((size: { active: boolean }) => size.active)
              .map((size: { value: string; displayName?: string }) => ({
                value: size.value,
                label: size.displayName || size.value,
              }))
          );
        }
      } catch (err) {
        console.error("Error fetching sizes:", err);
      }
    };

    fetchSizes();
  }, []);

  const handleSetMainImage = (imageId: number | string) => {
    if (!product) return;

    // Tìm màu của ảnh được chọn
    const imageToMakeMain = product.images.find((img) => img.id === imageId);
    if (!imageToMakeMain) {
      console.error("Không tìm thấy ảnh với ID:", imageId);
      return;
    }

    const colorOfImage = imageToMakeMain.color;

    // Cập nhật trực tiếp state của product
    setProduct((prev) => {
      if (!prev) return prev;

      const updatedImages = prev.images.map((img) => ({
        ...img,
        // Chỉ ảnh được chọn và cùng màu mới có isMain = true
        isMain:
          img.id === imageId
            ? true
            : img.color === colorOfImage
            ? false
            : img.isMain,
      }));

      return {
        ...prev,
        images: updatedImages,
      };
    });

    // Nếu ID là số (ảnh đã tồn tại trên server), gọi API để cập nhật
    if (typeof imageId === "number") {
      console.log(`Đặt ảnh ${imageId} làm ảnh chính cho màu ${colorOfImage}`);
      ProductService.setMainProductImage(product.id, imageId)
        .then(() => {
          showToast("Đã đặt làm ảnh chính", { type: "success" });
        })
        .catch((error) => {
          console.error("Lỗi khi đặt ảnh chính:", error);
          showToast("Không thể đặt làm ảnh chính", { type: "error" });
        });
    }
  };

  const handleImageDeleteRequest = (imageId: number | string) => {
    const imageToDelete = product?.images.find((img) => img.id === imageId);
    if (!imageToDelete) return;

    setImageDeleteConfirmation({
      isOpen: true,
      imageId,
      imageColor: imageToDelete.color,
    });
  };

  const handleCancelImageDelete = () => {
    setImageDeleteConfirmation({
      isOpen: false,
      imageId: null,
      imageColor: "",
    });
  };

  const handleConfirmImageDelete = () => {
    const { imageId } = imageDeleteConfirmation;
    if (!imageId) return;

    setProduct((prev) => {
      if (!prev) return prev;
      const updatedImages = prev.images.filter((img) => img.id !== imageId);
      if (typeof imageId === "number") {
        setRemovedImageIds((prevIds) => [...prevIds, imageId]);
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

      return { ...prev, images: updatedImages };
    });

    handleCancelImageDelete();
  };

  const handleVariantDeleteRequest = (variantIndex: number) => {
    const variant = productVariants[variantIndex];
    if (!variant) return;

    setVariantDeleteConfirmation({
      isOpen: true,
      variantIndex,
      variantColor: variant.color,
    });
  };

  const handleCancelVariantDelete = () => {
    setVariantDeleteConfirmation({
      isOpen: false,
      variantIndex: -1,
      variantColor: "",
    });
  };

  const handleConfirmVariantDelete = async () => {
    const { variantIndex } = variantDeleteConfirmation;
    if (variantIndex < 0 || !product) return;

    const newVariants = [...productVariants];
    const removedVariant = newVariants[variantIndex];
    const removedColor = removedVariant.color;

    if (removedVariant.id) {
      try {
        await ProductService.removeProductDetails([removedVariant.id]);
        showToast(
          `Đã xóa biến thể màu ${
            colorToVietnamese[removedColor] || removedColor
          }!`,
          {
            type: "success",
          }
        );
      } catch (err) {
        console.error("Error deleting variant:", err);
        showToast("Không thể xóa biến thể", { type: "error" });
        return;
      }
    }

    newVariants.splice(variantIndex, 1);
    setProductVariants(newVariants);

    setProduct((prev) => {
      if (!prev) return prev;
      const updatedColors = prev.colors.filter(
        (color) => color !== removedColor
      );
      const updatedImages = prev.images.filter(
        (img) => img.color !== removedColor
      );
      const updatedStockVariants = prev.stock.variants.filter(
        (variant) => variant.color !== removedColor
      );
      const totalStock = updatedStockVariants.reduce(
        (sum, variant) => sum + variant.stock,
        0
      );

      const newHistoryItem: ModificationHistoryItem = {
        date: new Date().toLocaleString("vi-VN"),
        user: "Admin",
        action: "Xóa biến thể",
        detail: `Xóa biến thể màu ${
          colorToVietnamese[removedColor] || removedColor
        }`,
      };

      return {
        ...prev,
        colors: updatedColors,
        images: updatedImages,
        stock: {
          ...prev.stock,
          total: totalStock,
          variants: updatedStockVariants,
        },
        modificationHistory: [newHistoryItem, ...prev.modificationHistory],
      };
    });

    handleCancelVariantDelete();
  };

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

    if (product.suitabilities.length === 0) {
      showToast("Vui lòng chọn ít nhất một loại phù hợp (suitability)", {
        type: "error",
      });
      setActiveTab("info");
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
      if (!variant.color) return;
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

  const handleVariantsUpdate = async () => {
    if (!product) {
      showToast("Không có dữ liệu sản phẩm", { type: "error" });
      return false;
    }

    const duplicateColors = checkDuplicateColorVariants(productVariants);
    if (duplicateColors.length > 0) {
      showToast(`Phát hiện màu trùng lặp: ${duplicateColors.join(", ")}`, {
        type: "error",
      });
      return false;
    }

    const emptyColors = productVariants.some((v) => !v.color);
    if (emptyColors) {
      showToast("Tất cả các biến thể phải có màu sắc", { type: "error" });
      return false;
    }

    const emptySizes = productVariants.some(
      (v) => !v.sizes || v.sizes.length === 0
    );
    if (emptySizes) {
      showToast("Mỗi biến thể phải có ít nhất một kích cỡ", { type: "error" });
      return false;
    }

    const invalidPrices = productVariants.some(
      (v) => v.price <= 0 || (v.originalPrice && v.originalPrice < v.price)
    );
    if (invalidPrices) {
      showToast("Giá sản phẩm không hợp lệ", { type: "error" });
      return false;
    }

    setIsSubmitting(true);

    try {
      await ProductService.updateProductVariants(product.id, productVariants);

      const newHistoryItem: ModificationHistoryItem = {
        date: new Date().toLocaleString("vi-VN"),
        user: "Admin",
        action: "Cập nhật biến thể",
        detail: "Cập nhật thông tin biến thể sản phẩm",
      };

      setProduct((prev) => {
        if (!prev) return prev;
        const totalStock = productVariants.reduce(
          (sum, variant) =>
            sum +
            variant.sizes.reduce(
              (variantSum, size) => variantSum + size.stock,
              0
            ),
          0
        );

        const stockVariants = productVariants.flatMap((variant) =>
          variant.sizes.map((size) => ({
            color: variant.color,
            size: size.size,
            stock: size.stock,
            detailId: variant.id,
          }))
        );

        const uniqueColors = [...new Set(productVariants.map((v) => v.color))];
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
            ...prev.stock,
            total: totalStock,
            variants: stockVariants,
          },
          modificationHistory: [newHistoryItem, ...prev.modificationHistory],
        };
      });

      showToast("Cập nhật biến thể thành công!", { type: "success" });
      return true;
    } catch (err) {
      console.error("Failed to update variants:", err);
      showToast(
        err instanceof Error ? err.message : "An unknown error occurred",
        {
          type: "error",
        }
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

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
        suitabilities: product.suitabilities,
        categories: [
          { id: parseInt(String(product.category), 10), isParent: true },
          ...(product.subtype
            ? [
                {
                  id: parseInt(String(product.subtype), 10),
                  isParent: false,
                  parentId: parseInt(String(product.category), 10),
                },
              ]
            : []),
        ].map((category) => category.id),
      };
      console.log("basicinfodata suitability", basicInfoData.suitabilities);
      const duplicateColors = checkDuplicateColorVariants(productVariants);
      if (duplicateColors.length > 0) {
        showToast(`Phát hiện màu trùng lặp: ${duplicateColors.join(", ")}`, {
          type: "error",
        });
        setActiveTab("variants");
        setIsSubmitting(false);
        return;
      }

      const emptyColors = productVariants.some((v) => !v.color);
      if (emptyColors) {
        showToast("Tất cả các biến thể phải có màu sắc", { type: "error" });
        setActiveTab("variants");
        setIsSubmitting(false);
        return;
      }

      await ProductService.updateProductBasicInfo(product.id, {
        ...basicInfoData,
        tags: Array.isArray(basicInfoData.tags) ? basicInfoData.tags : [],
        suitabilities: basicInfoData.suitabilities,
      });

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
      await ProductService.updateProductVariants(product.id, productVariants);

      // 1. Xóa hình ảnh cũ trước
      if (removedImageIds.length > 0) {
        await ProductService.removeProductImages(product.id, removedImageIds);
      }

      // 2. Thêm hình ảnh mới
      if (newImages.length > 0) {
        await ProductService.addProductImages(product.id, newImages);

        // Đợi một chút để đảm bảo server đã xử lý xong việc thêm ảnh
        // và tránh race condition
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      // 3. Cập nhật lại hình ảnh
      if (removedDetailIds.length > 0) {
        await ProductService.removeProductDetails(removedDetailIds);
      }

      await fetchProductData();

      setRemovedImageIds([]);
      setRemovedDetailIds([]);
      setNewImages([]);
      setIsEditing(false);

      showToast("Cập nhật sản phẩm thành công!", { type: "success" });
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi cập nhật sản phẩm.",
        { type: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addVariant = () => {
    if (!product) return;

    const colorOptions = availableColors.filter(
      (color) => !product.colors.includes(color.label)
    );
    if (colorOptions.length === 0) {
      showToast("Không còn màu sắc nào để thêm!", { type: "warning" });
      return;
    }

    const selectedColor = colorOptions[0].label;
    const newVariant: ProductDetail = {
      color: selectedColor,
      price: product.price,
      originalPrice: product.originalPrice,
      sizes: [{ size: "M", stock: 0 }],
    };

    setProductVariants((prev) => [...prev, newVariant]);
    setProduct((prev) =>
      prev
        ? { ...prev, colors: [...new Set([...prev.colors, newVariant.color])] }
        : prev
    );
  };

  const handleVariantChange = (
    variantIndex: number,
    field: keyof ProductDetail,
    value: string | number
  ) => {
    if (field === "color" && typeof value === "string") {
      const colorExists = productVariants.some(
        (variant, idx) => idx !== variantIndex && variant.color === value
      );
      if (colorExists) {
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
        const updatedColors = prev.colors.map((c) =>
          c === oldColor ? value : c
        );
        const updatedStockVariants = prev.stock.variants.map((v) => ({
          ...v,
          color: v.color === oldColor ? value : v.color,
        }));
        const updatedImages = prev.images.map((img) => ({
          ...img,
          color: img.color === oldColor ? value : img.color,
        }));

        return {
          ...prev,
          colors: updatedColors,
          stock: { ...prev.stock, variants: updatedStockVariants },
          images: updatedImages,
        };
      });
    }
  };

  const addSize = (variantIndex: number) => {
    const newVariants = [...productVariants];
    newVariants[variantIndex].sizes = [
      ...newVariants[variantIndex].sizes,
      { size: "M", stock: 0 },
    ];
    setProductVariants(newVariants);

    setProduct((prev) => {
      if (!prev) return prev;
      const variantSizes = [
        ...new Set(newVariants.flatMap((v) => v.sizes.map((s) => s.size))),
      ];
      return { ...prev, sizes: variantSizes };
    });
  };

  const removeSize = (variantIndex: number, sizeIndex: number) => {
    const newVariants = [...productVariants];
    newVariants[variantIndex].sizes.splice(sizeIndex, 1);
    setProductVariants(newVariants);

    setProduct((prev) => {
      if (!prev) return prev;
      const variantSizes = [
        ...new Set(newVariants.flatMap((v) => v.sizes.map((s) => s.size))),
      ];
      return { ...prev, sizes: variantSizes };
    });
  };

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

    if (field === "size") {
      setProduct((prev) => {
        if (!prev) return prev;
        const variantSizes = [
          ...new Set(
            productVariants.flatMap((v) => v.sizes.map((s) => s.size))
          ),
        ];
        return { ...prev, sizes: variantSizes };
      });
    }
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
                  type="button"
                  className="btn btn-primary"
                  onClick={() => router.push("/admin/products")}
                >
                  <i className="fas fa-arrow-left mr-2" />
                  Quay lại danh sách sản phẩm
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
                  type="button"
                  className="btn btn-primary"
                  onClick={() => router.push("/admin/products")}
                >
                  <i className="fas fa-arrow-left mr-2" />
                  Quay lại danh sách sản phẩm
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
                            <p>
                              {product.originalPrice.toLocaleString("vi-VN")}đ
                            </p>
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
                                />
                                <span className="badge badge-primary">
                                  {colorToVietnamese[color] || color}
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
              </div>

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
                  </ul>
                </div>
                <div className="card-body">
                  <div className="tab-content">
                    <div
                      className={`tab-pane ${
                        activeTab === "info" ? "active" : ""
                      }`}
                      id="info-tab"
                      role="tabpanel"
                    >
                      {isEditing ? (
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
                      ) : (
                        <div className="card card-body mb-3">
                          <div className="row mt-4">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="font-weight-bold">
                                  <i className="fas fa-palette mr-1" /> Màu sắc
                                </label>
                                <div className="d-flex flex-wrap">
                                  {product.colors.length > 0 ? (
                                    product.colors.map((color, index) => (
                                      <div
                                        key={index}
                                        className="d-inline-flex align-items-center mr-2 mb-2 bg-white p-1 rounded border"
                                      >
                                        <div
                                          className="mr-1"
                                          style={{
                                            backgroundColor:
                                              color.toLowerCase(),
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "3px",
                                            border: "1px solid #ddd",
                                            display: "inline-block",
                                          }}
                                        />
                                        <span className="badge badge-light">
                                          {colorToVietnamese[color] || color}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-muted">
                                      Chưa có màu sắc
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="font-weight-bold">
                                  <i className="fas fa-ruler mr-1" /> Kích thước
                                </label>
                                <div>
                                  {product.sizes.length > 0 ? (
                                    product.sizes.map((size, index) => (
                                      <span
                                        key={index}
                                        className="badge badge-info mr-2 mb-2 p-2"
                                        style={{ fontSize: "90%" }}
                                      >
                                        {size}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-muted">
                                      Chưa có kích thước
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row mt-4">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="font-weight-bold">
                                  <i className="fas fa-check-circle mr-1" /> Phù
                                  hợp cho
                                </label>
                                <div>
                                  {product.suitabilities.length > 0 ? (
                                    suitabilities
                                      .filter((suit) =>
                                        product.suitabilities.includes(suit.id)
                                      )
                                      .map((suit) => (
                                        <span
                                          key={suit.id}
                                          className="badge badge-info mr-2 mb-2 p-2"
                                          style={{ fontSize: "90%" }}
                                        >
                                          <i className="fas fa-tag mr-1" />{" "}
                                          {suit.name}
                                        </span>
                                      ))
                                  ) : (
                                    <span className="text-muted">
                                      Chưa có thông tin phù hợp
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="font-weight-bold">
                                  <i className="fas fa-tags mr-1" /> Tags
                                </label>
                                <div>
                                  {product.tags.length > 0 ? (
                                    product.tags.map((tag, index) => (
                                      <span
                                        key={index}
                                        className="badge badge-secondary mr-2 mb-2 p-2"
                                        style={{ fontSize: "90%" }}
                                      >
                                        {tag}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-muted">
                                      Chưa có tag
                                    </span>
                                  )}
                                </div>
                              </div>
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
                      role="tabpanel"
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
                                      {variant.sizes.map(
                                        (sizeItem, sizeIndex) => (
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
                                              placeholder="Tồn kho"
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
                                    </div>
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
                                  <td>
                                    {variant.price.toLocaleString("vi-VN")}đ
                                  </td>
                                  <td>
                                    {variant.originalPrice.toLocaleString(
                                      "vi-VN"
                                    )}
                                    đ
                                  </td>
                                  <td>
                                    {variant.sizes.map(
                                      (sizeItem, sizeIndex) => (
                                        <div key={sizeIndex}>
                                          {sizeItem.size}: {sizeItem.stock}
                                        </div>
                                      )
                                    )}
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
                      role="tabpanel"
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
                                      />
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

                    <div
                      className={`tab-pane ${
                        activeTab === "images" ? "active" : ""
                      }`}
                      id="images-tab"
                      role="tabpanel"
                    >
                      {isEditing ? (
                        <ImagesTab
                          productColors={product.colors}
                          selectedColor={selectedImageColor}
                          setSelectedColor={setSelectedImageColor}
                          colorImages={Object.fromEntries(
                            product.colors.map((color) => [
                              color,
                              product.images.filter(
                                (img) => img.color === color
                              ),
                            ])
                          )}
                          setColorImages={(updatedImages) => {
                            const allImages: ProductImage[] =
                              Object.values(updatedImages).flat();
                            setProduct((prev) =>
                              prev ? { ...prev, images: allImages } : prev
                            );
                          }}
                          availableColors={availableColors}
                          handleImageChange={(e) => {
                            e.preventDefault();
                            const files = e.target.files;
                            if (!files || files.length === 0 || !product)
                              return;

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
                                "Mỗi màu chỉ được phép tải lên tối đa 10 hình ảnh",
                                { type: "warning" }
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
                                    images: [...prev.images, ...imageURLs],
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
                          productColors={product.colors}
                          selectedColor={selectedImageColor}
                          setSelectedColor={setSelectedImageColor}
                          colorImages={Object.fromEntries(
                            product.colors.map((color) => [
                              color,
                              product.images.filter(
                                (img) => img.color === color
                              ),
                            ])
                          )}
                          setColorImages={() => {}}
                          availableColors={availableColors}
                          handleImageChange={() => {}}
                          handleSetMainImage={() => {}}
                          handleRemoveImage={() => {}}
                          viewMode
                        />
                      )}
                    </div>

                    <div
                      className={`tab-pane ${
                        activeTab === "history" ? "active" : ""
                      }`}
                      id="history-tab"
                      role="tabpanel"
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
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

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
                  <i className="fas fa-exclamation-triangle mr-2" />
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
                  <strong>&quot;{productToDelete.name}&quot;</strong>?
                </p>
                <p className="mb-0 text-danger">
                  <i className="fas fa-info-circle mr-1" />
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
                  <i className="fas fa-times mr-1" />
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
                    } catch (err) {
                      console.error("Error deleting product:", err);
                      showToast(
                        err instanceof Error
                          ? err.message
                          : "Có lỗi xảy ra khi xóa sản phẩm.",
                        { type: "error" }
                      );
                      setShowDeleteModal(false);
                    }
                  }}
                >
                  <i className="fas fa-trash mr-1" />
                  Xóa sản phẩm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={imageDeleteConfirmation.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa hình ảnh này của màu ${
          colorToVietnamese[imageDeleteConfirmation.imageColor] ||
          imageDeleteConfirmation.imageColor
        }?`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmButtonClass="btn-danger"
        onConfirm={handleConfirmImageDelete}
        onCancel={handleCancelImageDelete}
      />

      <ConfirmModal
        isOpen={variantDeleteConfirmation.isOpen}
        title="Xác nhận xóa biến thể"
        message={`Bạn có chắc chắn muốn xóa biến thể màu ${
          colorToVietnamese[variantDeleteConfirmation.variantColor] ||
          variantDeleteConfirmation.variantColor
        }? Hình ảnh và dữ liệu tồn kho liên quan cũng sẽ bị xóa.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmButtonClass="btn-danger"
        onConfirm={handleConfirmVariantDelete}
        onCancel={handleCancelVariantDelete}
      />

      {Toast}
    </AdminLayout>
  );
};

export default ProductDetailPage;
