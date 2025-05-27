"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { OrderService } from "@/services/OrderService";
import { useToast } from "@/utils/useToast";
import { formatCurrency } from "@/utils/currencyUtils";
import { formatDateDisplay } from "@/utils/dateUtils";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import debounce from "lodash/debounce";

// ===== INTERFACES ===== (same as before)
interface OrderDetail {
  id: number;
  productId: number;
  quantity: number;
  color: string;
  size: string;
  originalPrice: number;
  discountPrice: number;
  imageUrl?: string;
  product?: {
    id: number;
    name: string;
    sku?: string;
  };
}

interface User {
  id?: number;
  username?: string;
  email?: string;
}

interface Order {
  id: number | string;
  userId: number;
  user?: User;
  customer?: string;
  phone?: string;
  phoneNumber?: string;
  shippingFullName?: string;
  shippingPhoneNumber?: string;
  status: string;
  statusLabel?: string;
  statusClass?: string;
  total: number;
  subtotal?: number;
  shippingFee?: number;
  voucherDiscount?: number;
  shippingAddress?: string;
  paymentMethodId: number;
  paymentStatusId: number;
  items?: number;
  date?: string;
  formattedDate?: string;
  formattedTotal?: string;
  createdAt: string;
  updatedAt: string;
  orderDetails?: OrderDetail[];
}

interface Pagination {
  total: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
}

interface FocusOptions {
  preserve?: boolean;
  selectAll?: boolean;
}

