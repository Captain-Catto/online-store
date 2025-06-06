"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { useToast } from "@/utils/useToast";
import { validateProductData } from "@/utils/validateProductData";
import { FormattedProduct } from "./types";
import { AuthService } from "@/services/AuthService";

// Import context provider
import { ProductProvider, useProductContext } from "@/contexts/ProductContext";
import { ProductSize } from "@/types/product";

// Import components
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import TabContainer from "./components/TabContainer";
import BasicInfoTab from "./components/BasicInfoTab";
import AttributesTab from "./components/AttributesTab";
import InventoryTab from "./components/InventoryTab";
import ImagesTab from "./components/ImagesTab";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";

interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  parentId?: number | string | null;
  isActive?: boolean;
}

// Sản phẩm rỗng để khởi tạo state
// khi thêm sản phẩm mới
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

// Component này sử dụng context để quản lý trạng thái sản phẩm
// và các hành động liên quan đến sản phẩm
const AddProductPageContent: React.FC = () => {
  const router = useRouter();
  const { showToast, Toast } = useToast();

  // State và dispatch từ context
  // để quản lý trạng thái sản phẩm
  const { state, dispatch } = useProductContext();

  // Các state để quản lý danh sách danh mục, loại sản phẩm con,
  // và các thuộc tính khác
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [subtypes, setSubtypes] = useState<Category[]>([]);
  const [suitabilities, setSuitabilities] = useState<
    Array<{ id: number; name: string }>
  >([]);

  // State xác nhận xóa ảnh
  const [imageDeleteConfirmation, setImageDeleteConfirmation] = useState({
    isOpen: false,
    imageId: null as number | string | null,
    imageColor: "",
  });

  // Màu sắc và kích thước có sẵn
  const availableColors = [
    { key: "black", label: "Đen" },
    { key: "white", label: "Trắng" },
    { key: "red", label: "Đỏ" },
    { key: "blue", label: "Xanh dương" },
    { key: "green", label: "Xanh lá" },
    { key: "yellow", label: "Vàng" },
    { key: "grey", label: "Xám" },
  ];

  // State cho kích thước có sẵn
  const [availableSizes, setAvailableSizes] = useState<
    Array<{ value: string; label: string }>
  >([
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "2XL", label: "2XL" },
  ]);

  useEffect(() => {
    if (!AuthService.isAdmin()) {
      router.push("/login");
    }
  }, [router]);

  // thiết lập trạng thái sản phẩm ban đầu
  // và trạng thái chỉnh sửa
  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({
      type: "SET_PRODUCT",
      payload: emptyProduct as FormattedProduct,
    });
    dispatch({ type: "SET_EDITING", payload: true });
    dispatch({ type: "SET_LOADING", payload: false });
  }, [dispatch]);

  // hàm lấy danh sách danh mục và kích thước
  // từ API khi component được mount
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

  // load data khi component được mount
  // và khi có sự thay đổi trong danh sách danh mục
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // load danh sách loại sản phẩm con
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
    }
  }, [state.product?.categories, showToast]);

  const [sizesLoading, setSizesLoading] = useState<boolean>(false);

  // hàm lấy kích thước theo danh mục
  const fetchSizeByCategory = useCallback(
    async (categoryId: number | string) => {
      try {
        setSizesLoading(true);

        const sizes = await ProductService.getSizesByCategory(categoryId);

        // chuyển đổi kích thước thành định dạng label-value
        // để sử dụng trong select
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
        // chuyển về kích thước mặc định nếu không tìm thấy
        // hoặc có lỗi
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

  // hàm lấy size theo danh mục
  // khi danh mục sản phẩm thay đổi
  useEffect(() => {
    if (state.product?.categories && state.product.categories.length > 0) {
      const categoryId = state.product.categories[0].id;
      fetchSizeByCategory(categoryId);
    }
  }, [state.product?.categories, fetchSizeByCategory]);

  // hàm lưu sản phẩm
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

        // Check if we have a product ID in the response
        if (!result || !result.id) {
          showToast("Sản phẩm đã được tạo, nhưng không lấy được ID sản phẩm", {
            type: "warning",
          });
          // Redirect to product listing if we can't get an ID
          router.push("/admin/products");
          return;
        }

        showToast("Sản phẩm đã được tạo thành công", { type: "success" });

        // Redirect to product detail page with correct product ID
        router.push(`/admin/products/${result.id}`);
      } else {
        // Create product without images
        const result = await ProductService.createProduct(productData);
        showToast(
          "Sản phẩm đã được tạo thành công. Hãy thêm hình ảnh cho sản phẩm.",
          { type: "success" }
        );

        // Redirect to product listing or the new product detail page
        router.push(`/admin/products/${result.id}`);
      }
    } catch (error) {
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

    // Handle case when detailIndex is -1 (selected color doesn't exist in details)
    if (detailIndex < 0) {
      showToast(
        `Màu sắc đã chọn (${state.selectedImageColor}) không tồn tại trong sản phẩm`,
        { type: "error" }
      );

      // Reset selection and select first available color
      if (state.product.details.length > 0) {
        const firstColor = state.product.details[0].color;
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

    // Check if adding these images would exceed the limit of 10
    if (currentColorImages.length + selectedFiles.length > 10) {
      showToast(
        `Không thể tải lên quá 10 hình ảnh cho mỗi màu sắc (${currentColorImages.length} ảnh hiện tại)`,
        { type: "error" }
      );
      fileInput.value = "";
      return;
    } // Check if this is the first set of images for this color
    const isFirstUpload = currentColorImages.length === 0;

    // Create temporary IDs and object URLs for all files
    const newImageData = selectedFiles.map((file, index) => {
      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}_${index}`;
      const objectURL = URL.createObjectURL(file);

      // Only the first image is main if this is the first upload for this color
      const isMain = isFirstUpload && index === 0;

      return {
        file,
        tempId,
        objectURL,
        isMain,
        color: state.selectedImageColor,
      };
    });

    // Process each file
    newImageData.forEach((imageData) => {
      // Add the new image to the state
      dispatch({
        type: "ADD_NEW_IMAGE",
        payload: {
          file: imageData.file,
          color: imageData.color,
          isMain: imageData.isMain,
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
            id: imageData.tempId,
            productDetailId: existingDetail.id,
            url: imageData.objectURL,
            isMain: imageData.isMain,
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
