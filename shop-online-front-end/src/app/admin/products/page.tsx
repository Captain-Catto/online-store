"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { ProductService } from "@/services/ProductService";
import { ProductAdminResponse } from "@/types/product";
import { useToast } from "@/utils/useToast";
import { CategoryService } from "@/services/CategoryService";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { formatDateDisplay } from "@/utils/dateUtils";
import debounce from "lodash/debounce";

// ===== INTERFACES =====
interface Category {
  id: string | number;
  name: string;
  children?: Category[];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

interface FocusOptions {
  preserve?: boolean;
  selectAll?: boolean;
}

export default function ProductsPage() {
  const { showToast, Toast } = useToast();

  // ===== STATES =====
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageLimit, setPageLimit] = useState(10);
  const [isComposing, setIsComposing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<ProductAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [role, setRole] = useState<number | null>(null);

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // ✅ ADD: Flag to prevent duplicate calls
  const [isInitialized, setIsInitialized] = useState(false);

  // ===== CONSTANTS =====
  const pageLimitOptions = [5, 10, 20, 50, 100];

  const productStatuses = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Đang bán", class: "bg-success" },
    { value: "outofstock", label: "Hết hàng", class: "bg-danger" },
    { value: "draft", label: "Sản phẩm ảo", class: "bg-secondary" },
  ];

