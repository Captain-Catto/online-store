"use client";

import { useState } from "react";
import Link from "next/link";
import Images from "next/image";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Mock product categories
  const categories = [
    { value: "all", label: "Tất cả danh mục" },
    { value: "shirts", label: "Áo" },
    { value: "pants", label: "Quần" },
    { value: "jackets", label: "Áo khoác" },
    { value: "accessories", label: "Phụ kiện" },
  ];

  // Mock product statuses
  const statuses = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Đang bán", class: "bg-success" },
    { value: "outofstock", label: "Hết hàng", class: "bg-danger" },
    { value: "draft", label: "Sản phẩm ảo", class: "bg-secondary" },
  ];

  // Mock product data
  const products = [
    {
      id: "P001",
      name: "Áo thun cotton basic",
      sku: "AT-NAM-001",
      category: "shirts",
      categoryLabel: "Áo",
      price: "299.000đ",
      originalPrice: "350.000đ",
      stock: 150,
      status: "active",
      statusLabel: "Đang bán",
      statusClass: "bg-success",
      image:
        "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
      createdAt: "15/01/2025",
    },
    {
      id: "P002",
      name: "Quần jean nam slim fit",
      sku: "QJ-NAM-002",
      category: "pants",
      categoryLabel: "Quần",
      price: "499.000đ",
      originalPrice: "599.000đ",
      stock: 80,
      status: "active",
      statusLabel: "Đang bán",
      statusClass: "bg-success",
      image:
        "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
      createdAt: "20/01/2025",
    },
    {
      id: "P003",
      name: "Áo khoác dù unisex",
      sku: "AK-UNI-003",
      category: "jackets",
      categoryLabel: "Áo khoác",
      price: "1.200.000đ",
      originalPrice: "1.500.000đ",
      stock: 0,
      status: "outofstock",
      statusLabel: "Hết hàng",
      statusClass: "bg-danger",
      image:
        "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
      createdAt: "25/01/2025",
    },
    {
      id: "P004",
      name: "Áo sơ mi nam dài tay",
      sku: "ASM-NAM-004",
      category: "shirts",
      categoryLabel: "Áo",
      price: "450.000đ",
      originalPrice: "550.000đ",
      stock: 120,
      status: "active",
      statusLabel: "Đang bán",
      statusClass: "bg-success",
      image:
        "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
      createdAt: "01/02/2025",
    },
    {
      id: "P005",
      name: "Quần kaki nam",
      sku: "QK-NAM-005",
      category: "pants",
      categoryLabel: "Quần",
      price: "399.000đ",
      originalPrice: "499.000đ",
      stock: 5,
      status: "active",
      statusLabel: "Đang bán",
      statusClass: "bg-success",
      image:
        "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
      createdAt: "05/02/2025",
    },
    {
      id: "P006",
      name: "Vớ nam cổ ngắn",
      sku: "VO-NAM-006",
      category: "accessories",
      categoryLabel: "Phụ kiện",
      price: "59.000đ",
      originalPrice: "79.000đ",
      stock: 250,
      status: "active",
      statusLabel: "Đang bán",
      statusClass: "bg-success",
      image:
        "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
      createdAt: "10/02/2025",
    },
    {
      id: "P007",
      name: "Áo thun oversize",
      sku: "AT-NAM-007",
      category: "shirts",
      categoryLabel: "Áo",
      price: "289.000đ",
      originalPrice: "339.000đ",
      stock: 0,
      status: "draft",
      statusLabel: "Sản phẩm ảo",
      statusClass: "bg-secondary",
      image:
        "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
      createdAt: "15/02/2025",
    },
  ];

  // Filter products based on search, category and status
  const filteredProducts = products.filter((product) => {
    // Search filter
    const searchMatch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const categoryMatch =
      categoryFilter === "all" || product.category === categoryFilter;

    // Status filter
    const statusMatch =
      statusFilter === "all" || product.status === statusFilter;

    return searchMatch && categoryMatch && statusMatch;
  });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Quản lý sản phẩm", active: true },
  ];

  return (
    <AdminLayout title="Quản lý sản phẩm">
      {/* Content Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Quản lý sản phẩm</h1>
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
          {/* Top action buttons */}
          <div className="mb-3">
            <Link href="/admin/products/add" className="btn btn-primary">
              <i className="fas fa-plus mr-1"></i> Thêm sản phẩm mới
            </Link>
            <Link
              href="/admin/categories"
              className="btn btn-outline-secondary ml-2"
            >
              <i className="fas fa-tags mr-1"></i> Quản lý danh mục
            </Link>
          </div>

          {/* Filters */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Tìm kiếm và lọc</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-card-widget="collapse"
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Tìm kiếm</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tên sản phẩm, mã SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="input-group-append">
                        <button type="button" className="btn btn-default">
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Danh mục</label>
                    <select
                      className="form-control"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                      className="form-control"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-2 d-flex align-items-end mb-3">
                  <button
                    className="btn btn-default w-100"
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    <i className="fas fa-sync-alt mr-1"></i> Đặt lại
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Danh sách sản phẩm</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-card-widget="collapse"
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table table-hover text-nowrap">
                <thead>
                  <tr>
                    <th>Hình ảnh</th>
                    <th>Mã sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Giá gốc</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.length > 0 ? (
                    currentProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <Images
                            src={product.image}
                            alt={product.name}
                            width="50"
                            height="50"
                            className="img-thumbnail"
                          />
                        </td>
                        <td>{product.sku}</td>
                        <td>{product.name}</td>
                        <td>{product.categoryLabel}</td>
                        <td>{product.price}</td>
                        <td>
                          <del className="text-muted">
                            {product.originalPrice}
                          </del>
                        </td>
                        <td>
                          <span
                            className={
                              product.stock <= 10
                                ? "text-danger font-weight-bold"
                                : ""
                            }
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${product.statusClass}`}>
                            {product.statusLabel}
                          </span>
                        </td>
                        <td>{product.createdAt}</td>
                        <td>
                          <div className="btn-group">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="btn btn-sm btn-info mr-1"
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="btn btn-sm btn-primary mr-1"
                              title="Chỉnh sửa"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button
                              className="btn btn-sm btn-danger"
                              title="Xóa"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Bạn có chắc chắn muốn xóa sản phẩm này?"
                                  )
                                ) {
                                  console.log(`Delete product ${product.id}`);
                                }
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center py-4">
                        Không tìm thấy sản phẩm nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="card-footer clearfix">
              <div className="float-left">
                <div className="dataTables_info">
                  Hiển thị{" "}
                  {filteredProducts.length > 0 ? indexOfFirstProduct + 1 : 0}{" "}
                  đến {Math.min(indexOfLastProduct, filteredProducts.length)}{" "}
                  của {filteredProducts.length} sản phẩm
                </div>
              </div>
              <ul className="pagination pagination-sm m-0 float-right">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <a
                    className="page-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                  >
                    «
                  </a>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i + 1}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <a
                      className="page-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </a>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <a
                    className="page-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                  >
                    »
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
