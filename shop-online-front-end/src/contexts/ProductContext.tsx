"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";
import {
  FormattedProduct,
  ProductDetailType,
  // ProductInventory,
} from "@/components/admin/products/types";

// Define context types
type ProductState = {
  product: FormattedProduct | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  isSubmitting: boolean;
  activeTab: string;
  selectedImageColor: string;
  removedImageIds: number[];
  removedDetailIds: number[];
  newImages: Array<{ file: File; color: string; isMain: boolean }>;
};

type ProductAction =
  | { type: "SET_PRODUCT"; payload: FormattedProduct | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_EDITING"; payload: boolean }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_ACTIVE_TAB"; payload: string }
  | { type: "SET_SELECTED_IMAGE_COLOR"; payload: string }
  | { type: "ADD_REMOVED_IMAGE_ID"; payload: number }
  | { type: "ADD_REMOVED_DETAIL_ID"; payload: number }
  | {
      type: "ADD_NEW_IMAGE";
      payload: { file: File; color: string; isMain: boolean };
    }
  | { type: "RESET_NEW_IMAGES" }
  | { type: "RESET_REMOVED_IDS" }
  | { type: "UPDATE_PRODUCT"; payload: Partial<FormattedProduct> }
  | { type: "UPDATE_PRODUCT_FIELD"; payload: { field: string; value: unknown } }
  | {
      type: "UPDATE_PRODUCT_DETAIL";
      payload: { detailIndex: number; field: string; value: unknown };
    }
  | { type: "ADD_PRODUCT_DETAIL"; payload: ProductDetailType }
  | { type: "REMOVE_PRODUCT_DETAIL"; payload: number }
  | { type: "ADD_SIZE_TO_DETAILS"; payload: string }
  | { type: "REMOVE_SIZE_FROM_DETAILS"; payload: string }
  | {
      type: "UPDATE_INVENTORY";
      payload: {
        detailIndex: number;
        inventoryIndex: number;
        field: string;
        value: unknown;
      };
    }
  | { type: "SET_NEW_IMAGE_AS_MAIN"; payload: { color: string; index: number } }
  | { type: "REMOVE_NEW_IMAGE"; payload: number };

type ProductContextType = {
  state: ProductState;
  dispatch: Dispatch<ProductAction>;
  updateProductField: (field: string, value: unknown) => void;
  updateProductDetail: (
    detailIndex: number,
    field: string,
    value: unknown
  ) => void;
  updateProduct: (productData: Partial<FormattedProduct>) => void;
  addProductDetail: (detail: ProductDetailType) => void;
  removeProductDetail: (detailIndex: number) => void;
  addSizeToDetails: (size: string) => void;
  removeSizeFromDetails: (size: string) => void;
  updateInventory: (
    detailIndex: number,
    inventoryIndex: number,
    field: string,
    value: unknown
  ) => void;
};

// Create context
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Initial state
const initialState: ProductState = {
  product: null,
  loading: true,
  error: null,
  isEditing: false,
  isSubmitting: false,
  activeTab: "info",
  selectedImageColor: "",
  removedImageIds: [],
  removedDetailIds: [],
  newImages: [],
};

