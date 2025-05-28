"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { AuthClient } from "@/services/AuthClient";
import { API_BASE_URL } from "@/config/apiConfig";
import { formatDateDisplay } from "@/utils/dateUtils";
import { UserAdminApi } from "@/types/user";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { useToast } from "@/utils/useToast";
import debounce from "lodash/debounce";
import { mapUserRole, mapUserRoleColor } from "@/utils/orderUtils";

interface FocusOptions {
  preserve?: boolean;
  selectAll?: boolean;
}

export default function UsersPage() {
  const { showToast, Toast } = useToast();

  // ===== STATES =====
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageLimit, setPageLimit] = useState(10);
  const [isComposing, setIsComposing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<UserAdminApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disableLoading, setDisableLoading] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // ===== CONSTANTS =====
  const pageLimitOptions = [5, 10, 20, 50, 100];

  // ===== PAGINATION STATE =====
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
    perPage: 10,
  });

  // ===== REFS =====
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      status: string,
      limit: number,
      page = 1,
      focusOptions?: FocusOptions
    ) => {
      try {
        setLoading(true);
        setIsSearching(true);
        setCurrentPage(page);

        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }

        if (status !== "all") {
          params.append("status", status);
        }

        const response = await AuthClient.fetchWithAuth(
          `${API_BASE_URL}/users?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch users`);
        }

        const data = await response.json();

        setUsers(data.users || []);
        setPagination(
          data.pagination || {
            total: 0,
            pages: 1,
            currentPage: page,
            perPage: limit,
          }
        );
        setError(null);

        // Focus management
        if (focusOptions?.preserve) {
          focusInput(focusOptions);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Không thể tìm kiếm người dùng. Vui lòng thử lại."
        );
        setUsers([]);
        setPagination({
          total: 0,
          pages: 1,
          currentPage: page,
          perPage: limit,
        });
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [focusInput]
  );

  // ===== DEBOUNCED SEARCH =====
  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string, status: string, limit: number) => {
        performSearch(searchTerm, status, limit, 1, { preserve: true });
      }, 500),
    [performSearch]
  );

  // ===== SEARCH LOGIC HANDLER =====
  const handleSearchLogic = useCallback(
    (value: string) => {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout
      searchTimeoutRef.current = setTimeout(() => {
        if (value.length === 0) {
          debouncedSearch.cancel();
          performSearch("", statusFilter, pageLimit, 1, { preserve: true });
        } else if (value.trim().length > 0) {
          debouncedSearch(value, statusFilter, pageLimit);
        }
      }, 100);
    },
    [debouncedSearch, performSearch, statusFilter, pageLimit]
  );

  // ===== EVENT HANDLERS =====

  // Search input change
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

  // IME Composition events
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setIsComposing(false);
      setSearchValue(value);

      setTimeout(() => handleSearchLogic(value), 50);
    },
    [handleSearchLogic]
  );

  // Refresh - Reset tất cả về mặc định
  const handleRefresh = useCallback(() => {
    // Clear all states
    setSearchValue("");
    setStatusFilter("all");
    setPageLimit(10);
    setCurrentPage(1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    debouncedSearch.cancel();

    // Reload with default values
    performSearch("", "all", 10, 1, { preserve: false });
  }, [debouncedSearch, performSearch]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Ctrl/Cmd + K to focus and select all
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        focusInput({ selectAll: true });
      }

      // Escape to refresh (clear all filters)
      if (e.key === "Escape") {
        e.preventDefault();
        handleRefresh();
      }

      // Enter to search immediately
      if (e.key === "Enter") {
        e.preventDefault();
        const value = e.currentTarget.value;

        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        debouncedSearch.cancel();

        if (value.trim().length > 0) {
          performSearch(value, statusFilter, pageLimit, 1, { preserve: true });
        } else {
          performSearch("", statusFilter, pageLimit, 1, { preserve: true });
        }
      }
    },
    [
      focusInput,
      handleRefresh,
      debouncedSearch,
      performSearch,
      statusFilter,
      pageLimit,
    ]
  );

  // Status filter change
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setStatusFilter(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();

      performSearch(searchValue, value, pageLimit, 1);
    },
    [debouncedSearch, performSearch, searchValue, pageLimit]
  );

  // Page limit change handler
  const handlePageLimitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(e.target.value);
      setPageLimit(value);
      setCurrentPage(1); // Reset to first page

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();

      performSearch(searchValue, statusFilter, value, 1);
    },
    [debouncedSearch, performSearch, searchValue, statusFilter]
  );

  // Pagination
  const handlePageChange = useCallback(
    (newPage: number) => {
      performSearch(searchValue, statusFilter, pageLimit, newPage);
    },
    [performSearch, searchValue, statusFilter, pageLimit]
  );

  // Toggle user status
  const handleToggleUserStatus = useCallback(
    async (userId: number, isActive: boolean) => {
      try {
        setDisableLoading(userId);

        const response = await AuthClient.fetchWithAuth(
          `${API_BASE_URL}/users/${userId}/toggle-status`,
          { method: "PATCH" }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 403) {
            showToast("Bạn không có quyền thực hiện hành động này", {
              type: "error",
            });
            return;
          }

          throw new Error(
            errorData.message || "Không thể thay đổi trạng thái tài khoản"
          );
        }

        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, isActive: !isActive } : user
          )
        );

        showToast(
          `Đã ${isActive ? "vô hiệu hóa" : "kích hoạt"} tài khoản thành công`,
          { type: "success" }
        );
      } catch (error) {
        showToast(
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi thay đổi trạng thái",
          { type: "error" }
        );
      } finally {
        setDisableLoading(null);
      }
    },
    [showToast]
  );

  // ===== EFFECTS =====

  // Initial load
  useEffect(() => {
    performSearch("", "all", pageLimit, 1);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();
    };
  }, [performSearch, debouncedSearch, pageLimit]);

  // ===== COMPUTED VALUES =====

  const formattedUsers = useMemo(
    () =>
      users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        statusLabel: user.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa",
        statusClass: user.isActive ? "bg-success" : "bg-danger",
        role: user.role?.name || "User",
        roleId: user.roleId,
        totalOrders: user.totalOrders || 0,
        totalSpent: user.totalSpent || 0,
        createdAt: formatDateDisplay(user.createdAt),
        updatedAt: user.updatedAt,
        dateOfBirth: user.dateOfBirth,
      })),
    [users]
  );

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", href: "/admin" },
      { label: "Quản lý người dùng", active: true },
    ],
    []
  );

  const hasFilters = searchValue || statusFilter !== "all" || pageLimit !== 10;
  const hasResults = formattedUsers.length > 0;

  // Pagination info using currentPage
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
      isLastPage: currentPage === pagination.pages,
      showPagination: true,
    };
  }, [currentPage, pagination]);

  // ===== RENDER =====
  return (
    <AdminLayout title="Quản lý người dùng">
      {/* Content Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Quản lý người dùng</h1>
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
                <div className="col-md-6">
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
                        placeholder="Email, tên, số điện thoại... (Ctrl+K, Enter, Esc)"
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

                {/* Status Filter */}
                <div className="col-md-3">
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
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Đã vô hiệu hóa</option>
                    </select>
                  </div>
                </div>

                {/* Page Limit Filter */}
                <div className="col-md-3">
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

          {/* Users List Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-users mr-2"></i>
                Danh sách người dùng
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
                    text="Đang tải danh sách người dùng..."
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
                      <th>ID</th>
                      <th>Thông tin người dùng</th>
                      <th>Số điện thoại</th>
                      <th>Vai trò</th>
                      <th>Đơn hàng</th>
                      <th>Chi tiêu (VNĐ)</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hasResults ? (
                      formattedUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <span className="badge badge-light">
                              #{user.id}
                            </span>
                          </td>
                          <td>
                            <div className="user-panel">
                              <div className="">
                                <Link
                                  href={`/admin/users/${user.id}`}
                                  className="d-block font-weight-bold text-decoration-none"
                                >
                                  {user.email}
                                </Link>
                                {user.username && (
                                  <small className="text-muted">
                                    @{user.username}
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            {user.phoneNumber ? (
                              <span className="text-nowrap">
                                {user.phoneNumber}
                              </span>
                            ) : (
                              <span className="text-muted">Chưa cập nhật</span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${mapUserRoleColor(user.role)}`}
                            >
                              {mapUserRole(user.role)}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-outline-info">
                              {user.totalOrders} đơn
                            </span>
                          </td>
                          <td>
                            <strong className="text-success">
                              {user.totalSpent.toLocaleString("vi-VN")}
                            </strong>
                          </td>
                          <td>
                            <span className={`badge ${user.statusClass}`}>
                              <i
                                className={`fas ${
                                  user.isActive
                                    ? "fa-check-circle"
                                    : "fa-times-circle"
                                } mr-1`}
                              ></i>
                              {user.statusLabel}
                            </span>
                          </td>
                          <td>
                            <small
                              className="text-muted"
                              title={user.createdAt}
                            >
                              {user.createdAt}
                            </small>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link
                                href={`/admin/users/${user.id}`}
                                className="btn btn-info btn-sm"
                                title="Xem chi tiết"
                              >
                                <i className="fas fa-eye"></i>
                              </Link>
                              <button
                                className={`btn btn-sm ${
                                  user.isActive ? "btn-danger" : "btn-success"
                                }`}
                                title={
                                  user.isActive
                                    ? "Vô hiệu hóa tài khoản"
                                    : "Kích hoạt tài khoản"
                                }
                                onClick={() =>
                                  handleToggleUserStatus(user.id, user.isActive)
                                }
                                disabled={disableLoading === user.id}
                              >
                                {disableLoading === user.id ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : user.isActive ? (
                                  <i className="fas fa-ban"></i>
                                ) : (
                                  <i className="fas fa-check-circle"></i>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-5">
                          <div className="empty-state">
                            <i className="fas fa-users fa-4x text-muted mb-3"></i>
                            <h5 className="text-muted">
                              {hasFilters
                                ? "Không tìm thấy người dùng nào"
                                : "Chưa có người dùng"}
                            </h5>
                            <p className="text-muted mb-3">
                              {hasFilters
                                ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                                : "Chưa có người dùng nào trong hệ thống"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination - Always show when hasResults */}
            {!loading && hasResults && (
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
                    của <strong>{pagination.total}</strong> người dùng
                    <span className="text-muted ml-2">
                      (Trang {currentPage} / {pagination.pages} - {pageLimit}{" "}
                      dòng/trang)
                    </span>
                  </div>
                </div>

                <ul className="pagination pagination-sm m-0 float-right">
                  {/* Previous Button */}
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

                  {/* Page Numbers */}
                  {Array.from(
                    { length: Math.min(pagination.pages, 5) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
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

                  {/* Next Button */}
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

      {/* Toast notifications */}
      {Toast}
    </AdminLayout>
  );
}
