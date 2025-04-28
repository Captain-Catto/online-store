"use client";

import { useState, useEffect, FC } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { Product } from "@/types/product";
import { useToast } from "@/utils/useToast";
import { Category } from "@/types/category";

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
  categories: { id: number; name: string }[];
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

  // States riêng biệt cho việc chỉnh sửa
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState<boolean>(false);
  const [isEditingInventory, setIsEditingInventory] = useState<boolean>(false);
  const [isEditingImages, setIsEditingImages] = useState<boolean>(false);
  const [isEditingVariants, setIsEditingVariants] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States cho việc đang submit
  const [isSubmittingBasicInfo, setIsSubmittingBasicInfo] =
    useState<boolean>(false);
  const [isSubmittingInventory, setIsSubmittingInventory] =
    useState<boolean>(false);
  const [isSubmittingImages, setIsSubmittingImages] = useState<boolean>(false);
  const [isSubmittingVariants, setIsSubmittingVariants] =
    useState<boolean>(false);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [removedDetailIds, setRemovedDetailIds] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);

  // State cho biến thể sản phẩm
  const [productVariants, setProductVariants] = useState<ProductDetail[]>([]);

  // Dữ liệu sản phẩm
  const [product, setProduct] = useState<FormattedProduct | null>(null);

  const [tagInput, setTagInput] = useState("");
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [subtypes, setSubtypes] = useState<Category[]>([]);
  const [subtypeLoading, setSubtypeLoading] = useState<boolean>(false);
  /**
   * Hàm tiện ích để định dạng dữ liệu sản phẩm từ API
   */
  const formatProductData = (
    productData: ProductApiResponse
  ): FormattedProduct => {
    // Tìm danh mục con nếu có
    const parentCategory = productData.categories.find(
      (c: { id: number; name: string; parentId?: number }) => !c.parentId
    );
    const subCategory = productData.categories.find(
      (c: { id: number; name: string; parentId?: number }) => c.parentId
    );

    // Parse tags và suitability
    const tags =
      typeof productData.tags === "string"
        ? JSON.parse(productData.tags as string)
        : productData.tags;

    const suitability =
      typeof productData.suitability === "string"
        ? JSON.parse(productData.suitability as string)
        : productData.suitability;

    // Tính tổng số lượng tồn kho
    const totalStock = productData.details.reduce((total, detail) => {
      return (
        total + detail.inventories.reduce((sum, inv) => sum + inv.stock, 0)
      );
    }, 0);

    // Tạo mảng các màu sắc và kích thước
    const colors = productData.details.map((detail) => detail.color);
    const sizes = [
      ...new Set(
        productData.details.flatMap((detail) =>
          detail.inventories.map((inv) => inv.size)
        )
      ),
    ];

    // Tạo các biến thể tồn kho
    const stockVariants = productData.details.flatMap((detail) =>
      detail.inventories.map((inv) => ({
        color: detail.color,
        size: inv.size,
        stock: inv.stock,
        detailId: detail.id,
      }))
    );

    // Làm phẳng các hình ảnh
    const images = productData.details.flatMap((detail) =>
      detail.images.map((image) => ({
        ...image,
        color: detail.color,
      }))
    );

    // Định dạng dữ liệu sản phẩm
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
        setProduct(formatProductData(productData));
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Đồng bộ màu sắc và kích thước từ các biến thể đến thông tin cơ bản
  useEffect(() => {
    if (productVariants.length > 0 && product) {
      // Lấy danh sách màu sắc và kích thước từ các biến thể
      // và loại bỏ các giá trị trùng lặp
      const variantColors = [...new Set(productVariants.map((v) => v.color))];
      const variantSizes = [
        ...new Set(productVariants.flatMap((v) => v.sizes.map((s) => s.size))),
      ];

      // Chỉ cập nhật khi có thay đổi thực sự
      // so sánh với màu sắc và kích thước hiện tại của sản phẩm
      // Nếu không có thay đổi thì không cần cập nhật
      const hasColorChanges =
        JSON.stringify(variantColors) !== JSON.stringify(product.colors);
      const hasSizeChanges =
        JSON.stringify(variantSizes) !== JSON.stringify(product.sizes);

      if (hasColorChanges || hasSizeChanges) {
        setProduct((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            colors: variantColors,
            sizes: variantSizes,
          };
        });
      }
    }
  }, [productVariants, product]);

  // Thêm useEffect để tải danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const data = await CategoryService.getAllCategories();
        const parentCategories = data.filter((cat) => cat.parentId === null);
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

  // Thêm useEffect mới để lấy danh mục con khi danh mục cha thay đổi
  useEffect(() => {
    // Skip if not in edit mode or no category selected
    if (!isEditingBasicInfo || !product?.category) return;

    const fetchSubtypes = async () => {
      try {
        setSubtypeLoading(true);
        console.log("Fetching subtypes for categoryId:", product.category);

        // Lấy danh mục con của danh mục đã chọn
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

    fetchSubtypes();
  }, [product?.category, isEditingBasicInfo]);

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Sản phẩm", href: "/admin/products" },
    { label: product?.name || "Chi tiết sản phẩm", active: true },
  ];

  /**
   * Xử lý thay đổi trạng thái sản phẩm
   */
  const handleStatusChange = (newStatus: string): void => {
    if (!product) return;

    setProduct((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        status: newStatus,
        statusLabel:
          newStatus === "active"
            ? "Đang bán"
            : newStatus === "outofstock"
            ? "Hết hàng"
            : "Nháp",
        statusClass:
          newStatus === "active"
            ? "bg-success"
            : newStatus === "outofstock"
            ? "bg-danger"
            : "bg-secondary",
      };
    });
  };

  /**
   * Validate thông tin cơ bản
   */
  const validateBasicInfo = (): boolean => {
    if (!product) return false;

    if (!product.name.trim()) {
      showToast("Vui lòng nhập tên sản phẩm", { type: "error" });
      return false;
    }
    if (!product.sku.trim()) {
      showToast("Vui lòng nhập mã SKU", { type: "error" });
      return false;
    }
    return true;
  };

  /**
   * Handler cho phần thông tin cơ bản
   */
  const handleSaveBasicInfo = async (): Promise<void> => {
    if (!product || !validateBasicInfo()) return;

    setIsSubmittingBasicInfo(true);

    try {
      const basicInfoData = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        brand: product.brand || "",
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

      await ProductService.updateProductBasicInfo(id, basicInfoData);

      // Cập nhật lịch sử sửa đổi
      const newHistoryItem = {
        date: new Date().toLocaleString("vi-VN"),
        user: "Admin",
        action: "Cập nhật thông tin cơ bản",
        detail: "Cập nhật thông tin cơ bản sản phẩm",
      };

      setProduct((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modificationHistory: [newHistoryItem, ...prev.modificationHistory],
        };
      });

      showToast("Cập nhật thông tin cơ bản thành công!", { type: "success" });
      setIsEditingBasicInfo(false);
    } catch (error) {
      console.error("Error updating basic info:", error);
      showToast(
        `Lỗi khi cập nhật: ${
          error instanceof Error ? error.message : "Vui lòng thử lại sau"
        }`,
        { type: "error" }
      );
    } finally {
      setIsSubmittingBasicInfo(false);
    }
  };

  /**
   * Handler cho phần tồn kho
   */
  const handleSaveInventory = async (): Promise<void> => {
    if (!product) return;

    setIsSubmittingInventory(true);

    try {
      const productDetails = product.colors.map((color) => {
        const colorVariants = product.stock.variants.filter(
          (v) => v.color === color
        );

        // Lấy ID nếu đã tồn tại
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

      await ProductService.updateProductInventory(id, productDetails);

      // Cập nhật lịch sử sửa đổi
      const newHistoryItem = {
        date: new Date().toLocaleString("vi-VN"),
        user: "Admin",
        action: "Cập nhật tồn kho",
        detail: "Cập nhật thông tin tồn kho theo màu sắc và kích thước",
      };

      setProduct((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modificationHistory: [newHistoryItem, ...prev.modificationHistory],
        };
      });

      showToast("Cập nhật tồn kho thành công!", { type: "success" });
      setIsEditingInventory(false);
    } catch (error) {
      console.error("Error updating inventory:", error);
      showToast(
        `Lỗi khi cập nhật tồn kho: ${
          error instanceof Error ? error.message : "Vui lòng thử lại sau"
        }`,
        { type: "error" }
      );
    } finally {
      setIsSubmittingInventory(false);
    }
  };

  /**
   * Handler cho phần hình ảnh
   */
  const handleSaveImages = async (): Promise<void> => {
    if (!product) return;

    setIsSubmittingImages(true);

    try {
      // Tải lên hình ảnh mới nếu có
      if (newImages.length > 0) {
        await ProductService.addProductImages(id, newImages);
        setNewImages([]);
      }

      // Xóa các hình ảnh đã đánh dấu để xóa
      if (removedImageIds.length > 0) {
        await ProductService.removeProductImages(id, removedImageIds);
        setRemovedImageIds([]);
      }

      // Cập nhật ảnh chính nếu cần
      const mainImage = product.images.find((img) => img.isMain);
      if (mainImage) {
        await ProductService.setMainProductImage(id, Number(mainImage.id));
      }

      // Cập nhật lịch sử sửa đổi
      const newHistoryItem = {
        date: new Date().toLocaleString("vi-VN"),
        user: "Admin",
        action: "Cập nhật hình ảnh",
        detail: `Cập nhật hình ảnh sản phẩm (Thêm: ${newImages.length}, Xóa: ${removedImageIds.length})`,
      };

      showToast("Cập nhật hình ảnh thành công!", { type: "success" });
      setIsEditingImages(false);

      // Tải lại dữ liệu sản phẩm
      const updatedProductData = await ProductService.getProductVariants(id);
      const formattedProduct = formatProductData(updatedProductData);

      // Cập nhật lịch sử
      formattedProduct.modificationHistory = [
        newHistoryItem,
        ...formattedProduct.modificationHistory,
      ];

      setProduct(formattedProduct);

      // Cập nhật biến thể
      setProductVariants(
        updatedProductData.details.map(
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
    } catch (error) {
      console.error("Error updating images:", error);
      showToast(
        `Lỗi khi cập nhật hình ảnh: ${
          error instanceof Error ? error.message : "Vui lòng thử lại sau"
        }`,
        { type: "error" }
      );
    } finally {
      setIsSubmittingImages(false);
    }
  };

  /**
   * Xử lý xóa hình ảnh
   */
  const handleImageDelete = (imageId: number): void => {
    if (
      !product ||
      !window.confirm("Bạn có chắc chắn muốn xóa hình ảnh này?")
    ) {
      return;
    }

    // Add to removedImageIds for tracking
    setRemovedImageIds((prev) => [...prev, imageId]);

    // Remove from UI
    setProduct((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        images: prev.images.filter((image) => Number(image.id) !== imageId),
      };
    });
  };

  /**
   * Xử lý upload hình ảnh
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!product || !e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const color = prompt("Chọn màu sắc cho ảnh này:", product.colors[0]);

    if (!color || !product.colors.includes(color)) {
      alert("Vui lòng chọn màu hợp lệ");
      return;
    }

    const newUploadedImages = files.map((file) => ({
      file,
      color,
      isMain: false,
    }));

    setNewImages((prev) => [...prev, ...newUploadedImages]);

    // Also add preview to the UI
    const imageURLs = files.map((file) => ({
      id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      url: URL.createObjectURL(file),
      color,
      isMain: false,
    }));

    setProduct((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        images: [...prev.images, ...imageURLs],
      };
    });
  };

  /**
   * Thêm biến thể mới
   */
  const addVariant = (): void => {
    if (!product) return;

    setProductVariants([
      ...productVariants,
      {
        color: "Đen", // Màu mặc định
        price: product.price, // Dùng giá hiện tại của sản phẩm
        originalPrice: product.originalPrice,
        sizes: [{ size: "M", stock: 0 }], // Thêm một kích thước mặc định
      },
    ]);
  };

  /**
   * Xóa biến thể
   */
  const removeVariant = (variantIndex: number): void => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa biến thể này không?")) {
      return;
    }

    const newVariants = [...productVariants];

    // Nếu biến thể đã tồn tại trong DB (có ID), thêm vào removedDetailIds
    if (newVariants[variantIndex].id) {
      setRemovedDetailIds([...removedDetailIds, newVariants[variantIndex].id!]);
    }

    newVariants.splice(variantIndex, 1);
    setProductVariants(newVariants);
  };

  /**
   * Thay đổi thuộc tính biến thể
   */
  const handleVariantChange = (
    variantIndex: number,
    field: keyof ProductDetail,
    value: string | number
  ): void => {
    const newVariants = [...productVariants];
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      [field]: value,
    };
    setProductVariants(newVariants);
  };

  /**
   * Thêm kích thước mới cho biến thể
   */
  const addSize = (variantIndex: number): void => {
    const newVariants = [...productVariants];
    newVariants[variantIndex].sizes = [
      ...newVariants[variantIndex].sizes,
      { size: "M", stock: 0 }, // Kích thước mặc định
    ];
    setProductVariants(newVariants);
  };

  /**
   * Xóa kích thước
   */
  const removeSize = (variantIndex: number, sizeIndex: number): void => {
    const newVariants = [...productVariants];
    newVariants[variantIndex].sizes.splice(sizeIndex, 1);
    setProductVariants(newVariants);
  };

  /**
   * Thay đổi thuộc tính kích thước
   */
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
  };

  /**
   * Lưu biến thể
   */
  const handleSaveVariants = async (): Promise<void> => {
    setIsSubmittingVariants(true);

    try {
      // Gọi API để lưu biến thể
      await ProductService.updateProductVariants(id, productVariants);

      // Cập nhật lại các state
      setIsEditingVariants(false);

      // Hiển thị thông báo thành công
      showToast("Cập nhật biến thể thành công!", { type: "success" });

      // Tải lại dữ liệu sản phẩm
      const updatedProductData = await ProductService.getProductVariants(id);

      // Cập nhật lịch sử sửa đổi
      const newHistoryItem = {
        date: new Date().toLocaleString("vi-VN"),
        user: "Admin",
        action: "Cập nhật biến thể",
        detail: "Cập nhật thông tin biến thể sản phẩm",
      };

      // Định dạng dữ liệu sản phẩm
      const formattedProduct = formatProductData(updatedProductData);
      formattedProduct.modificationHistory = [
        newHistoryItem,
        ...formattedProduct.modificationHistory,
      ];

      setProduct(formattedProduct);

      // Cập nhật biến thể
      setProductVariants(
        updatedProductData.details.map(
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

      // Reset removedDetailIds
      setRemovedDetailIds([]);
    } catch (error) {
      console.error("Error saving variants:", error);
      showToast(
        `Lỗi khi cập nhật biến thể: ${
          error instanceof Error ? error.message : "Vui lòng thử lại sau"
        }`,
        { type: "error" }
      );
    } finally {
      setIsSubmittingVariants(false);
    }
  };

  /**
   * Xử lý xóa sản phẩm
   */
  const handleDeleteProduct = (productItem: Product): void => {
    setProductToDelete(productItem);
    setShowDeleteModal(true);
  };

  /**
   * Xác nhận xóa sản phẩm
   */
  const confirmDelete = async (): Promise<void> => {
    if (!productToDelete) return;

    try {
      await ProductService.deleteProduct(String(productToDelete.id));
      setShowDeleteModal(false);

      showToast("Đã xóa sản phẩm thành công!", { type: "success" });

      // Chuyển hướng sau khi xóa
      setTimeout(() => {
        router.push("/admin/products");
      }, 2000);
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Không thể xóa sản phẩm này.", { type: "error" });
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
              className="btn btn-danger"
              onClick={() => handleDeleteProduct(product as unknown as Product)}
            >
              <i className="fas fa-trash mr-1" /> Xóa
            </button>
          </div>

          {/* Product Overview Card */}
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
                      disabled={!isEditingBasicInfo}
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
                      disabled={!isEditingBasicInfo}
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
                          categoryName: selectedCategory
                            ? selectedCategory.name
                            : "",
                          // Reset subtype khi đổi category
                          subtype: "",
                          subtypeName: "",
                        });
                      }}
                      disabled={categoryLoading || !isEditingBasicInfo}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categoryList.map((category) => (
                        <option
                          key={category.id}
                          value={category.id.toString()}
                        >
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
                      value={product.subtype?.toString() || ""}
                      onChange={(e) => {
                        const selectedSubtypeId = e.target.value;
                        const selectedSubtype = subtypes.find(
                          (s) => s.id.toString() === selectedSubtypeId
                        );
                        setProduct({
                          ...product,
                          subtype: selectedSubtypeId,
                          subtypeName: selectedSubtype
                            ? selectedSubtype.name
                            : "",
                        });
                      }}
                      disabled={
                        subtypeLoading ||
                        !product.category ||
                        !isEditingBasicInfo
                      }
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
                    {!subtypeLoading &&
                      subtypes.length === 0 &&
                      product.category && (
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
                      value={product.brand || ""}
                      onChange={(e) =>
                        setProduct({ ...product, brand: e.target.value })
                      }
                      disabled={!isEditingBasicInfo}
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
                        disabled={!isEditingBasicInfo}
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
                        disabled={!isEditingBasicInfo}
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
                        handleStatusChange(status);
                      }}
                      disabled={!isEditingBasicInfo}
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
                      disabled={!isEditingBasicInfo}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs cho thông tin chi tiết */}
          <div className="card card-primary card-outline card-tabs">
            <div className="card-header p-0 pt-1 border-bottom-0">
              <ul className="nav nav-tabs" role="tablist">
                {/* Tab Info */}
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

                {/* Tab Inventory */}
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

                {/* Tab Images */}
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

                {/* Tab History */}
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

                {/* Tab Variants */}
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
                {/* Nội dung tab Info */}
                <div
                  className={`tab-pane ${activeTab === "info" ? "active" : ""}`}
                  id="info-tab"
                  role="tabpanel"
                  aria-labelledby="info-tab"
                >
                  {/* Nút chỉnh sửa/lưu cho phần thông tin cơ bản */}
                  <div className="d-flex justify-content-end mb-3">
                    {isEditingBasicInfo ? (
                      <div>
                        <button
                          type="button"
                          className="btn btn-success mr-2"
                          onClick={handleSaveBasicInfo}
                          disabled={isSubmittingBasicInfo}
                        >
                          {isSubmittingBasicInfo ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-1" />
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save mr-1" />
                              Lưu thông tin
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setIsEditingBasicInfo(false)}
                          disabled={isSubmittingBasicInfo}
                        >
                          <i className="fas fa-times mr-1" /> Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setIsEditingBasicInfo(true)}
                      >
                        <i className="fas fa-edit mr-1" /> Chỉnh sửa thông tin
                      </button>
                    )}
                  </div>

                  {isEditingBasicInfo ? (
                    // Form chỉnh sửa giống với form tạo mới
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
                              setProduct({
                                ...product,
                                category: e.target.value,
                              });
                            }}
                          >
                            <option value="">-- Chọn danh mục --</option>
                            {categoryList.map((category) => (
                              <option
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.name}
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
                            value={product.brand || ""}
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
                              handleStatusChange(status);
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
                              setProduct({
                                ...product,
                                material: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-group">
                          <label htmlFor="productDescription">
                            Mô tả sản phẩm
                          </label>
                          <textarea
                            className="form-control"
                            id="productDescription"
                            rows={5}
                            placeholder="Nhập mô tả chi tiết về sản phẩm"
                            value={product.description}
                            onChange={(e) =>
                              setProduct({
                                ...product,
                                description: e.target.value,
                              })
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
                                setProduct({
                                  ...product,
                                  featured: e.target.checked,
                                })
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

                        <div className="form-group">
                          <label>Tags</label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Nhập tags và nhấn Enter để thêm"
                              value={tagInput || ""}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  if (
                                    tagInput &&
                                    !product.tags.includes(tagInput)
                                  ) {
                                    setProduct({
                                      ...product,
                                      tags: [...product.tags, tagInput],
                                    });
                                    setTagInput("");
                                  }
                                }
                              }}
                            />
                            <div className="input-group-append">
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                  if (
                                    tagInput &&
                                    !product.tags.includes(tagInput)
                                  ) {
                                    setProduct({
                                      ...product,
                                      tags: [...product.tags, tagInput],
                                    });
                                    setTagInput("");
                                  }
                                }}
                              >
                                <i className="fas fa-plus"></i> Thêm
                              </button>
                            </div>
                          </div>

                          <div className="mt-2">
                            {product.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="badge badge-primary p-2 mr-1 mb-1"
                              >
                                {tag}
                                <button
                                  type="button"
                                  className="btn-close ml-1 border-0 bg-transparent"
                                  style={{ marginLeft: "5px" }}
                                  onClick={() => {
                                    const newTags = [...product.tags];
                                    newTags.splice(index, 1);
                                    setProduct({ ...product, tags: newTags });
                                  }}
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Hiển thị thông tin khi không ở chế độ chỉnh sửa
                    <>
                      <div className="form-group">
                        <label>Mô tả sản phẩm</label>
                        <p>{product.description || "Chưa có mô tả"}</p>
                      </div>

                      <div className="row">
                        <div className="col-md-6 form-group">
                          <label>Màu sắc</label>
                          <div>
                            <div className="form-control-plaintext">
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
                        </div>

                        <div className="col-md-6 form-group">
                          <label>Kích thước</label>
                          <div>
                            <div className="form-control-plaintext">
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
                  {/* Nút chỉnh sửa/lưu cho phần tồn kho */}
                  <div className="d-flex justify-content-end mb-3">
                    {isEditingInventory ? (
                      <div>
                        <button
                          type="button"
                          className="btn btn-success mr-2"
                          onClick={handleSaveInventory}
                          disabled={isSubmittingInventory}
                        >
                          {isSubmittingInventory ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-1" />
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save mr-1" /> Lưu tồn kho
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setIsEditingInventory(false)}
                          disabled={isSubmittingInventory}
                        >
                          <i className="fas fa-times mr-1" /> Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setIsEditingInventory(true)}
                      >
                        <i className="fas fa-edit mr-1" /> Chỉnh sửa tồn kho
                      </button>
                    )}
                  </div>

                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Màu sắc</th>
                          <th>Kích thước</th>
                          <th>Số lượng tồn</th>
                          {isEditingInventory && <th>Thao tác</th>}
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
                              {isEditingInventory ? (
                                <input
                                  type="number"
                                  className="form-control"
                                  value={variant.stock}
                                  onChange={(e) => {
                                    const newValue = parseInt(
                                      e.target.value,
                                      10
                                    );
                                    if (isNaN(newValue) || newValue < 0) return;

                                    const newVariants = [
                                      ...product.stock.variants,
                                    ];
                                    newVariants[index].stock = newValue;

                                    setProduct({
                                      ...product,
                                      stock: {
                                        ...product.stock,
                                        variants: newVariants,
                                        total: newVariants.reduce(
                                          (acc, item) => acc + item.stock,
                                          0
                                        ),
                                      },
                                    });
                                  }}
                                  min="0"
                                />
                              ) : (
                                <span
                                  className={
                                    variant.stock <= 5
                                      ? "text-danger font-weight-bold"
                                      : ""
                                  }
                                >
                                  {variant.stock}
                                </span>
                              )}
                            </td>
                            {isEditingInventory && (
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Bạn có chắc chắn muốn xóa biến thể này?"
                                      )
                                    ) {
                                      const newVariants =
                                        product.stock.variants.filter(
                                          (_, i) => i !== index
                                        );
                                      setProduct({
                                        ...product,
                                        stock: {
                                          ...product.stock,
                                          variants: newVariants,
                                          total: newVariants.reduce(
                                            (acc, item) => acc + item.stock,
                                            0
                                          ),
                                        },
                                      });
                                    }
                                  }}
                                >
                                  <i className="fas fa-trash" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th colSpan={isEditingInventory ? 2 : 2}>
                            Tổng số lượng tồn kho:
                          </th>
                          <th>{product.stock.total}</th>
                          {isEditingInventory && <td></td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {isEditingInventory && (
                    <div className="alert alert-info mt-3">
                      <i className="fas fa-info-circle mr-1" />
                      Chỉnh sửa tồn kho cho biến thể cụ thể cũng có thể được
                      thực hiện trong tab &quot;Biến thể&quot;.
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
                  {/* Nút chỉnh sửa/lưu cho phần hình ảnh */}
                  <div className="d-flex justify-content-end mb-3">
                    {isEditingImages ? (
                      <div>
                        <button
                          type="button"
                          className="btn btn-success mr-2"
                          onClick={handleSaveImages}
                          disabled={isSubmittingImages}
                        >
                          {isSubmittingImages ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-1" />
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save mr-1" /> Lưu hình ảnh
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setIsEditingImages(false)}
                          disabled={isSubmittingImages}
                        >
                          <i className="fas fa-times mr-1" /> Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setIsEditingImages(true)}
                      >
                        <i className="fas fa-edit mr-1" /> Quản lý hình ảnh
                      </button>
                    )}
                  </div>

                  <div className="row">
                    {product.images.map((image) => (
                      <div
                        key={image.id}
                        className="col-md-3 col-sm-6 col-12 mb-3"
                      >
                        <div className="card h-100">
                          <div
                            className="position-relative"
                            style={{ height: "0", paddingBottom: "100%" }}
                          >
                            <Image
                              src={image.url}
                              alt={`${product.name} - ${image.color}`}
                              fill
                              sizes="(max-width: 576px) 100vw, (max-width: 768px) 50vw, (max-width: 992px) 33vw, 25vw"
                              className="card-img-top"
                              style={{ objectFit: "cover" }}
                              priority={image.isMain}
                            />
                            {image.isMain && (
                              <div
                                className="position-absolute p-1"
                                style={{
                                  top: 0,
                                  right: 0,
                                }}
                              >
                                <span className="badge badge-success">
                                  <i className="fas fa-star mr-1" /> Chính
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="card-body">
                            <div className="card-text">
                              <div className="d-flex align-items-center">
                                <div
                                  className="mr-2"
                                  style={{
                                    backgroundColor: image.color.toLowerCase(),
                                    width: "20px",
                                    height: "20px",
                                    border: "1px solid #ddd",
                                    display: "inline-block",
                                  }}
                                ></div>
                                {image.color}
                              </div>
                            </div>
                            {isEditingImages && (
                              <div className="btn-group w-100">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-info"
                                  onClick={() => {
                                    const updatedImages = product.images.map(
                                      (img) => ({
                                        ...img,
                                        isMain: img.id === image.id,
                                      })
                                    );
                                    setProduct({
                                      ...product,
                                      images: updatedImages,
                                    });
                                  }}
                                  disabled={image.isMain}
                                >
                                  <i className="fas fa-star mr-1" /> Đặt làm ảnh
                                  chính
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() =>
                                    handleImageDelete(Number(image.id))
                                  }
                                >
                                  Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {isEditingImages && (
                    <div className="mt-3">
                      <input
                        type="file"
                        id="imageUpload"
                        className="d-none"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="imageUpload" className="btn btn-primary">
                        <i className="fas fa-upload mr-1"></i> Tải lên hình ảnh
                        mới
                      </label>
                      {newImages.length > 0 && (
                        <span className="ml-2 text-success">
                          Đã chọn {newImages.length} hình ảnh mới
                        </span>
                      )}
                    </div>
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
                  <div className="d-flex justify-content-end mb-3">
                    {isEditingVariants ? (
                      <div>
                        <button
                          className="btn btn-success mr-2"
                          onClick={handleSaveVariants}
                          disabled={isSubmittingVariants}
                        >
                          {isSubmittingVariants ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-1"></i>{" "}
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save mr-1"></i> Lưu biến thể
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setIsEditingVariants(false)}
                          disabled={isSubmittingVariants}
                        >
                          <i className="fas fa-times mr-1"></i> Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => setIsEditingVariants(true)}
                      >
                        <i className="fas fa-edit mr-1"></i> Quản lý biến thể
                      </button>
                    )}
                  </div>

                  {/* Hiển thị và quản lý các biến thể */}
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Màu sắc</th>
                          <th>Giá bán</th>
                          <th>Giá gốc</th>
                          <th>Kích thước</th>
                          {isEditingVariants && <th>Thao tác</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {productVariants.map((variant, index) => (
                          <tr key={index}>
                            <td>
                              {isEditingVariants ? (
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
                              ) : (
                                variant.color
                              )}
                            </td>
                            <td>
                              {isEditingVariants ? (
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
                              ) : (
                                `${variant.price.toLocaleString("vi-VN")}đ`
                              )}
                            </td>
                            <td>
                              {isEditingVariants ? (
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
                              ) : (
                                `${variant.originalPrice.toLocaleString(
                                  "vi-VN"
                                )}đ`
                              )}
                            </td>
                            <td>
                              <div className="variant-sizes">
                                {variant.sizes.map((sizeItem, sizeIndex) => (
                                  <div
                                    key={sizeIndex}
                                    className="size-item d-flex mb-2"
                                  >
                                    {isEditingVariants ? (
                                      <>
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
                                      </>
                                    ) : (
                                      <span>
                                        {sizeItem.size}: {sizeItem.stock}
                                      </span>
                                    )}
                                  </div>
                                ))}

                                {isEditingVariants && (
                                  <button
                                    className="btn btn-sm btn-info mt-2"
                                    onClick={() => addSize(index)}
                                  >
                                    <i className="fas fa-plus mr-1"></i> Thêm
                                    kích thước
                                  </button>
                                )}
                              </div>
                            </td>
                            {isEditingVariants && (
                              <td>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeVariant(index)}
                                >
                                  <i className="fas fa-trash"></i> Xóa
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}

                        {isEditingVariants && (
                          <tr>
                            <td colSpan={5}>
                              <button
                                className="btn btn-success"
                                onClick={addVariant}
                              >
                                <i className="fas fa-plus mr-1"></i> Thêm biến
                                thể mới
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
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
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Bạn có chắc chắn muốn xóa sản phẩm{" "}
                  <strong>&quot;{productToDelete.name}&quot;</strong>?
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
                  onClick={confirmDelete}
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