  // ===== PAGINATION STATE =====
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 10,
  });

  // Categories state
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([{ value: "all", label: "Tất cả danh mục" }]);

  // ===== REFS =====
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const apiCallInProgressRef = useRef(false);

  // ===== HELPER FUNCTIONS =====
  const getUserRole = () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          return JSON.parse(user).role;
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  const getProductImageUrl = (product: ProductAdminResponse): string => {
    if (
      !product.variants ||
      typeof product.variants !== "object" ||
      Object.keys(product.variants).length === 0
    ) {
      return "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/products/269ea64b-55b9b941_9b8e_4c6a_a35b_ee9806f43c5e.jpg";
    }

    const firstColorKey = Object.keys(product.variants)[0];
    const variant = product.variants[firstColorKey];
    const mainImage = variant.images?.find((img) => img.isMain);

    return (
      mainImage?.url ||
      (variant.images && variant.images[0]?.url) ||
      "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/products/269ea64b-55b9b941_9b8e_4c6a_a35b_ee9806f43c5e.jpg"
    );
  };

  // ===== FOCUS MANAGEMENT =====
  const focusInput = useCallback((options: FocusOptions = {}) => {
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();

        if (options.selectAll) {
          searchInputRef.current.select();
        } else {
          const length = searchInputRef.current.value.length;
          searchInputRef.current.setSelectionRange(length, length);
        }
      }
    }, 100);
  }, []);

  // ===== SEARCH FUNCTION =====
  const performSearch = useCallback(
    async (
      searchTerm: string,
      category: string,
      status: string,
      limit: number,
      page = 1,
      focusOptions?: FocusOptions
    ) => {
      // ✅ Prevent duplicate API calls
      if (apiCallInProgressRef.current) {
        console.log("API call already in progress, skipping...");
        return;
      }

      try {
        apiCallInProgressRef.current = true;
        setLoading(true);
        setIsSearching(true);
        setCurrentPage(page);

        const response = await ProductService.getProducts(page, limit, {
          search: searchTerm.trim(),
          category: category === "all" ? "" : category,
          status: status === "all" ? "" : status,
        });

        setProducts(response.products || []);
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total,
          perPage: response.pagination.perPage,
        });
        setError(null);

        if (focusOptions?.preserve) {
          focusInput(focusOptions);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách sản phẩm. Vui lòng thử lại."
        );
        setProducts([]);
        setPagination({
          currentPage: page,
          totalPages: 1,
          total: 0,
          perPage: limit,
        });
      } finally {
        setLoading(false);
        setIsSearching(false);
        apiCallInProgressRef.current = false;
      }
    },
    [focusInput]
  );

  // ===== DEBOUNCED SEARCH =====
  const debouncedSearch = useMemo(
    () =>
      debounce(
        (
          searchTerm: string,
          category: string,
          status: string,
          limit: number
        ) => {
          performSearch(searchTerm, category, status, limit, 1, {
            preserve: true,
          });
        },
        300
      ),
    [performSearch]
  );

  // ===== SEARCH LOGIC HANDLER =====
  const handleSearchLogic = useCallback(
    (value: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      debouncedSearch.cancel();

      searchTimeoutRef.current = setTimeout(() => {
        if (value.length === 0) {
          performSearch("", categoryFilter, statusFilter, pageLimit, 1, {
            preserve: true,
          });
        } else if (value.trim().length > 0) {
          debouncedSearch(
            value.trim(),
            categoryFilter,
            statusFilter,
            pageLimit
          );
        }
      }, 50);
    },
    [debouncedSearch, performSearch, categoryFilter, statusFilter, pageLimit]
  );

  // ===== EVENT HANDLERS =====
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);

      if (!isComposing) {
        handleSearchLogic(value);
      }
    },
    [isComposing, handleSearchLogic]
  );

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setIsComposing(false);
      setSearchValue(value);
      setTimeout(() => handleSearchLogic(value), 50);
    },
    [handleSearchLogic]
  );

  const handleRefresh = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    debouncedSearch.cancel();

    setSearchValue("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPageLimit(10);
    setCurrentPage(1);

    performSearch("", "all", "all", 10, 1, { preserve: false });
  }, [debouncedSearch, performSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        focusInput({ selectAll: true });
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleRefresh();
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const value = e.currentTarget.value;

        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        debouncedSearch.cancel();

        performSearch(
          value.trim(),
          categoryFilter,
          statusFilter,
          pageLimit,
          1,
          { preserve: true }
        );
      }
    },
    [
      focusInput,
      handleRefresh,
      debouncedSearch,
      performSearch,
      categoryFilter,
      statusFilter,
      pageLimit,
    ]
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();

      setCategoryFilter(value);
      performSearch(searchValue, value, statusFilter, pageLimit, 1);
    },
    [debouncedSearch, performSearch, searchValue, statusFilter, pageLimit]
  );

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();

      setStatusFilter(value);
      performSearch(searchValue, categoryFilter, value, pageLimit, 1);
    },
    [debouncedSearch, performSearch, searchValue, categoryFilter, pageLimit]
  );

  const handlePageLimitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(e.target.value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();

      setPageLimit(value);
      setCurrentPage(1);

      performSearch(searchValue, categoryFilter, statusFilter, value, 1);
    },
    [debouncedSearch, performSearch, searchValue, categoryFilter, statusFilter]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      performSearch(
        searchValue,
        categoryFilter,
        statusFilter,
        pageLimit,
        newPage
      );
    },
    [performSearch, searchValue, categoryFilter, statusFilter, pageLimit]
  );

  // ===== DELETE HANDLERS =====
  const handleDeleteProduct = useCallback((id: number, name: string) => {
    setProductToDelete({ id, name });
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;

    try {
      await ProductService.deleteProduct(String(productToDelete.id));
      setShowDeleteModal(false);
      showToast("Đã xóa sản phẩm thành công!", { type: "success" });

      // Refresh current page
      performSearch(
        searchValue,
        categoryFilter,
        statusFilter,
        pageLimit,
        currentPage
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi xóa sản phẩm.",
        { type: "error" }
      );
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  }, [
    productToDelete,
    showToast,
    performSearch,
    searchValue,
    categoryFilter,
    statusFilter,
    pageLimit,
    currentPage,
  ]);

  // ===== FETCH CATEGORIES =====
  const fetchCategories = useCallback(async () => {
    try {
      const response = await CategoryService.getAllCategories();
      const categoryOptions = [{ value: "all", label: "Tất cả danh mục" }];

      response.forEach((parentCat: Category) => {
        categoryOptions.push({
          value: parentCat.id.toString(),
          label: parentCat.name,
        });

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
      showToast(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tải danh mục.",
        { type: "error" }
      );
    }
  }, [showToast]);

  // ===== EFFECTS =====
  useEffect(() => {
    // Get user role
    const userRole = getUserRole();
    setRole(userRole);
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      performSearch("", "all", "all", pageLimit, 1);
      fetchCategories();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();
      apiCallInProgressRef.current = false;
    };
  }, [
    isInitialized,
    performSearch,
    debouncedSearch,
    pageLimit,
    fetchCategories,
  ]);

  // ===== COMPUTED VALUES =====
  const breadcrumbItems = useMemo(
    () => [
      { label: "Trang chủ", href: "/admin" },
      { label: "Quản lý sản phẩm", active: true },
    ],
    []
  );

  const hasFilters =
    searchValue ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    pageLimit !== 10;
  const hasResults = products.length > 0;

  const paginationInfo = useMemo(() => {
    const startIndex = (currentPage - 1) * pagination.perPage + 1;
    const endIndex = Math.min(
      currentPage * pagination.perPage,
      pagination.total
    );

    return {
      startIndex,
      endIndex,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === pagination.totalPages,
    };
  }, [currentPage, pagination]);

  // ===== RENDER =====
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
          {role === 1 && (
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

          {/* Search & Filter Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-search mr-2"></i>
                Tìm kiếm và lọc
              </h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-card-widget="collapse"
                  title="Thu gọn"
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>

            <div className="card-body">
              <div className="row">
                {/* Search Input */}
                <div className="col-md-5">
                  <div className="form-group">
                    <label htmlFor="search-input">
                      <i className="fas fa-search mr-1"></i>
                      Tìm kiếm
                    </label>
                    <div className="input-group">
                      <input
                        ref={searchInputRef}
                        id="search-input"
                        type="text"
                        className={`form-control ${
                          isSearching ? "border-primary" : ""
                        }`}
                        placeholder="Tên sản phẩm, mã SKU... (Ctrl+K, Enter, Esc)"
                        value={searchValue}
                        onChange={handleSearchChange}
                        onCompositionStart={handleCompositionStart}
                        onCompositionEnd={handleCompositionEnd}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        autoComplete="off"
                      />
                      <div className="input-group-append">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleRefresh}
                          disabled={loading}
                          title="Làm mới / Xóa bộ lọc (Esc)"
                        >
                          <i
                            className={`fas ${
                              isSearching ? "fa-search fa-pulse" : "fa-sync-alt"
                            } ${loading ? "fa-spin" : ""}`}
                          ></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="col-md-3">
                  <div className="form-group">
                    <label htmlFor="category-filter">
                      <i className="fas fa-tags mr-1"></i>
                      Danh mục
                    </label>
                    <select
                      id="category-filter"
                      className="form-control"
                      value={categoryFilter}
                      onChange={handleCategoryChange}
                      disabled={loading}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="col-md-2">
                  <div className="form-group">
                    <label htmlFor="status-filter">
                      <i className="fas fa-filter mr-1"></i>
                      Trạng thái
                    </label>
                    <select
                      id="status-filter"
                      className="form-control"
                      value={statusFilter}
                      onChange={handleStatusChange}
                      disabled={loading}
                    >
                      {productStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ✅ ADD: Page Limit Selector */}
                <div className="col-md-2">
                  <div className="form-group">
                    <label htmlFor="page-limit">
                      <i className="fas fa-list-ol mr-1"></i>
                      Hiển thị
                    </label>
                    <select
                      id="page-limit"
                      className="form-control"
                      value={pageLimit}
                      onChange={handlePageLimitChange}
                      disabled={loading}
                    >
                      {pageLimitOptions.map((limit) => (
                        <option key={limit} value={limit}>
                          {limit} dòng
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-box mr-2"></i>
                Danh sách sản phẩm
              </h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  onClick={handleRefresh}
                  disabled={loading}
                  title="Làm mới dữ liệu"
                >
                  <i
                    className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              {loading ? (
                <div className="text-center p-5">
                  <LoadingSpinner
                    size="lg"
                    text="Đang tải danh sách sản phẩm..."
                  />
                </div>
              ) : error ? (
                <div className="alert alert-danger m-4">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle fa-2x mr-3 text-danger"></i>
                    <div className="flex-grow-1">
                      <h5 className="mb-1">Có lỗi xảy ra</h5>
                      <p className="mb-2">{error}</p>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleRefresh}
                      >
                        <i className="fas fa-redo mr-1"></i>
                        Thử lại
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <table className="table table-hover text-nowrap">
                  <thead className="table-light">
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
                    {hasResults ? (
                      products.map((product) => (
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
                          <td>
                            <span className="badge badge-light">
                              {product.sku}
                            </span>
                          </td>
                          <td>
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="text-decoration-none"
                            >
                              <div className="text-primary hover:underline">
                                {product.name}
                              </div>
                            </Link>
                          </td>
                          <td>
                            {product.categories
                              ?.map((cat) => cat.name)
                              .join(", ")}
                          </td>
                          <td>
                            <span
                              className={
                                (product.stock?.total || 0) <= 10
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
                          <td>
                            <small
                              className="text-muted"
                              title={product.createdAt}
                            >
                              {formatDateDisplay(product.createdAt)}
                            </small>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="btn btn-info btn-sm"
                                title="Xem chi tiết"
                              >
                                <i className="fas fa-eye"></i>
                              </Link>
                              {role === 1 && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  title="Xóa"
                                  onClick={() =>
                                    handleDeleteProduct(
                                      product.id,
                                      product.name
                                    )
                                  }
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-5">
                          <div className="empty-state">
                            <i className="fas fa-box fa-4x text-muted mb-3"></i>
                            <h5 className="text-muted">
                              {hasFilters
                                ? "Không tìm thấy sản phẩm nào"
                                : "Chưa có sản phẩm"}
                            </h5>
                            <p className="text-muted mb-3">
                              {hasFilters
                                ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                                : "Chưa có sản phẩm nào trong hệ thống"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && (
              <div className="card-footer clearfix">
                <div className="float-left">
                  <div className="dataTables_info">
                    <i className="fas fa-info-circle mr-1"></i>
                    Hiển thị{" "}
                    <strong>
                      {pagination.total > 0
                        ? `${paginationInfo.startIndex} - ${paginationInfo.endIndex}`
                        : "0"}
                    </strong>{" "}
                    của <strong>{pagination.total}</strong> sản phẩm
                    <span className="text-muted ml-2">
                      (Trang {currentPage} / {pagination.totalPages} -{" "}
                      {pageLimit} dòng/trang)
                    </span>
                  </div>
                </div>

                <ul className="pagination pagination-sm m-0 float-right">
                  <li
                    className={`page-item ${
                      paginationInfo.isFirstPage ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={paginationInfo.isFirstPage}
                      title="Trang trước"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                  </li>

                  {Array.from(
                    { length: Math.min(pagination.totalPages, 5) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <li
                          key={pageNum}
                          className={`page-item ${
                            currentPage === pageNum ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    }
                  )}

                  <li
                    className={`page-item ${
                      paginationInfo.isLastPage ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={paginationInfo.isLastPage}
                      title="Trang sau"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Delete Modal */}
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
