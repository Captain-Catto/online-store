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

    // sử dụng useEffect để tự động chọn màu đầu tiên nếu chưa có màu nào được chọn
    // và sản phẩm đã được tải
    React.useEffect(() => {
      // chỉ tự động chọn màu đầu tiên nếu sản phẩm đã được tải
      // chưa có màu nào được chọn và có màu sắc khả dụng
      if (product && !selectedImageColor && product.details.length > 0) {
        const firstAvailableColor = product.details[0].color;
        dispatch({
          type: "SET_SELECTED_IMAGE_COLOR",
          payload: firstAvailableColor,
        });
        console.log("Auto-selected first color:", firstAvailableColor);
      }
    }, [product, selectedImageColor, dispatch]);

    // trả vè null nếu không có sản phẩm
    if (!product) return null;

    const productColors = product.details.map((d) => d.color);

    // lấy tất cả hình ảnh cho màu đã chọn
    // và lưu vào một đối tượng để dễ dàng truy cập
    // sử dụng Record<string, ColorImage[]> để lưu trữ hình ảnh theo màu
    const colorImages: Record<string, ColorImage[]> = {};
    product.details.forEach((detail) => {
      colorImages[detail.color] = detail.images.map((img) => ({
        id: img.id,
        url: img.url,
        isMain: img.isMain,
      }));
    });
    const handleColorSelect = (color: string) => {
      // xác nhận màu sắc có tồn tại trong chi tiết sản phẩm trước khi thiết lập
      const colorExists = product.details.some(
        (detail) => detail.color === color
      );
      if (colorExists) {
        dispatch({ type: "SET_SELECTED_IMAGE_COLOR", payload: color });
        console.log(`Selected color changed to: ${color}`);

        // tìm tên hiển thị của màu sắc này để ghi lại
        // nếu không tìm thấy, sử dụng chính màu sắc làm tên hiển thị
        // sử dụng find để tìm màu sắc trong availableColors
        const colorLabel =
          availableColors.find((c) => c.key === color)?.label || color;
        console.log(`Color display name: ${colorLabel}`);
      } else {
        console.warn(`Selected color ${color} not found in product details`);
      }
    };

    // sử dụng prop handleSetMainImage nếu có, nếu không thì sử dụng hàm cục bộ
    // để cập nhật trạng thái cục bộ
    // hàm này sẽ được gọi khi người dùng nhấn nút "Đặt làm ảnh chính"
    const handleSetMainImage = (imageId: number | string) => {
      if (propHandleSetMainImage) {
        propHandleSetMainImage(imageId);
        return;
      }

      // kiểm tra xem có màu sắc nào được chọn không
      if (!selectedImageColor) return;

      // tìm chỉ số của chi tiết sản phẩm có màu sắc đã chọn
      const detailIndex = product.details.findIndex(
        (d) => d.color === selectedImageColor
      );

      // nếu không tìm thấy, thoát hàm
      // không cần phải kiểm tra vì đã có màu sắc được chọn
      if (detailIndex < 0) return;

      // cập nhật hình ảnh chính trong chi tiết sản phẩm
      const updatedImages = product.details[detailIndex].images.map((img) => ({
        ...img,
        isMain: img.id === imageId,
      }));

      // cập nhật chi tiết sản phẩm với hình ảnh mới
      const updatedDetails = [...product.details];
      updatedDetails[detailIndex] = {
        ...updatedDetails[detailIndex],
        images: updatedImages,
      };

      // cập nhật trạng thái sản phẩm với chi tiết mới
      // sử dụng dispatch để cập nhật trạng thái
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
                        {" "}
                        <div
                          className={`card h-100 ${
                            image.isMain ? "bg-light border-primary" : ""
                          }`}
                        >
                          <div
                            className="image-container position-relative"
                            style={{ height: "200px" }}
                          >
                            {image.isMain && (
                              <div className="position-absolute top-0 right-0 bg-primary text-white p-1 z-10 rounded-bl">
                                <i className="fas fa-star mr-1"></i> Ảnh chính
                              </div>
                            )}
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
                            {" "}
                            <div
                              className={`card h-100 ${
                                img.isMain ? "bg-light border-primary" : ""
                              }`}
                            >
                              <div
                                className="image-container position-relative"
                                style={{ height: "200px" }}
                              >
                                {img.isMain && (
                                  <div className="position-absolute top-0 right-0 bg-primary text-white p-1 z-10 rounded-bl">
                                    <i className="fas fa-star mr-1"></i> Ảnh
                                    chính
                                  </div>
                                )}
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
