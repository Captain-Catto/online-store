import React from "react";
import Image from "next/image";

interface ColorImage {
  id: number | string;
  file?: File;
  url: string;
  isMain: boolean;
}

interface ImagesTabProps {
  productColors: string[];
  selectedColor: string;
  setSelectedColor: React.Dispatch<React.SetStateAction<string>>;
  colorImages: Record<string, ColorImage[]>;
  setColorImages: React.Dispatch<
    React.SetStateAction<Record<string, ColorImage[]>>
  >;
  availableColors: { key: string; label: string }[];
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSetMainImage: (imageId: number | string) => void;
  handleRemoveImage: (imageId: number | string) => void;
  viewMode?: boolean; // Thêm prop viewMode
}

const ImagesTab: React.FC<ImagesTabProps> = ({
  productColors,
  selectedColor,
  setSelectedColor,
  colorImages,
  viewMode = false,
  availableColors,
  handleImageChange,
  handleSetMainImage,
  handleRemoveImage,
}) => {
  return (
    <div>
      {productColors.length === 0 ? (
        <div className="alert alert-warning">
          {viewMode
            ? "Không có màu sắc nào được cấu hình cho sản phẩm này."
            : "Vui lòng chọn ít nhất một màu sắc trong tab Thuộc tính trước khi tải lên hình ảnh."}
        </div>
      ) : (
        <>
          {/* Màu sắc tabs */}
          <ul className="nav nav-tabs mb-3">
            {productColors.map((color) => (
              <li className="nav-item" key={color}>
                <a
                  href="#"
                  className={`nav-link ${
                    color === selectedColor ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedColor(color);
                  }}
                >
                  {availableColors.find((c) => c.key === color)?.label || color}
                  <span className="badge ml-1 badge-pill badge-secondary">
                    {colorImages[color]?.length || 0}/10
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {selectedColor && (
            <div className="mb-4">
              <h5>
                Hình ảnh cho màu:{" "}
                {availableColors.find((c) => c.key === selectedColor)?.label ||
                  selectedColor}
              </h5>

              {!viewMode && (colorImages[selectedColor]?.length || 0) >= 10 ? (
                <div className="alert alert-info">
                  Đã đạt giới hạn 10 hình ảnh cho màu này. Nếu muốn thay đổi,
                  hãy xóa một hình trước khi tải lên hình mới.
                </div>
              ) : !viewMode ? (
                <div className="custom-file">
                  <input
                    type="file"
                    className="custom-file-input"
                    id="productImages"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                  <label className="custom-file-label" htmlFor="productImages">
                    Chọn hình ảnh cho màu{" "}
                    {availableColors.find((c) => c.key === selectedColor)
                      ?.label || selectedColor}{" "}
                    ({colorImages[selectedColor]?.length || 0}/10)
                  </label>
                </div>
              ) : null}

              {!viewMode && (
                <div className="mt-3 mb-4">
                  <small className="form-text text-muted">
                    <span className="text-danger">Lưu ý:</span> Mỗi màu sắc cần
                    có tối đa 10 hình ảnh và có 1 hình ảnh chính. Ảnh đầu tiên
                    được tải lên sẽ tự động trở thành ảnh chính (Nếu có ảnh cũ
                    thì ảnh mới tải lên đầu tiên sẽ thay thế).
                  </small>
                </div>
              )}

              {/* Hiển thị hình ảnh của màu đang chọn */}
              {colorImages[selectedColor]?.length > 0 ? (
                <div className="row">
                  {colorImages[selectedColor].map((image) => (
                    <div key={image.id} className="col-md-4 col-sm-6 mb-3">
                      <div className="card h-100">
                        <div
                          className="position-relative"
                          style={{
                            height: "0",
                            paddingBottom: "75%",
                          }}
                        >
                          <Image
                            src={image.url}
                            alt={`${selectedColor}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="card-img-top"
                            style={{ objectFit: "cover" }}
                            priority={image.isMain}
                          />
                          {image.isMain && (
                            <div className="position-absolute top-0 left-0 bg-success text-white py-1 px-2">
                              <i className="fas fa-star mr-1"></i> Ảnh chính
                            </div>
                          )}
                        </div>
                        {!viewMode && (
                          <div className="card-body">
                            <div className="d-flex justify-content-between">
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveImage(image.id)}
                              >
                                <i className="fas fa-trash mr-1"></i> Xóa
                              </button>
                              {!image.isMain && (
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => handleSetMainImage(image.id)}
                                >
                                  <i className="fas fa-star mr-1"></i> Đặt làm
                                  ảnh chính
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-warning">
                  Chưa có hình ảnh nào cho màu{" "}
                  {availableColors.find((c) => c.key === selectedColor)
                    ?.label || selectedColor}
                  {viewMode ? "." : ". Vui lòng tải lên ít nhất một hình ảnh."}
                </div>
              )}
            </div>
          )}

          {/* Bảng tổng quan hình ảnh theo màu */}
          <div className="mt-4">
            <h5>Tổng quan hình ảnh theo màu</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Màu sắc</th>
                    <th>Số lượng hình ảnh</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {productColors.map((color) => (
                    <tr key={color}>
                      <td>
                        {availableColors.find((c) => c.key === color)?.label ||
                          color}
                      </td>
                      <td>{colorImages[color]?.length || 0}/10</td>
                      <td>
                        {!colorImages[color] ||
                        colorImages[color].length === 0 ? (
                          <span className="badge badge-danger">
                            Chưa có hình ảnh
                          </span>
                        ) : !colorImages[color].some((img) => img.isMain) ? (
                          <span className="badge badge-warning">
                            Chưa có hình chính
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            Đã hoàn thành
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImagesTab;
