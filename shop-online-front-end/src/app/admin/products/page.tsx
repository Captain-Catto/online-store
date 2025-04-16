"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { ProductService } from "@/services/ProductService";
import { Product } from "@/types/product";

export default function ProductsPage() {
  const [search, setSearchTerm] = useState("");
  const [category, setCategoryFilter] = useState("");
  const [status, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  // Mock product categories
  const categories = [
    { value: "", label: "Tất cả danh mục" },
    { value: "1", label: "Áo" },
    { value: "2", label: "Quần" },
  ];

  // Mock product statuses
  const statuses = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "active", label: "Đang bán", class: "bg-success" },
    { value: "outofstock", label: "Hết hàng", class: "bg-danger" },
    { value: "draft", label: "Sản phẩm ảo", class: "bg-secondary" },
  ];
  // lấy data về
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProducts(
        currentPage,
        productsPerPage,
        {
          search: String(search),
          category,
          status,
        }
      );

      const formattedProducts = (response.products || []).map(
        (product: Product) => {
          const categoryLabel =
            product.categories?.map((cat) => cat.name).join(", ") || "";
          return {
            ...product,
            categoryLabel,
          };
        }
      );

      setProducts(formattedProducts || []);
      setPagination({
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total,
        limit: productsPerPage,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    }
  }, [currentPage, productsPerPage, search, category, status]);

  // Lấy dữ liệu khi component mount hoặc khi các filter thay đổi
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, status]);

  // Pagination logic
  const currentProducts = products;
  const totalPages = pagination.totalPages;

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Quản lý sản phẩm", active: true },
  ];

  const getProductImageUrl = (product) => {
    console.log("Product:", product);
    // Nếu không có variants, trả về ảnh mặc định
    if (!product.variants || Object.keys(product.variants).length === 0) {
      return "https://via.placeholder.com/50";
    }

    // Lấy màu đầu tiên
    const firstColorKey = Object.keys(product.variants)[0];
    const variant = product.variants[firstColorKey];

    // Tìm ảnh chính (isMain = true)
    const mainImage = variant.images.find((img) => img.isMain);

    // Nếu có ảnh chính, trả về URL của nó
    // Nếu không, trả về ảnh đầu tiên hoặc ảnh mặc định
    return (
      mainImage?.url ||
      // variant.Image[0]?.url ||
      "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/products/269ea64b-55b9b941_9b8e_4c6a_a35b_ee9806f43c5e.jpg"
    );
  };
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
                        value={search}
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
                      value={category}
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
                      value={status}
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
                          <Image
                            src={getProductImageUrl(product)}
                            alt={product.name}
                            width="50"
                            height="50"
                            className="img-thumbnail"
                          />
                        </td>
                        <td>{product.sku}</td>
                        <td>{product.name}</td>
                        <td>{product.categoryLabel}</td>

                        <td>
                          <span
                            className={
                              product.stock?.total <= 10
                                ? "text-danger font-weight-bold"
                                : ""
                            }
                          >
                            {product.stock?.total || 0}
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
                  {products.length
                    ? (pagination.currentPage - 1) * pagination.limit + 1
                    : 0}{" "}
                  đến{" "}
                  {Math.min(
                    pagination.currentPage * pagination.limit,
                    pagination.totalItems
                  )}{" "}
                  của {pagination.totalItems} sản phẩm
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