// Reducer function
const productReducer = (
  state: ProductState,
  action: ProductAction
): ProductState => {
  switch (action.type) {
    case "SET_PRODUCT":
      return { ...state, product: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_EDITING":
      return { ...state, isEditing: action.payload };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_SELECTED_IMAGE_COLOR":
      return { ...state, selectedImageColor: action.payload };
    case "ADD_REMOVED_IMAGE_ID":
      return {
        ...state,
        removedImageIds: [...state.removedImageIds, action.payload],
      };
    case "ADD_REMOVED_DETAIL_ID":
      return {
        ...state,
        removedDetailIds: [...state.removedDetailIds, action.payload],
      };
    case "ADD_NEW_IMAGE":
      return { ...state, newImages: [...state.newImages, action.payload] };
    case "RESET_NEW_IMAGES":
      return { ...state, newImages: [] };
    case "RESET_REMOVED_IDS":
      return { ...state, removedImageIds: [], removedDetailIds: [] };
    case "UPDATE_PRODUCT":
      if (!state.product) return state;
      return {
        ...state,
        product: {
          ...state.product,
          ...action.payload,
        },
      };
    case "UPDATE_PRODUCT_FIELD":
      if (!state.product) return state;
      return {
        ...state,
        product: {
          ...state.product,
          [action.payload.field]: action.payload.value,
        },
      };
    case "UPDATE_PRODUCT_DETAIL":
      if (!state.product) return state;
      return {
        ...state,
        product: {
          ...state.product,
          details: state.product.details.map((detail, index) =>
            index === action.payload.detailIndex
              ? { ...detail, [action.payload.field]: action.payload.value }
              : detail
          ),
        },
      };
    case "ADD_PRODUCT_DETAIL":
      if (!state.product) return state;
      return {
        ...state,
        product: {
          ...state.product,
          details: [...state.product.details, action.payload],
        },
        // When adding a new color detail, set it as the selected image color
        selectedImageColor: action.payload.color,
      };
    case "REMOVE_PRODUCT_DETAIL":
      if (!state.product) return state;
      const detailToRemove = state.product.details[action.payload];
      return {
        ...state,
        product: {
          ...state.product,
          details: state.product.details.filter(
            (_, index) => index !== action.payload
          ),
        },
        removedDetailIds: detailToRemove.id
          ? [...state.removedDetailIds, detailToRemove.id]
          : state.removedDetailIds,
      };
    case "ADD_SIZE_TO_DETAILS":
      if (!state.product) return state;
      return {
        ...state,
        product: {
          ...state.product,
          details: state.product.details.map((detail) => ({
            ...detail,
            inventories: [
              ...detail.inventories,
              {
                id: 0,
                productDetailId: detail.id,
                size: action.payload,
                stock: 0,
              },
            ],
          })),
        },
      };
    case "REMOVE_SIZE_FROM_DETAILS":
      if (!state.product) return state;
      return {
        ...state,
        product: {
          ...state.product,
          details: state.product.details.map((detail) => ({
            ...detail,
            inventories: detail.inventories.filter(
              (inv) => inv.size !== action.payload
            ),
          })),
        },
      };
    case "UPDATE_INVENTORY":
      if (!state.product) return state;
      return {
        ...state,
        product: {
          ...state.product,
          details: state.product.details.map((detail, detailIndex) =>
            detailIndex === action.payload.detailIndex
              ? {
                  ...detail,
                  inventories: detail.inventories.map((inv, invIndex) =>
                    invIndex === action.payload.inventoryIndex
                      ? { ...inv, [action.payload.field]: action.payload.value }
                      : inv
                  ),
                }
              : detail
          ),
        },
      };
    case "RESET_REMOVED_IDS":
      return {
        ...state,
        removedImageIds: [],
        removedDetailIds: [],
      };
    case "ADD_NEW_IMAGE": {
      // Kiểm tra xem chúng ta có đạt đến giới hạn hình ảnh cho màu này chưa
      const colorDetails = state.product?.details.find(
        (d) => d.color === action.payload.color
      );

      if (colorDetails) {
        const currentImageCount = colorDetails.images.length;
        const pendingImageCount = state.newImages.filter(
          (img) => img.color === action.payload.color
        ).length;

        if (currentImageCount + pendingImageCount >= 10) {
          // Đã đạt giới hạn 10 hình ảnh
          console.warn(
            `Đã đạt giới hạn 10 hình ảnh cho màu ${action.payload.color}`
          );
          return state;
        }
      }

      // Nếu là ảnh đầu tiên hoặc được đánh dấu là isMain, cập nhật tất cả các ảnh khác
      if (action.payload.isMain) {
        // Cập nhật state.newImages để đánh dấu tất cả các ảnh khác không phải là ảnh chính
        const updatedNewImages = state.newImages.map((img) => ({
          ...img,
          isMain: img.color === action.payload.color ? false : img.isMain,
        }));

        return {
          ...state,
          newImages: [...updatedNewImages, action.payload],
        };
      }

      // Nếu không phải là ảnh chính, chỉ thêm vào mảng
      return {
        ...state,
        newImages: [...state.newImages, action.payload],
      };
    }
    case "SET_NEW_IMAGE_AS_MAIN": {
      return {
        ...state,
        newImages: state.newImages.map((img, idx) => ({
          ...img,
          isMain:
            img.color === action.payload.color
              ? idx === action.payload.index
              : img.isMain && img.color !== action.payload.color,
        })),
      };
    }

    case "REMOVE_NEW_IMAGE": {
      const wasMain = state.newImages[action.payload]?.isMain;
      const removedColor = state.newImages[action.payload]?.color;

      // Xóa ảnh khỏi mảng
      const filteredImages = state.newImages.filter(
        (_, idx) => idx !== action.payload
      );

      // Nếu ảnh bị xóa là ảnh chính và còn ảnh khác cùng màu, đặt ảnh đầu tiên làm ảnh chính
      if (wasMain) {
        const firstImageOfSameColor = filteredImages.findIndex(
          (img) => img.color === removedColor
        );
        if (firstImageOfSameColor >= 0) {
          filteredImages[firstImageOfSameColor].isMain = true;
        }
      }

      return {
        ...state,
        newImages: filteredImages,
      };
    }

    default:
      return state;
  }
};

// Provider component
export const ProductProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(productReducer, initialState);
  // Helper functions for common operations
  const updateProductField = (field: string, value: unknown) => {
    dispatch({ type: "UPDATE_PRODUCT_FIELD", payload: { field, value } });
  };

  const updateProductDetail = (
    detailIndex: number,
    field: string,
    value: unknown
  ) => {
    dispatch({
      type: "UPDATE_PRODUCT_DETAIL",
      payload: { detailIndex, field, value },
    });
  };
  const updateProduct = (productData: Partial<FormattedProduct>) => {
    dispatch({ type: "UPDATE_PRODUCT", payload: productData });
  };

  const addProductDetail = (detail: ProductDetailType) => {
    dispatch({ type: "ADD_PRODUCT_DETAIL", payload: detail });
  };

  const removeProductDetail = (detailIndex: number) => {
    dispatch({ type: "REMOVE_PRODUCT_DETAIL", payload: detailIndex });
  };

  const addSizeToDetails = (size: string) => {
    dispatch({ type: "ADD_SIZE_TO_DETAILS", payload: size });
  };

  const removeSizeFromDetails = (size: string) => {
    dispatch({ type: "REMOVE_SIZE_FROM_DETAILS", payload: size });
  };
  const updateInventory = (
    detailIndex: number,
    inventoryIndex: number,
    field: string,
    value: unknown
  ) => {
    dispatch({
      type: "UPDATE_INVENTORY",
      payload: { detailIndex, inventoryIndex, field, value },
    });
  };

  return (
    <ProductContext.Provider
      value={{
        state,
        dispatch,
        updateProductField,
        updateProductDetail,
        updateProduct,
        addProductDetail,
        removeProductDetail,
        addSizeToDetails,
        removeSizeFromDetails,
        updateInventory,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook for using the product context
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
