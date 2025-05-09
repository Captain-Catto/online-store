"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { ProductService } from "@/services/ProductService";
import { ProductAdminResponse } from "@/types/product";
import { useToast } from "@/utils/useToast";
import { CategoryService } from "@/services/CategoryService";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

export default function ProductsPage() {
  const [role, setRole] = useState<number | null>(null);
  const [search, setSearchTerm] = useState("");
  const [category, setCategoryFilter] = useState("");
  const [status, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const { showToast, Toast } = useToast();
  const productsPerPage = 10;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductAdminResponse[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([{ value: "", label: "Tất cả danh mục" }]);

  // Mock product statuses
  const statuses = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "active", label: "Đang bán", class: "bg-success" },
    { value: "outofstock", label: "Hết hàng", class: "bg-danger" },
    { value: "draft", label: "Sản phẩm ảo", class: "bg-secondary" },
  ];
  // hàm lấy role ở localstorage

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        setRole(parsedUser.role);
      }
    }
  }, []);

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

      console.log("Response:", response);

      setProducts(response.products || []);

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

  // lấy tất cả category
  const fetchCategories = useCallback(async () => {
    try {
      const response = await CategoryService.getAllCategories();
      // Tạo danh sách categories cho dropdown
      const categoryOptions = [{ value: "", label: "Tất cả danh mục" }];

      // Xử lý danh mục cha
      response.forEach((parentCat) => {
        categoryOptions.push({
          value: parentCat.id.toString(),
          label: parentCat.name,
        });

        // Xử lý danh mục con (nếu có), thêm - vào để phân biệt
        if (parentCat.children && parentCat.children.length > 0) {
          parentCat.children.forEach((childCat) => {
            categoryOptions.push({
              value: childCat.id.toString(),
              label: `— ${childCat.name}`,
            });
          });
        }
      });

      setCategories(categoryOptions);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  // Lấy dữ liệu khi component mount hoặc khi các filter thay đổi
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, status]);

  // Pagination logic
  const currentProducts = products;
  const totalPages = pagination.totalPages;

  // Thêm sau hàm fetchProducts
  const handleDeleteProduct = (id: number, name: string) => {
    setProductToDelete({ id, name });
    setShowDeleteModal(true);
  };

  // xác nhận xóa sản phẩm
  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await ProductService.deleteProduct(String(productToDelete.id));
      setShowDeleteModal(false);
      showToast("Đã xóa sản phẩm thành công!", { type: "success" });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi xóa sản phẩm.",
        { type: "error" }
      );
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Quản lý sản phẩm", active: true },
  ];

  const getProductImageUrl = (product) => {
    console.log("Product:", product);
    // Nếu không có variants, trả về ảnh mặc định
    if (!product.variants || Object.keys(product.variants).length === 0) {
      return null;
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
          {role == 1 && (
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
          )}
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
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
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
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-5">
                        <LoadingSpinner
                          size="lg"
                          text="Đang tải danh sách sản phẩm..."
                        />
                      </td>
                    </tr>
                  ) : currentProducts.length > 0 ? (
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
                        <td>
                          {product.categories
                            ?.map((cat) => cat.name)
                            .join(", ")}
                        </td>
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
                            <button
                              className="btn btn-sm btn-danger"
                              title="Xóa"
                              onClick={() =>
                                handleDeleteProduct(product.id, product.name)
                              }
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        {error ? (
                          <div className="text-danger">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            {error}
                          </div>
                        ) : (
                          "Không tìm thấy sản phẩm nào"
                        )}
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
      {/* modal delete */}
      {productToDelete && (
        <div
          className={`modal fade ${showDeleteModal ? "show" : ""}`}
          style={{
            display: showDeleteModal ? "block" : "none",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="deleteModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header bg-danger">
                <h5 className="modal-title text-white" id="deleteModalLabel">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Xác nhận xóa sản phẩm
                </h5>
                <button
                  type="button"
                  className="close text-white"
                  onClick={() => setShowDeleteModal(false)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Bạn có chắc chắn muốn xóa sản phẩm{" "}
                  <strong>&quot;{productToDelete.name}&quot;</strong>?
                </p>
                <p className="mb-0 text-danger">
                  <i className="fas fa-info-circle mr-1"></i>
                  Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến
                  sản phẩm này sẽ bị xóa vĩnh viễn.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <i className="fas fa-times mr-1"></i>
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  <i className="fas fa-trash mr-1"></i>
                  Xóa sản phẩm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {Toast}
    </AdminLayout>
  );
}
