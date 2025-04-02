"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);

  // Mock product data
  const [product, setProduct] = useState({
    id: id,
    name: "Áo thun cotton basic",
    sku: "AT-NAM-001",
    description:
      "Áo thun cotton chất lượng cao, phù hợp cho mọi hoạt động thường ngày. Thiết kế đơn giản, dễ phối đồ.",
    category: "shirts",
    categoryName: "Áo",
    material: "100% Cotton",
    price: 299000,
    originalPrice: 350000,
    stock: {
      total: 150,
      variants: [
        { color: "Đen", size: "S", stock: 20 },
        { color: "Đen", size: "M", stock: 30 },
        { color: "Đen", size: "L", stock: 25 },
        { color: "Trắng", size: "S", stock: 15 },
        { color: "Trắng", size: "M", stock: 35 },
        { color: "Trắng", size: "L", stock: 25 },
      ],
    },
    colors: ["Đen", "Trắng", "Xanh dương"],
    sizes: ["S", "M", "L", "XL"],
    status: "active",
    statusLabel: "Đang bán",
    statusClass: "bg-success",
    featured: true,
    tags: ["áo thun", "cotton", "casual"],
    images: [
      {
        id: 1,
        url: "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
        color: "Đen",
        isMain: true,
      },
      {
        id: 2,
        url: "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/ao-thun-nam-cotton-220gsm-mau-xanh-dam_(1).webp",
        color: "Xanh dương",
        isMain: false,
      },
      {
        id: 3,
        url: "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/ao-thun-nam-cotton-220gsm-mau-xanh-dam_(2).webp",
        color: "Xanh dương",
        isMain: false,
      },
    ],
    createdAt: "15/01/2025",
    updatedAt: "01/03/2025",
    modificationHistory: [
      {
        date: "01/03/2025 15:30",
        user: "Admin",
        action: "Cập nhật giá",
        detail: "Giá thay đổi từ 320.000đ xuống 299.000đ",
      },
      {
        date: "20/02/2025 10:15",
        user: "Admin",
        action: "Thêm màu mới",
        detail: "Thêm màu Xanh dương",
      },
      {
        date: "15/01/2025 09:00",
        user: "Admin",
        action: "Tạo sản phẩm",
        detail: "Tạo mới sản phẩm",
      },
    ],
  });

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Sản phẩm", href: "/admin/products" },
    { label: product.name, active: true },
  ];

  const handleStatusChange = (newStatus: string) => {
    setProduct((prev) => ({
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
    }));
  };

  const handleImageDelete = (imageId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hình ảnh này?")) {
      setProduct((prev) => ({
        ...prev,
        images: prev.images.filter((image) => image.id !== imageId),
      }));
    }
  };

  const handleSaveChanges = () => {
    // Implement save logic with API call
    alert("Đã lưu thay đổi thành công!");
    setIsEditing(false);
  };

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
              <i className="fas fa-arrow-left mr-1"></i> Quay lại
            </Link>
            {isEditing ? (
              <>
                <button
                  className="btn btn-success mr-2"
                  onClick={handleSaveChanges}
                >
                  <i className="fas fa-save mr-1"></i> Lưu thay đổi
                </button>
                <button
                  className="btn btn-default"
                  onClick={() => setIsEditing(false)}
                >
                  <i className="fas fa-times mr-1"></i> Hủy
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-primary mr-2"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit mr-1"></i> Chỉnh sửa
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    if (
                      window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")
                    ) {
                      alert("Đã xóa sản phẩm!");
                      router.push("/admin/products");
                    }
                  }}
                >
                  <i className="fas fa-trash mr-1"></i> Xóa
                </button>
              </>
            )}
          </div>

          {/* Product Overview Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Tổng quan sản phẩm</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <table className="table table-striped">
                    <tbody>
                      <tr>
                        <th style={{ width: "30%" }}>ID</th>
                        <td>{product.id}</td>
                      </tr>
                      <tr>
                        <th>Mã SKU</th>
                        <td>{product.sku}</td>
                      </tr>
                      <tr>
                        <th>Tên sản phẩm</th>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              className="form-control"
                              value={product.name}
                              onChange={(e) =>
                                setProduct({ ...product, name: e.target.value })
                              }
                            />
                          ) : (
                            product.name
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Danh mục</th>
                        <td>
                          {isEditing ? (
                            <select
                              className="form-control"
                              value={product.category}
                              onChange={(e) =>
                                setProduct({
                                  ...product,
                                  category: e.target.value,
                                })
                              }
                            >
                              <option value="shirts">Áo</option>
                              <option value="pants">Quần</option>
                              <option value="jackets">Áo khoác</option>
                              <option value="accessories">Phụ kiện</option>
                            </select>
                          ) : (
                            product.categoryName
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Chất liệu</th>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              className="form-control"
                              value={product.material}
                              onChange={(e) =>
                                setProduct({
                                  ...product,
                                  material: e.target.value,
                                })
                              }
                            />
                          ) : (
                            product.material
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <table className="table table-striped">
                    <tbody>
                      <tr>
                        <th style={{ width: "30%" }}>Giá bán</th>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              className="form-control"
                              value={product.price}
                              onChange={(e) =>
                                setProduct({
                                  ...product,
                                  price: parseInt(e.target.value),
                                })
                              }
                            />
                          ) : (
                            `${product.price.toLocaleString("vi-VN")}đ`
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Giá gốc</th>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              className="form-control"
                              value={product.originalPrice}
                              onChange={(e) =>
                                setProduct({
                                  ...product,
                                  originalPrice: parseInt(e.target.value),
                                })
                              }
                            />
                          ) : (
                            `${product.originalPrice.toLocaleString("vi-VN")}đ`
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Tồn kho</th>
                        <td>
                          <span
                            className={
                              product.stock.total <= 10
                                ? "text-danger font-weight-bold"
                                : ""
                            }
                          >
                            {product.stock.total}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th>Trạng thái</th>
                        <td>
                          {isEditing ? (
                            <select
                              className="form-control"
                              value={product.status}
                              onChange={(e) =>
                                handleStatusChange(e.target.value)
                              }
                            >
                              <option value="active">Đang bán</option>
                              <option value="outofstock">Hết hàng</option>
                              <option value="draft">Nháp</option>
                            </select>
                          ) : (
                            <span className={`badge ${product.statusClass}`}>
                              {product.statusLabel}
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Nổi bật</th>
                        <td>
                          {isEditing ? (
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
                                {product.featured ? "Có" : "Không"}
                              </label>
                            </div>
                          ) : product.featured ? (
                            "Có"
                          ) : (
                            "Không"
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Ngày tạo</th>
                        <td>{product.createdAt}</td>
                      </tr>
                      <tr>
                        <th>Cập nhật lần cuối</th>
                        <td>{product.updatedAt}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for additional info */}
          <div className="card card-primary card-outline card-tabs">
            <div className="card-header p-0 pt-1 border-bottom-0">
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "info" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("info")}
                    href="#"
                  >
                    <i className="fas fa-info-circle mr-1"></i>
                    Chi tiết
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "inventory" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("inventory")}
                    href="#"
                  >
                    <i className="fas fa-box mr-1"></i>
                    Tồn kho
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "images" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("images")}
                    href="#"
                  >
                    <i className="fas fa-images mr-1"></i>
                    Hình ảnh
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "history" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("history")}
                    href="#"
                  >
                    <i className="fas fa-history mr-1"></i>
                    Lịch sử
                  </a>
                </li>
              </ul>
            </div>
            <div className="card-body">
              <div className="tab-content">
                {/* Product Info Tab */}
                <div
                  className={`tab-pane ${activeTab === "info" ? "active" : ""}`}
                >
                  <div className="form-group">
                    <label>Mô tả sản phẩm</label>
                    {isEditing ? (
                      <textarea
                        className="form-control"
                        rows={5}
                        value={product.description}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    ) : (
                      <p>{product.description}</p>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Màu sắc</label>
                        {isEditing ? (
                          <select
                            multiple
                            className="form-control"
                            value={product.colors}
                            onChange={(e) => {
                              const selectedOptions = Array.from(
                                e.target.selectedOptions,
                                (option) => option.value
                              );
                              setProduct({
                                ...product,
                                colors: selectedOptions,
                              });
                            }}
                          >
                            <option value="Đen">Đen</option>
                            <option value="Trắng">Trắng</option>
                            <option value="Xanh dương">Xanh dương</option>
                            <option value="Xanh lá">Xanh lá</option>
                            <option value="Đỏ">Đỏ</option>
                          </select>
                        ) : (
                          <div>
                            {product.colors.map((color, index) => (
                              <span
                                key={index}
                                className="badge badge-primary mr-1"
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Kích thước</label>
                        {isEditing ? (
                          <select
                            multiple
                            className="form-control"
                            value={product.sizes}
                            onChange={(e) => {
                              const selectedOptions = Array.from(
                                e.target.selectedOptions,
                                (option) => option.value
                              );
                              setProduct({
                                ...product,
                                sizes: selectedOptions,
                              });
                            }}
                          >
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                        ) : (
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
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tags</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={product.tags.join(", ")}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            tags: e.target.value.split(", "),
                          })
                        }
                        placeholder="Nhập tags, phân cách bằng dấu phẩy"
                      />
                    ) : (
                      <div>
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="badge badge-secondary mr-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inventory Tab */}
                <div
                  className={`tab-pane ${
                    activeTab === "inventory" ? "active" : ""
                  }`}
                >
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Màu sắc</th>
                          <th>Kích thước</th>
                          <th>Số lượng tồn</th>
                          {isEditing && <th>Thao tác</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {product.stock.variants.map((variant, index) => (
                          <tr key={index}>
                            <td>{variant.color}</td>
                            <td>{variant.size}</td>
                            <td>
                              {isEditing ? (
                                <input
                                  type="number"
                                  className="form-control"
                                  value={variant.stock}
                                  onChange={(e) => {
                                    const newVariants = [
                                      ...product.stock.variants,
                                    ];
                                    newVariants[index].stock = parseInt(
                                      e.target.value
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
                            {isEditing && (
                              <td>
                                <button
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
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                        {isEditing && (
                          <tr>
                            <td colSpan={4}>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => {
                                  setProduct({
                                    ...product,
                                    stock: {
                                      ...product.stock,
                                      variants: [
                                        ...product.stock.variants,
                                        {
                                          color: product.colors[0],
                                          size: product.sizes[0],
                                          stock: 0,
                                        },
                                      ],
                                    },
                                  });
                                }}
                              >
                                <i className="fas fa-plus mr-1"></i> Thêm biến
                                thể
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Images Tab */}
                <div
                  className={`tab-pane ${
                    activeTab === "images" ? "active" : ""
                  }`}
                >
                  <div className="row">
                    {product.images.map((image) => (
                      <div
                        key={image.id}
                        className="col-md-3 col-sm-6 col-12 mb-3"
                      >
                        <div className="card h-100">
                          <div
                            className="position-relative"
                            style={{ height: "0", paddingBottom: "75%" }}
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
                          </div>
                          <div className="card-body">
                            <p className="card-text">
                              Màu: {image.color}
                              {image.isMain && (
                                <span className="badge badge-success ml-2">
                                  Chính
                                </span>
                              )}
                            </p>
                            {isEditing && (
                              <div className="btn-group w-100">
                                <button
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
                                  <i className="fas fa-star mr-1"></i> Đặt làm
                                  ảnh chính
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleImageDelete(image.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="mt-3">
                      <button className="btn btn-primary">
                        <i className="fas fa-upload mr-1"></i> Tải lên hình ảnh
                        mới
                      </button>
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
