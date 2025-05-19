"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { useToast } from "@/utils/useToast";
import { validateProductData } from "@/utils/validateProductData";
import { FormattedProduct } from "./types";

// Import context provider
import { ProductProvider, useProductContext } from "./context/ProductContext";

// Define types used in the file
interface ProductSize {
  id: number;
  value: string;
  displayName: string;
  categoryId: number;
  active: boolean;
  displayOrder: number;
}

// Import components
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
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

// Empty product template
const emptyProduct: Partial<FormattedProduct> = {
  name: "",
  sku: "",
  description: "",
  brand: "",
  material: "",
  featured: false,
  status: "draft",
  tags: [],
  categories: [],
  suitabilities: [],
  details: [],
};

// Main component content (will be wrapped with ProductProvider)
const AddProductPageContent: React.FC = () => {
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
    { value: "XXL", label: "XXL" },
  ]);

  // Initialize empty product on component mount
  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({
      type: "SET_PRODUCT",
      payload: emptyProduct as FormattedProduct,
    });
    dispatch({ type: "SET_EDITING", payload: true });
    dispatch({ type: "SET_LOADING", payload: false });
  }, [dispatch]);

  // Fetch categories and other data
  const fetchCategories = useCallback(async () => {
    try {
      const [categories, suitData] = await Promise.all([
        CategoryService.getAllCategories(),
        ProductService.getSuitabilities(),
      ]);

      setCategoryList(categories.filter((cat: Category) => !cat.parentId));
      setSuitabilities(suitData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("Không thể tải dữ liệu danh mục hoặc kích thước", {
        type: "error",
      });
    }
  }, [showToast]);

  // Load data on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle subtypes when category changes
  useEffect(() => {
    if (state.product?.categories && state.product.categories.length > 0) {
      const parentId = state.product.categories[0].id;
      CategoryService.getChildCategories(parentId)
        .then((data) => {
          setSubtypes(data);
        })
        .catch((error) => {
          console.error("Error fetching subtypes:", error);
          showToast("Không thể tải dữ liệu loại sản phẩm", { type: "error" });
        });
    }
  }, [state.product?.categories, showToast]);

  // Fetch sizes based on category
  useEffect(() => {
    if (state.product?.categories && state.product.categories.length > 0) {
      const categoryId = state.product.categories[0].id;
      const loadSizes = async () => {
        try {
          // Load all sizes from API
          const sizes = await ProductService.getSizes();
          console.log("Sizes loaded:", sizes);

          // Filter sizes by categoryId
          const sizeOptions = sizes
            .filter(
              (size: ProductSize) =>
                size.active && size.categoryId === categoryId
            )
            .sort(
              (a: ProductSize, b: ProductSize) =>
                a.displayOrder - b.displayOrder
            )
            .map((size: ProductSize) => ({
              value: size.value,
              label: size.displayName || size.value,
            }));

          setAvailableSizes(
            sizeOptions.length > 0
              ? sizeOptions
              : [
                  { value: "S", label: "S" },
                  { value: "M", label: "M" },
                  { value: "L", label: "L" },
                  { value: "XL", label: "XL" },
                  { value: "XXL", label: "XXL" },
                ]
          );
        } catch (error) {
          console.error("Error loading sizes:", error);
          showToast("Không thể tải dữ liệu kích thước", { type: "error" });
        }
      };

      loadSizes();
    }
  }, [state.product?.categories, showToast]);

  // Handler for saving product
  const handleSaveProduct = async () => {
    if (!state.product) return;

    try {
      dispatch({ type: "SET_SUBMITTING", payload: true });

      // Create a ProductData object with the required price property
      const productDataForValidation = {
        name: state.product.name,
        sku: state.product.sku,
        categories: state.product.categories.map((c) => c.name), // Use category names
        price:
          state.product.details.length > 0 ? state.product.details[0].price : 0, // Use first detail's price
        details: state.product.details.map((detail) => ({
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
        console.error("Product validation errors:", validation.errors);
        dispatch({ type: "SET_SUBMITTING", payload: false });
        return;
      } // Prepare data for API
      const productData = {
        name: state.product.name,
        sku: state.product.sku,
        description: state.product.description,
        brand: state.product.brand,
        material: state.product.material,
        featured: state.product.featured,
        status: state.product.status || "draft",
        tags: state.product.tags || [],
        suitability: state.product.suitabilities.map((s) => s.id), // Note: ProductCreate uses suitability not suitabilities
        categories: state.product.categories.map((c) => c.id),
        subtypeId: state.product.subtype?.id || null,
        details: state.product.details.map((detail) => ({
          color: detail.color,
          price: detail.price,
          originalPrice: detail.originalPrice,
          sizes: detail.inventories.map((inv) => ({
            size: inv.size,
            stock: inv.stock,
          })),
        })),
      };

      // Check if we have images to upload
      if (state.newImages.length > 0) {
        // Group images by color
        const imageFiles: File[] = [];
        const imageColorMapping: Record<number, string> = {};
        const imageMainMapping: Record<number, boolean> = {};

        state.newImages.forEach((img, index) => {
          imageFiles.push(img.file);
          imageColorMapping[index] = img.color;
          imageMainMapping[index] = img.isMain;
        });

        // Create product with images
        const result = await ProductService.createProductWithImages(
          productData,
          imageFiles,
          imageColorMapping,
          imageMainMapping
        );

        // Log the entire response to see its structure
        console.log("API Response for product creation:", result);

        // Check if we have a product ID in the response
        if (!result || !result.id) {
          console.error("No product ID in response:", result);
          showToast("Sản phẩm đã được tạo, nhưng không lấy được ID sản phẩm", {
            type: "warning",
          });
          // Redirect to product listing if we can't get an ID
          router.push("/admin/products");
          return;
        }

        showToast("Sản phẩm đã được tạo thành công", { type: "success" });

        // Redirect to product detail page with correct product ID
        console.log("Redirecting to product detail page with ID:", result.id);
        router.push(`/admin/products/${result.id}`);
      } else {
        // Create product without images
        const result = await ProductService.createProduct(productData);
        console.log("Product created:", result);
        showToast(
          "Sản phẩm đã được tạo thành công. Hãy thêm hình ảnh cho sản phẩm.",
          { type: "success" }
        );

        // Redirect to product listing or the new product detail page
        router.push(`/admin/products/${result.id}`);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tạo sản phẩm",
        { type: "error" }
      );
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  }; // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    // Validate that we have files and a selected color
    if (!fileInput.files) {
      showToast("Không có tập tin nào được chọn", { type: "error" });
      return;
    }

    // Make sure our product is loaded
    if (!state.product) {
      showToast("Không tìm thấy sản phẩm", { type: "error" });
      fileInput.value = "";
      return;
    }

    // Make sure we have product details (colors) before proceeding
    if (state.product.details.length === 0) {
      showToast(
        "Vui lòng thêm ít nhất một màu sắc trong tab Thuộc tính trước khi tải lên hình ảnh",
        { type: "error" }
      );
      fileInput.value = "";
      return;
    }

    // If no color is selected but we have colors available, auto-select the first color
    if (!state.selectedImageColor && state.product.details.length > 0) {
      const firstColor = state.product.details[0].color;
      console.log("Auto-selecting first color:", firstColor);
      dispatch({ type: "SET_SELECTED_IMAGE_COLOR", payload: firstColor });

      // Show a notice to the user
      showToast(`Đã tự động chọn màu ${firstColor} - vui lòng thử lại`, {
        type: "info",
      });
      fileInput.value = "";
      return;
    }

    // When we reach here, we should have a selectedImageColor
    if (!state.selectedImageColor) {
      showToast("Vui lòng chọn một màu sắc trước khi tải hình ảnh", {
        type: "error",
      });
      fileInput.value = "";
      return;
    }

    // Get detail index for the selected color
    const detailIndex = state.product.details.findIndex(
      (d) => d.color === state.selectedImageColor
    );

    // Log for debugging
    console.log("Selected Color:", state.selectedImageColor);
    console.log(
      "Available Colors:",
      state.product.details.map((d) => d.color)
    );
    console.log("Detail Index:", detailIndex);

    // Handle case when detailIndex is -1 (selected color doesn't exist in details)
    if (detailIndex < 0) {
      showToast(
        `Màu sắc đã chọn (${state.selectedImageColor}) không tồn tại trong sản phẩm`,
        { type: "error" }
      );

      // Reset selection and select first available color
      if (state.product.details.length > 0) {
        const firstColor = state.product.details[0].color;
        console.log("Switching to first available color:", firstColor);
        dispatch({ type: "SET_SELECTED_IMAGE_COLOR", payload: firstColor });
        showToast(`Đã chuyển sang màu ${firstColor} - vui lòng thử lại`, {
          type: "info",
        });
      }

      fileInput.value = "";
      return;
    }

    const selectedFiles = Array.from(fileInput.files);
    const currentColorImages = state.product.details[detailIndex].images || [];
    console.log("Current Color Images:", currentColorImages);

    // Check if adding these images would exceed the limit of 10
    if (currentColorImages.length + selectedFiles.length > 10) {
      showToast(
        `Không thể tải lên quá 10 hình ảnh cho mỗi màu sắc (${currentColorImages.length} ảnh hiện tại)`,
        { type: "error" }
      );
      fileInput.value = "";
      return;
    }

    // Process each file
    selectedFiles.forEach((file) => {
      // Create a unique temporary ID for this image
      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const objectURL = URL.createObjectURL(file);

      // Determine if this is the main image
      const isMain = currentColorImages.length === 0;

      // Add the new image to the state
      dispatch({
        type: "ADD_NEW_IMAGE",
        payload: {
          file,
          color: state.selectedImageColor,
          isMain,
        },
      });

      // Also update the product details so the image appears in the UI
      const updatedDetails = [...state.product!.details];
      const existingDetail = updatedDetails[detailIndex];

      updatedDetails[detailIndex] = {
        ...existingDetail,
        images: [
          ...existingDetail.images,
          {
            id: tempId,
            productDetailId: existingDetail.id,
            url: objectURL,
            isMain,
          },
        ],
      };

      dispatch({
        type: "UPDATE_PRODUCT",
        payload: {
          ...state.product,
          details: updatedDetails,
        },
      });
    });

    // Clear the file input
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
        }

        // Create updated details array with the new images list
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
        });

        // Remove image from newImages list if it was a temp image
        if (typeof imageDeleteConfirmation.imageId === "string") {
          // It's a temp image, no need to add to removedImageIds
          // Just filter it from the newImages array
          const newImages = state.newImages.filter((img) => {
            const imgObjectURL = URL.createObjectURL(img.file);
            const tempImageUrls = detail.images
              .filter((img) => typeof img.id === "string")
              .map((img) => img.url);
            return !tempImageUrls.includes(imgObjectURL);
          });

          if (newImages.length !== state.newImages.length) {
            dispatch({ type: "RESET_NEW_IMAGES" });
            newImages.forEach((img) => {
              dispatch({ type: "ADD_NEW_IMAGE", payload: img });
            });
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
  const handleSetMainImage = (imageId: number | string) => {
    if (!state.product || !state.selectedImageColor) return;

    // Find detail index for this color
    const detailIndex = state.product.details.findIndex(
      (d) => d.color === state.selectedImageColor
    );
    if (detailIndex < 0) return;

    // Update images to mark the selected one as main
    const updatedImages = state.product.details[detailIndex].images.map(
      (img) => ({
        ...img,
        isMain: img.id === imageId,
      })
    );

    // Create updated details with the new images
    const updatedDetails = [...state.product.details];
    updatedDetails[detailIndex] = {
      ...updatedDetails[detailIndex],
      images: updatedImages,
    };

    // Use updateProduct for consistency
    dispatch({
      type: "UPDATE_PRODUCT",
      payload: {
        ...state.product,
        details: updatedDetails,
      },
    });

    // Also update the newImages array for files that haven't been uploaded yet
    const newImages = state.newImages.map((img) => {
      if (img.color === state.selectedImageColor) {
        // If this image matches the one we want to set as main by URL comparison
        const matchesMainImage = updatedImages.some(
          (updatedImg) =>
            updatedImg.id === imageId &&
            typeof updatedImg.id === "string" &&
            updatedImg.url === URL.createObjectURL(img.file)
        );

        return {
          ...img,
          isMain: matchesMainImage,
        };
      }
      return img;
    });

    dispatch({ type: "RESET_NEW_IMAGES" });
    newImages.forEach((img) => {
      dispatch({ type: "ADD_NEW_IMAGE", payload: img });
    });
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Sản phẩm", href: "/admin/products" },
    { label: "Thêm sản phẩm mới", active: true },
  ];

  return (
    <AdminLayout title="Thêm sản phẩm mới">
      <section className="content">
        <div className="container-fluid">
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

          <div className="mb-3">
            <button
              className="btn btn-secondary mr-2"
              onClick={() => router.push("/admin/products")}
            >
              <i className="fas fa-arrow-left mr-1" /> Quay lại
            </button>
            <button
              className="btn btn-success mr-2"
              onClick={handleSaveProduct}
              disabled={state.isSubmitting}
            >
              {state.isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1" /> Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-1" /> Lưu sản phẩm
                </>
              )}
            </button>
          </div>

          {/* Tabs container */}
          <TabContainer>
            {/* Info Tab */}
            <BasicInfoTab
              categoryList={categoryList}
              subtypes={subtypes}
              categoryLoading={false}
              subtypeLoading={false}
            />

            {/* Attributes/Variants Tab */}
            <AttributesTab
              suitabilities={suitabilities}
              suitabilityLoading={false}
              availableColors={availableColors}
              availableSizes={availableSizes}
            />

            {/* Inventory Tab */}
            <InventoryTab
              availableColors={availableColors}
              availableSizes={availableSizes}
            />

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
const AddProductPage: React.FC = () => {
  return (
    <ProductProvider>
      <AddProductPageContent />
    </ProductProvider>
  );
};

export default AddProductPage;
