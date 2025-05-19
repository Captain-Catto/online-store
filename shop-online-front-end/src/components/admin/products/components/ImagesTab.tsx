"use client";

import React, { memo } from "react";
import Image from "next/image";
import { useProductContext } from "@/contexts/ProductContext";
import TabPanel from "./TabPanel";

interface ColorImage {
  id: number | string;
  url: string;
  isMain: boolean;
}

interface ImagesTabProps {
  availableColors: { key: string; label: string }[];
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (imageId: number | string) => void;
  handleSetMainImage?: (imageId: number | string) => void;
}

const ImagesTab: React.FC<ImagesTabProps> = memo(
  ({
    availableColors,
    handleImageChange,
    handleRemoveImage,
    handleSetMainImage: propHandleSetMainImage,
  }) => {
    const { state, dispatch } = useProductContext();
    const { product, isEditing, selectedImageColor } = state;

    // Use useEffect for initialization - this will run once after component mounts
    React.useEffect(() => {
      // Only set a color if product is loaded, no color is selected yet, and colors are available
      if (product && !selectedImageColor && product.details.length > 0) {
        const firstAvailableColor = product.details[0].color;
        dispatch({
          type: "SET_SELECTED_IMAGE_COLOR",
          payload: firstAvailableColor,
        });
        console.log("Auto-selected first color:", firstAvailableColor);
      }
    }, [product, selectedImageColor, dispatch]);

    // Return early if product is not loaded
    if (!product) return null;

    const productColors = product.details.map((d) => d.color);

    // Get images for the selected color
    const colorImages: Record<string, ColorImage[]> = {};
    product.details.forEach((detail) => {
      colorImages[detail.color] = detail.images.map((img) => ({
        id: img.id,
        url: img.url,
        isMain: img.isMain,
      }));
    });
    const handleColorSelect = (color: string) => {
      // Verify the color exists in product details before setting it
      const colorExists = product.details.some(
        (detail) => detail.color === color
      );
      if (colorExists) {
        dispatch({ type: "SET_SELECTED_IMAGE_COLOR", payload: color });
        console.log(`Selected color changed to: ${color}`);

        // Find the display name of this color for logging
        const colorLabel =
          availableColors.find((c) => c.key === color)?.label || color;
        console.log(`Color display name: ${colorLabel}`);
      } else {
        console.warn(`Selected color ${color} not found in product details`);
      }
    };

    // Use the provided handleSetMainImage prop if available, otherwise use the local implementation
    const handleSetMainImage = (imageId: number | string) => {
      if (propHandleSetMainImage) {
        // Use the prop function if provided (handles API calls)
        propHandleSetMainImage(imageId);
        return;
      }

      // Default implementation for local state updates only
      if (!selectedImageColor) return;

      // Find the detail for this color
      const detailIndex = product.details.findIndex(
        (d) => d.color === selectedImageColor
      );
      if (detailIndex < 0) return;

      // Update images to mark the selected one as main
      const updatedImages = product.details[detailIndex].images.map((img) => ({
        ...img,
        isMain: img.id === imageId,
      }));

      // Create updated details with the new images
      const updatedDetails = [...product.details];
      updatedDetails[detailIndex] = {
        ...updatedDetails[detailIndex],
        images: updatedImages,
      };

      // Use updateProduct for consistency
      dispatch({
        type: "UPDATE_PRODUCT",
        payload: {
          ...product,
          details: updatedDetails,
        },
      });
    };

    return (
      <TabPanel tabId="images">
        {productColors.length === 0 ? (
          <div className="alert alert-warning">
            {isEditing
              ? "Vui lòng chọn ít nhất một màu sắc trong tab Thuộc tính trước khi tải lên hình ảnh."
              : "Không có màu sắc nào được cấu hình cho sản phẩm này."}
          </div>
        ) : (
          <>
            {/* Color tabs */}
            <ul className="nav nav-tabs mb-3">
              {productColors.map((color) => (
                <li className="nav-item" key={color}>
                  <a
                    href="#"
                    className={`nav-link ${
                      color === selectedImageColor ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleColorSelect(color);
                    }}
                  >
                    {availableColors.find((c) => c.key === color)?.label ||
                      color}
                    <span className="badge ml-1 badge-pill badge-secondary">
                      {colorImages[color]?.length || 0}/10
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {selectedImageColor && (
              <div className="mb-4">
                <h5>
                  Hình ảnh cho màu:{" "}
                  {availableColors.find((c) => c.key === selectedImageColor)
                    ?.label || selectedImageColor}
                </h5>

                {isEditing &&
                (colorImages[selectedImageColor]?.length || 0) >= 10 ? (
                  <div className="alert alert-info">
                    Đã đạt giới hạn 10 hình ảnh cho màu này. Nếu muốn thay đổi,
                    hãy xóa một hình trước khi tải lên hình mới.
                  </div>
                ) : isEditing ? (
                  <div className="custom-file">
                    <input
                      type="file"
                      className="custom-file-input"
                      id="productImages"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                    <label
                      className="custom-file-label"
                      htmlFor="productImages"
                    >
                      Chọn hình ảnh cho màu{" "}
                      {availableColors.find((c) => c.key === selectedImageColor)
                        ?.label || selectedImageColor}{" "}
                      ({colorImages[selectedImageColor]?.length || 0}/10)
                    </label>
                  </div>
                ) : null}

                <div className="row mt-4">
                  {colorImages[selectedImageColor]?.length > 0 ? (
                    colorImages[selectedImageColor].map((image) => (
                      <div
                        className="col-lg-2 col-md-3 col-sm-4 col-6 mb-4"
                        key={image.id}
                      >
                        <div
                          className={`card h-100 ${
                            image.isMain ? "bg-light" : ""
                          }`}
                        >
                          <div
                            className="image-container position-relative"
                            style={{ height: "200px" }}
                          >
                            <Image
                              src={image.url}
                              alt="Product"
                              className="card-img-top"
                              fill
                              sizes="(max-width: 576px) 50vw, (max-width: 768px) 33vw, (max-width: 992px) 25vw, 20vw"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          <div className="card-body">
                            {isEditing ? (
                              <div className="btn-group btn-group-sm w-100">
                                {!image.isMain && (
                                  <button
                                    className="btn btn-outline-primary"
                                    onClick={() => handleSetMainImage(image.id)}
                                    title="Đặt làm ảnh chính"
                                  >
                                    <i className="fas fa-star"></i>
                                  </button>
                                )}
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleRemoveImage(image.id)}
                                  title="Xóa hình ảnh"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            ) : (
                              image.isMain && (
                                <span className="badge badge-success w-100">
                                  Ảnh chính
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <div className="alert alert-info">
                        Chưa có hình ảnh nào cho màu này
                      </div>
                    </div>
                  )}
                </div>
                {/* Hiển thị hình ảnh chưa tải lên */}
                {state.newImages.filter(
                  (img) => img.color === selectedImageColor
                ).length > 0 && (
                  <div className="mt-3">
                    <h6>Hình ảnh mới đã chọn (chưa lưu):</h6>
                    <div className="row">
                      {state.newImages
                        .filter((img) => img.color === selectedImageColor)
                        .map((img, idx) => (
                          <div
                            className="col-lg-2 col-md-3 col-sm-4 col-6 mb-4"
                            key={`new-${idx}`}
                          >
                            <div
                              className={`card ${img.isMain ? "bg-light" : ""}`}
                            >
                              <div
                                className="image-container position-relative"
                                style={{ height: "200px" }}
                              >
                                <Image
                                  src={URL.createObjectURL(img.file)}
                                  alt="Product preview"
                                  className="card-img-top"
                                  fill
                                  sizes="(max-width: 576px) 50vw, (max-width: 768px) 33vw, (max-width: 992px) 25vw, 20vw"
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                              <div className="card-body">
                                <div className="btn-group btn-group-sm w-100">
                                  {!img.isMain && (
                                    <button
                                      className="btn btn-outline-primary"
                                      onClick={() => {
                                        // Thiết lập ảnh này là ảnh chính trong state.newImages
                                        dispatch({
                                          type: "SET_NEW_IMAGE_AS_MAIN",
                                          payload: {
                                            index: idx,
                                            color: selectedImageColor,
                                          },
                                        });
                                      }}
                                      title="Đặt làm ảnh chính"
                                    >
                                      <i className="fas fa-star"></i>
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => {
                                      // Xóa ảnh này khỏi state.newImages
                                      dispatch({
                                        type: "REMOVE_NEW_IMAGE",
                                        payload: idx,
                                      });
                                    }}
                                    title="Xóa hình ảnh"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                                {img.isMain && (
                                  <span className="badge badge-info w-100 mt-2">
                                    Sẽ làm ảnh chính
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </TabPanel>
    );
  }
);

ImagesTab.displayName = "ImagesTab";

export default ImagesTab;