export default function OrdersPage() {
  const { showToast, Toast } = useToast();
  const router = useRouter();

  // ===== STATES =====
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageLimit, setPageLimit] = useState(10);
  const [isComposing, setIsComposing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // ✅ ADD: Flag to prevent duplicate calls
  const [isInitialized, setIsInitialized] = useState(false);

  // ===== CONSTANTS =====
  const pageLimitOptions = [5, 10, 20, 50, 100];

  const orderStatuses = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "processing", label: "Đang xử lý" },
    { value: "shipping", label: "Đang giao" },
    { value: "delivered", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  // ===== PAGINATION STATE =====
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 10,
  });

  // ===== REFS =====
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // ✅ ADD: Ref to track if API call is in progress
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

  const getStatusInfo = (
    status: string
  ): { label: string; cssClass: string } => {
    const statusMap: Record<string, { label: string; cssClass: string }> = {
      pending: { label: "Chờ xác nhận", cssClass: "bg-secondary" },
      processing: { label: "Đang xử lý", cssClass: "bg-warning" },
      shipping: { label: "Đang giao", cssClass: "bg-info" },
      delivered: { label: "Hoàn thành", cssClass: "bg-success" },
      cancelled: { label: "Đã hủy", cssClass: "bg-danger" },
    };
    return statusMap[status] || { label: status, cssClass: "bg-secondary" };
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

  // ===== SEARCH FUNCTION ===== (✅ Updated with duplicate prevention)
  const performSearch = useCallback(
    async (
      searchTerm: string,
      status: string,
      limit: number,
      page = 1,
      dateFrom = "",
      dateTo = "",
      focusOptions?: FocusOptions
    ) => {
      // ✅ Prevent duplicate API calls
      if (apiCallInProgressRef.current) {
        console.log("API call already in progress, skipping...");
        return;
      }

      try {
        apiCallInProgressRef.current = true; // ✅ Set flag
        setLoading(true);
        setIsSearching(true);
        setCurrentPage(page);

        const role = getUserRole();

        let response: { orders: Order[]; pagination: Pagination };

        // ✅ Clean status value properly
        const cleanStatus = status === "all" ? "" : status;

        if (role === 1) {
          response = await OrderService.getAdminOrders(
            page,
            limit,
            cleanStatus,
            searchTerm.trim(),
            dateFrom,
            dateTo
          );
        } else if (role === 2) {
          response = await OrderService.getEmployeeOrders(
            page,
            limit,
            cleanStatus,
            searchTerm.trim(),
            dateFrom,
            dateTo
          );
        } else {
          throw new Error("Bạn không có quyền truy cập trang này.");
        }
        console.log("API response:", response);
        // Format orders
        const formattedOrders = response.orders.map((order: Order) => {
          const statusInfo = getStatusInfo(order.status);
          const formattedDate = formatDateDisplay(order.createdAt);

          let customerName = "Khách hàng";
          if (order.user?.email) {
            customerName = order.user.email;
          } else if (order.user?.username) {
            customerName = order.user.username;
          }

          return {
            ...order,
            customer: customerName,
            phone:
              order.shippingPhoneNumber || order.phoneNumber || "Chưa có SĐT",
            statusLabel: statusInfo.label,
            statusClass: statusInfo.cssClass,
            formattedTotal: formatCurrency(order.total || 0),
            items: order.orderDetails?.length || 0,
            date: order.createdAt,
            formattedDate,
          };
        });

        setOrders(formattedOrders);
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
            : "Không thể tải danh sách đơn hàng. Vui lòng thử lại."
        );
        setOrders([]);
        setPagination({
          total: 0,
          totalPages: 1,
          currentPage: page,
          perPage: limit,
        });
      } finally {
        setLoading(false);
        setIsSearching(false);
        apiCallInProgressRef.current = false; // ✅ Reset flag
      }
    },
    [focusInput]
  );

  // ===== DEBOUNCED SEARCH ===== (✅ Reduced debounce time)
  const debouncedSearch = useMemo(
    () =>
      debounce(
        (
          searchTerm: string,
          status: string,
          limit: number,
          dateFrom: string,
          dateTo: string
        ) => {
          performSearch(searchTerm, status, limit, 1, dateFrom, dateTo, {
            preserve: true,
          });
        },
        300 // ✅ Reduced from 500ms to 300ms
      ),
    [performSearch]
  );

  // ===== SEARCH LOGIC HANDLER ===== (✅ Improved)
  const handleSearchLogic = useCallback(
    (value: string) => {
      // ✅ Cancel previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // ✅ Cancel previous debounced call
      debouncedSearch.cancel();

      searchTimeoutRef.current = setTimeout(() => {
        if (value.length === 0) {
          performSearch(
            "",
            statusFilter,
            pageLimit,
            1,
            dateRange.from,
            dateRange.to,
            { preserve: true }
          );
        } else if (value.trim().length > 0) {
          debouncedSearch(
            value.trim(),
            statusFilter,
            pageLimit,
            dateRange.from,
            dateRange.to
          );
        }
      }, 50);
    },
    [debouncedSearch, performSearch, statusFilter, pageLimit, dateRange]
  );

  // ===== EVENT HANDLERS ===== (✅ All handlers updated to prevent duplicates)

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
    // ✅ Clear all timeouts and cancel debounced calls
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    debouncedSearch.cancel();

    // ✅ Reset all states
    setSearchValue("");
    setStatusFilter("all");
    setPageLimit(10);
    setCurrentPage(1);
    setDateRange({ from: "", to: "" });

    // ✅ Immediate search with default values
    performSearch("", "all", 10, 1, "", "", { preserve: false });
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

        // ✅ Cancel previous calls
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        debouncedSearch.cancel();

        // ✅ Immediate search
        performSearch(
          value.trim(),
          statusFilter,
          pageLimit,
          1,
          dateRange.from,
          dateRange.to,
          { preserve: true }
        );
      }
    },
    [
      focusInput,
      handleRefresh,
      debouncedSearch,
      performSearch,
      statusFilter,
      pageLimit,
      dateRange,
    ]
  );

  // ✅ UPDATED: Page limit change handler with better cleanup
  const handlePageLimitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(e.target.value);

      // ✅ Cancel all pending operations first
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();

      // ✅ Update states
      setPageLimit(value);
      setCurrentPage(1);

      // ✅ Immediate search with new limit
      performSearch(
        searchValue,
        statusFilter,
        value,
        1,
        dateRange.from,
        dateRange.to
      );
    },
    [debouncedSearch, performSearch, searchValue, statusFilter, dateRange]
  );

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;

      // ✅ Cancel pending operations
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();

      setStatusFilter(value);
      performSearch(
        searchValue,
        value,
        pageLimit,
        1,
        dateRange.from,
        dateRange.to
      );
    },
    [debouncedSearch, performSearch, searchValue, pageLimit, dateRange]
  );

  const handleDateFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // ✅ Cancel pending operations
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();

      setDateRange((prev) => ({ ...prev, from: value }));
      performSearch(
        searchValue,
        statusFilter,
        pageLimit,
        1,
        value,
        dateRange.to
      );
    },
    [
      debouncedSearch,
      performSearch,
      searchValue,
      statusFilter,
      pageLimit,
      dateRange.to,
    ]
  );

  const handleDateToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // ✅ Cancel pending operations
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();

      setDateRange((prev) => ({ ...prev, to: value }));
      performSearch(
        searchValue,
        statusFilter,
        pageLimit,
        1,
        dateRange.from,
        value
      );
    },
    [
      debouncedSearch,
      performSearch,
      searchValue,
      statusFilter,
      pageLimit,
      dateRange.from,
    ]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      performSearch(
        searchValue,
        statusFilter,
        pageLimit,
        newPage,
        dateRange.from,
        dateRange.to
      );
    },
    [performSearch, searchValue, statusFilter, pageLimit, dateRange]
  );

  const handleViewOrder = useCallback(
    (orderId: string | number) => {
      router.push(`/admin/orders/${orderId}`);
    },
    [router]
  );

  const handlePrintInvoice = useCallback(
    async (orderId: string | number) => {
      try {
        await OrderService.printOrderInvoice(orderId);
        showToast("Đang chuẩn bị in hóa đơn", { type: "success" });
      } catch {
        showToast("Không thể in hóa đơn", { type: "error" });
      }
    },
    [showToast]
  );

  // ===== EFFECTS ===== (✅ Updated to prevent duplicate initial calls)
  useEffect(() => {
    // ✅ Only run once when component mounts
    if (!isInitialized) {
      setIsInitialized(true);
      performSearch("", "all", pageLimit, 1, "", "");
    }

    // ✅ Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();
      apiCallInProgressRef.current = false;
    };
  }, [isInitialized, performSearch, debouncedSearch, pageLimit]);

  // ===== COMPUTED VALUES =====
  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", href: "/admin" },
      { label: "Quản lý đơn hàng", active: true },
    ],
    []
  );

  const hasFilters =
    searchValue ||
    statusFilter !== "all" ||
    pageLimit !== 10 ||
    dateRange.from ||
    dateRange.to;
  const hasResults = orders.length > 0;

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

  // ===== RENDER ===== (same JSX as before)
  return (
    <AdminLayout title="Quản lý đơn hàng">
      {/* Content Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Quản lý đơn hàng</h1>
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
                <div className="col-md-4">
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
                        placeholder="Mã đơn hàng, tên khách hàng, SĐT... (Ctrl+K, Enter, Esc)"
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
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date From */}
                <div className="col-md-2">
                  <div className="form-group">
                    <label htmlFor="date-from">
                      <i className="fas fa-calendar mr-1"></i>
                      Từ ngày
                    </label>
                    <input
                      id="date-from"
                      type="date"
                      className="form-control"
                      value={dateRange.from}
                      onChange={handleDateFromChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Date To */}
                <div className="col-md-2">
                  <div className="form-group">
                    <label htmlFor="date-to">
                      <i className="fas fa-calendar mr-1"></i>
                      Đến ngày
                    </label>
                    <input
                      id="date-to"
                      type="date"
                      className="form-control"
                      value={dateRange.to}
                      onChange={handleDateToChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Page Limit Filter */}
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

          {/* Orders List Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-shopping-cart mr-2"></i>
                Danh sách đơn hàng
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
                    text="Đang tải danh sách đơn hàng..."
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
                      <th>Mã đơn hàng</th>
                      <th>Tên người nhận</th>
                      <th>SĐT nhận hàng</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      <th>Sản phẩm</th>
                      <th>Ngày đặt</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hasResults ? (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <span className="badge badge-light">
                              #{order.id}
                            </span>
                          </td>
                          <td>
                            <div className="font-weight-bold">
                              {order.shippingFullName}
                            </div>
                          </td>
                          <td>
                            <span className="text-nowrap">{order.phone}</span>
                          </td>
                          <td>
                            <span className={`badge ${order.statusClass}`}>
                              {order.statusLabel}
                            </span>
                          </td>
                          <td>
                            <strong className="text-success">
                              {order.formattedTotal}
                            </strong>
                          </td>
                          <td>
                            <span className="badge badge-outline-info">
                              {order.items} sản phẩm
                            </span>
                          </td>
                          <td>
                            <small
                              className="text-muted"
                              title={order.createdAt}
                            >
                              {order.formattedDate}
                            </small>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => handleViewOrder(order.id)}
                                title="Xem chi tiết"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleViewOrder(order.id)}
                                title="Cập nhật trạng thái"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handlePrintInvoice(order.id)}
                                title="In hóa đơn"
                              >
                                <i className="fas fa-print"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-5">
                          <div className="empty-state">
                            <i className="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
                            <h5 className="text-muted">
                              {hasFilters
                                ? "Không tìm thấy đơn hàng nào"
                                : "Chưa có đơn hàng"}
                            </h5>
                            <p className="text-muted mb-3">
                              {hasFilters
                                ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                                : "Chưa có đơn hàng nào trong hệ thống"}
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
                    của <strong>{pagination.total}</strong> đơn hàng
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

      {Toast}
    </AdminLayout>
  );
}
