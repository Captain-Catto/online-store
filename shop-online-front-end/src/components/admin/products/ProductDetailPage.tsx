"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { useToast } from "@/utils/useToast";
import { FormattedProduct } from "./types";
import { validateProductData } from "@/utils/validateProductData";
import { getProductErrorMessage } from "@/utils/productErrorHandler";
import { ProductSize } from "@/types/product";
import { AuthService } from "@/services/AuthService";

// Import context provider
import { ProductProvider, useProductContext } from "@/contexts/ProductContext";
// Import components
import ProductHeader from "./components/ProductHeader";
import TabContainer from "./components/TabContainer";
import BasicInfoTab from "./components/BasicInfoTab";
import AttributesTab from "./components/AttributesTab";
import InventoryTab from "./components/InventoryTab";
import ImagesTab from "./components/ImagesTab";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";

// Define types for categories
interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  parentId?: number | string | null;
  isActive?: boolean;
}

// Main component content (will be wrapped with ProductProvider)
const ProductDetailPageContent: React.FC = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { showToast, Toast } = useToast();

  // State from context
  const { state, dispatch } = useProductContext();

  // Local component state
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [subtypes, setSubtypes] = useState<Category[]>([]);
  const [suitabilities, setSuitabilities] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageDeleteConfirmation, setImageDeleteConfirmation] = useState({
    isOpen: false,
    imageId: null as number | string | null,
    imageColor: "",
  });

  // Available colors and sizes
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
    { value: "2XL", label: "2XL" },
  ]);

  // kiểm tra quyền
  useEffect(() => {
    if (!AuthService.isAdmin()) {
      router.push("/login");
    }
  }, [router]);

  // Fetch product data
  const fetchProductData = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const productData = await ProductService.getProductVariants(id);

      dispatch({ type: "SET_PRODUCT", payload: productData });

      // Set selected color for images
      if (productData.details.length > 0) {
        dispatch({
          type: "SET_SELECTED_IMAGE_COLOR",
          payload: productData.details[0].color,
        });
      }
    } catch {
      dispatch({
        type: "SET_ERROR",
        payload: "Không thể tải thông tin sản phẩm",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [id, dispatch]);

  // Fetch categories and other data
  const fetchCategories = useCallback(async () => {
    try {
      const [categories, suitData] = await Promise.all([
        CategoryService.getAllCategories(),
        ProductService.getSuitabilities(),
      ]);

      setCategoryList(categories.filter((cat: Category) => !cat.parentId));
      setSuitabilities(suitData);
    } catch {
      showToast("Không thể tải dữ liệu danh mục hoặc kích thước", {
        type: "error",
      });
    }
  }, [showToast]);
  // State for tracking size loading
  const [sizesLoading, setSizesLoading] = useState<boolean>(false);

  // fetch size theo category được chọn
  const fetchSizeByCategory = useCallback(
    async (categoryId: number | string) => {
      try {
        setSizesLoading(true);

        const sizes = await ProductService.getSizesByCategory(categoryId);
        const formattedSizes = sizes.map((size: ProductSize) => ({
          value: size.value,
          label: size.displayName || size.value,
        }));

        setAvailableSizes(
          formattedSizes.length > 0
            ? formattedSizes
            : [
                { value: "S", label: "S" },
                { value: "M", label: "M" },
                { value: "L", label: "L" },
                { value: "XL", label: "XL" },
                { value: "2XL", label: "2XL" },
              ]
        );

        if (formattedSizes.length === 0) {
          showToast(
            "Không tìm thấy kích thước cho danh mục này, sử dụng kích thước mặc định",
            { type: "warning" }
          );
        }
      } catch {
        showToast("Không thể tải dữ liệu kích thước", { type: "error" });
        // Fall back to default sizes if there's an error
        setAvailableSizes([
          { value: "S", label: "S" },
          { value: "M", label: "M" },
          { value: "L", label: "L" },
          { value: "XL", label: "XL" },
          { value: "2XL", label: "2XL" },
        ]);
      } finally {
        setSizesLoading(false);
      }
    },
    [showToast]
  );

  // Load data on component mount
  useEffect(() => {
    fetchProductData();
    fetchCategories();
  }, [fetchProductData, fetchCategories]);

  // Handle subtypes when category changes
  useEffect(() => {
    if (state.product?.categories && state.product.categories.length > 0) {
      const parentId = state.product.categories[0].id;
      CategoryService.getChildCategories(parentId)
        .then((data) => {
          setSubtypes(data);
        })
        .catch(() => {
          showToast("Không thể tải dữ liệu loại sản phẩm", { type: "error" });
        });

      // fetch sizee cho category được chọn
      fetchSizeByCategory(parentId);
    }
  }, [state.product?.categories, showToast, fetchSizeByCategory]);
  // Handler for saving product
  const handleSaveProduct = async () => {
    if (!state.product) return;

    try {
      dispatch({ type: "SET_SUBMITTING", payload: true });

      // Create data structure for API
      const productData = {
        ...state.product,
      } as FormattedProduct; // Ensure all required fields are present      // Create properly formatted data for validation
      const productDataForValidation = {
        name: productData.name,
        sku: productData.sku,
        categories: productData.categories.map((c) => c.name),
        price:
          productData.details.length > 0 ? productData.details[0].price : 0,
        details: productData.details.map((detail) => ({
          id: detail.id,
          color: detail.color,
          price: detail.price,
          originalPrice: detail.originalPrice,
          sizes: detail.inventories.map((inv) => ({
            size: inv.size,
            stock: inv.stock,
          })),
        })),
      };

      // Validate product data before submitting
      const validation = validateProductData(productDataForValidation);

      if (!validation.isValid) {
        // Display the first error message
        const errorMessage =
          validation.errors[0].message || "Dữ liệu sản phẩm không hợp lệ";
        showToast(errorMessage, { type: "error" });

        // Log all errors for debugging
        dispatch({ type: "SET_SUBMITTING", payload: false });
        return;
      }
      // Add removed items - make a copy to avoid reference issues
      const removedData = {
        removedImageIds: [...state.removedImageIds],
        removedDetailIds: [...state.removedDetailIds],
      }; // Notify user about image deletions if needed
      if (state.removedImageIds.length > 0) {
        // Filter out any non-numeric or invalid IDs
        const validImageIds = state.removedImageIds.filter(
          (id) => typeof id === "number" && id > 0
        );

        if (validImageIds.length > 0) {
          // Just show notification to user that we'll be deleting images
          showToast(
            `Sẽ xóa ${validImageIds.length} hình ảnh khi lưu sản phẩm`,
            { type: "info" }
          );

          // Update removedData to only include valid IDs
          removedData.removedImageIds = validImageIds;

          // We'll let the updateProduct handle the actual deletion
        } else {
          console.warn("No valid image IDs found in removedImageIds array");
        }
      } // 2. Call API to update product data without handling image deletion again
      // Just let the normal update process run
      await ProductService.updateProduct(id, productData, removedData);

      // 3. Handle new image uploads if needed
      if (state.newImages.length > 0) {
        await ProductService.addProductImages(id, state.newImages);
      } // Create appropriate success message
      let successMessage = "Sản phẩm đã được cập nhật thành công";

      // Include information about deleted images if applicable
      if (removedData.removedImageIds.length > 0) {
        const validImageIds = removedData.removedImageIds.filter(
          (id) => typeof id === "number" && id > 0
        );
        if (validImageIds.length > 0) {
          successMessage += `. Đã xóa ${validImageIds.length} hình ảnh.`;
        }
      }

      showToast(successMessage, { type: "success" });

      // Reset states
      dispatch({ type: "SET_EDITING", payload: false });
      dispatch({ type: "RESET_NEW_IMAGES" });
      dispatch({ type: "RESET_REMOVED_IDS" });

      // Reload product data to see changes
      await fetchProductData();
    } catch (error) {
      // Sử dụng trình xử lý lỗi để lấy thông báo chi tiết
      const errorMessage = getProductErrorMessage(error);

      showToast(errorMessage, { type: "error" });
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  // Handler for deleting product
  const handleDeleteProduct = async () => {
    try {
      dispatch({ type: "SET_SUBMITTING", payload: true });
      await ProductService.deleteProduct(id);
      showToast("Sản phẩm đã được xóa thành công", { type: "success" });
      router.push("/admin/products");
    } catch {
      showToast("Có lỗi xảy ra khi xóa sản phẩm", { type: "error" });
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
      setShowDeleteModal(false);
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    // Kiểm tra có files được chọn không
    if (!fileInput.files || fileInput.files.length === 0) {
      showToast("Không có tập tin nào được chọn", { type: "error" });
      return;
    }

    // Đảm bảo sản phẩm đã được tải
    if (!state.product) {
      showToast("Không tìm thấy sản phẩm", { type: "error" });
      fileInput.value = "";
      return;
    }

    // Đảm bảo đã có chi tiết sản phẩm (các màu) trước khi tiếp tục
    if (state.product.details.length === 0) {
      showToast(
        "Vui lòng thêm ít nhất một màu sắc trong tab Thuộc tính trước khi tải lên hình ảnh",
        { type: "error" }
      );
      fileInput.value = "";
      return;
    }

    // Nếu không có màu được chọn nhưng có các màu có sẵn, tự động chọn màu đầu tiên
    if (!state.selectedImageColor && state.product.details.length > 0) {
      const firstColor = state.product.details[0].color;
      dispatch({ type: "SET_SELECTED_IMAGE_COLOR", payload: firstColor });
    }

    // Tìm màu đã chọn trong chi tiết sản phẩm
    const colorDetail = state.product.details.find(
      (detail) => detail.color === state.selectedImageColor
    );

    if (!colorDetail) {
      showToast(
        `Không tìm thấy chi tiết cho màu đã chọn: ${state.selectedImageColor}`,
        {
          type: "error",
        }
      );
      return;
    }

    // Đếm số lượng hình ảnh hiện tại của màu này
    const currentImageCount = colorDetail.images.length;

    // Kiểm tra xem việc thêm hình ảnh mới có vượt quá giới hạn không
    if (currentImageCount + fileInput.files.length > 10) {
      showToast(
        `Bạn chỉ có thể tải lên tối đa 10 hình ảnh cho mỗi màu (hiện tại: ${currentImageCount})`,
        { type: "error" }
      );
      fileInput.value = "";
      return;
    }

    // Chuyển đổi FileList sang Array để dễ xử lý
    const newFiles = Array.from(fileInput.files);

    // Kiểm tra kích thước và loại tập tin
    const invalidFiles = newFiles.filter(
      (file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024
    );

    if (invalidFiles.length > 0) {
      showToast(
        `${invalidFiles.length} tập tin không hợp lệ (kích thước > 5MB hoặc không phải là hình ảnh)`,
        { type: "error" }
      );
      fileInput.value = "";
      return;
    } // Xử lý tất cả các tập tin được chọn
    const isFirstUploadForColor = currentImageCount === 0;

    // Thêm từng file vào state
    newFiles.forEach((file, index) => {
      // Chỉ đặt hình ảnh đầu tiên làm ảnh chính khi là lần tải đầu tiên
      // Các hình ảnh khác sẽ không được đánh dấu là ảnh chính
      const isMain = isFirstUploadForColor && index === 0;

      dispatch({
        type: "ADD_NEW_IMAGE",
        payload: {
          file,
          color: state.selectedImageColor,
          isMain,
        },
      });
    });

    // Hiển thị thông báo thành công
    showToast(
      `Đã thêm ${newFiles.length} hình ảnh cho màu ${state.selectedImageColor}`,
      { type: "success" }
    );

    // Reset input để cho phép chọn lại cùng các tập tin
    fileInput.value = "";
  };

  // Handle image deletion
  const handleImageDeleteRequest = (imageId: number | string) => {
    if (!state.selectedImageColor) return;

    setImageDeleteConfirmation({
      isOpen: true,
      imageId,
      imageColor: state.selectedImageColor,
    });
  };

  const confirmImageDelete = () => {
    if (!imageDeleteConfirmation.imageId || !imageDeleteConfirmation.imageColor)
      return;

    // Find detail index for this color
    const detailIndex = state.product!.details.findIndex(
      (d) => d.color === imageDeleteConfirmation.imageColor
    );

    if (detailIndex >= 0) {
      // Remove image from detail
      const detail = state.product!.details[detailIndex];
      const imageIndex = detail.images.findIndex(
        (img) => img.id === imageDeleteConfirmation.imageId
      );

      if (imageIndex >= 0) {
        const isMainImage = detail.images[imageIndex].isMain;
        const updatedImages = detail.images.filter(
          (img) => img.id !== imageDeleteConfirmation.imageId
        );

        // If we removed the main image and there are other images, set a new main
        if (isMainImage && updatedImages.length > 0) {
          updatedImages[0].isMain = true;
        } // Create updated details array with the new images list
        const updatedDetails = state.product!.details.map((detail, idx) =>
          idx === detailIndex ? { ...detail, images: updatedImages } : detail
        );

        // Use updateProduct for consistency
        dispatch({
          type: "UPDATE_PRODUCT",
          payload: {
            ...state.product,
            details: updatedDetails,
          },
        }); // If it was a real image (not temp), add it to removedImageIds
        if (typeof imageDeleteConfirmation.imageId === "number") {
          const imageIdToRemove = imageDeleteConfirmation.imageId as number;

          // Make sure we're dealing with a numeric ID
          if (!isNaN(imageIdToRemove) && imageIdToRemove > 0) {
            // Track the ID for later deletion when saving the product
            dispatch({
              type: "ADD_REMOVED_IMAGE_ID",
              payload: imageIdToRemove,
            });

            showToast(
              "Đã đánh dấu hình ảnh để xóa. Bấm 'Lưu' để hoàn tất xóa",
              { type: "info" }
            );
          } else {
            console.warn(`Invalid image ID detected: ${imageIdToRemove}`);
          }
        }
      }
    }

    // Close modal
    setImageDeleteConfirmation({
      isOpen: false,
      imageId: null,
      imageColor: "",
    });
  };

  // Handler for setting main product image
  const handleSetMainImage = async (imageId: number | string) => {
    try {
      if (!state.product) return;

      // First update local state
      const productId = state.product.id;
      const selectedColor = state.selectedImageColor;

      if (!selectedColor) {
        showToast("Vui lòng chọn màu sắc trước", { type: "warning" });
        return;
      }

      // Find the detail for this color
      const detailIndex = state.product.details.findIndex(
        (d) => d.color === selectedColor
      );
      if (detailIndex < 0) return;

      // Update local state first for immediate feedback
      const updatedImages = state.product.details[detailIndex].images.map(
        (img) => ({
          ...img,
          isMain: img.id === imageId,
        })
      );

      const updatedDetails = [...state.product.details];
      updatedDetails[detailIndex] = {
        ...updatedDetails[detailIndex],
        images: updatedImages,
      };

      dispatch({
        type: "UPDATE_PRODUCT",
        payload: {
          ...state.product,
          details: updatedDetails,
        },
      });

      // Then update on server if it's a real image (not a temporary one)
      if (typeof imageId === "number") {
        await ProductService.setMainProductImage(productId, imageId);
        showToast("Đã đặt ảnh chính", { type: "success" });

        // Refetch product data to ensure server and client are in sync
        await fetchProductData();
      }
    } catch (error) {
      showToast("Lỗi khi đặt ảnh chính: " + getProductErrorMessage(error), {
        type: "error",
      });

      // Revert to server state on error
      await fetchProductData();
    }
  }; // Debug functions removed

  return (
    <AdminLayout
      title={
        state.product
          ? `Chi tiết sản phẩm ${state.product.name}`
          : "Chi tiết sản phẩm"
      }
    >
      <section className="content">
        <div className="container-fluid">
          {" "}
          {/* Header and actions */}
          <ProductHeader
            onDelete={() => setShowDeleteModal(true)}
            onSave={handleSaveProduct}
          />
          {/* Tabs container */}
          <TabContainer>
            {/* Info Tab */}
            <BasicInfoTab
              categoryList={categoryList}
              subtypes={subtypes}
              categoryLoading={false}
              subtypeLoading={false}
            />
            {/* Attributes/Variants Tab */}{" "}
            <AttributesTab
              suitabilities={suitabilities}
              suitabilityLoading={false}
              availableColors={availableColors}
              availableSizes={availableSizes}
              sizesLoading={sizesLoading}
            />
            {/* Inventory Tab */}
            <InventoryTab
              availableColors={availableColors}
              availableSizes={availableSizes}
            />{" "}
            {/* Images Tab */}
            <ImagesTab
              availableColors={availableColors}
              handleImageChange={handleImageChange}
              handleRemoveImage={handleImageDeleteRequest}
              handleSetMainImage={handleSetMainImage}
            />
          </TabContainer>
          {/* Confirmation Modals */}
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            title="Xác nhận xóa sản phẩm"
            message={`Bạn có chắc chắn muốn xóa sản phẩm "${state.product?.name}" không? 
                     Hành động này không thể hoàn tác.`}
            onConfirm={handleDeleteProduct}
            onCancel={() => setShowDeleteModal(false)}
          />
          <DeleteConfirmationModal
            isOpen={imageDeleteConfirmation.isOpen}
            title="Xác nhận xóa hình ảnh"
            message="Bạn có chắc chắn muốn xóa hình ảnh này không?"
            onConfirm={confirmImageDelete}
            onCancel={() =>
              setImageDeleteConfirmation({
                isOpen: false,
                imageId: null,
                imageColor: "",
              })
            }
          />
          {/* Toast notifications */}
          {Toast}
        </div>
      </section>
    </AdminLayout>
  );
};

// Wrapper component with context provider
const NewProductDetailPage: React.FC = () => {
  return (
    <ProductProvider>
      <ProductDetailPageContent />
    </ProductProvider>
  );
};

export default NewProductDetailPage;
