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

// ===== ĐỊNH NGHĨA INTERFACE =====
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

  // ===== KHAI BÁO STATE =====
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

  // ✅ THÊM: Cờ để tránh gọi API trùng lặp
  const [isInitialized, setIsInitialized] = useState(false);

  // ===== CÁC HẰNG SỐ =====
  const pageLimitOptions = [5, 10, 20, 50, 100];

  const orderStatuses = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "processing", label: "Đang xử lý" },
    { value: "shipping", label: "Đang giao" },
    { value: "delivered", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  // ===== TRẠNG THÁI PHÂN TRANG =====
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 10,
  });

  // ===== CÁC REF =====
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // ✅ THÊM: Ref để theo dõi trạng thái gọi API
  const apiCallInProgressRef = useRef(false);

  // ===== CÁC HÀM TIỆN ÍCH =====
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

  // ===== QUẢN LÝ FOCUS =====
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

  // ===== HÀM TÌM KIẾM ===== (✅ Cập nhật với cơ chế tránh trùng lặp)
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
      if (apiCallInProgressRef.current) {
        return;
      }

      try {
        apiCallInProgressRef.current = true; // ✅ Đặt cờ
        setLoading(true);
        setIsSearching(true);
        setCurrentPage(page);

        const role = getUserRole();

        let response: { orders: Order[]; pagination: Pagination };

        // ✅ Làm sạch giá trị status
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

        // Định dạng dữ liệu đơn hàng
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
        apiCallInProgressRef.current = false; // ✅ Reset cờ
      }
    },
    [focusInput]
  );

  // ===== TÌM KIẾM DEBOUNCED ===== (✅ Giảm thời gian debounce)
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
        300 // ✅ Giảm từ 500ms xuống 300ms
      ),
    [performSearch]
  );

  // ===== HÀM XỬ LÝ LOGIC TÌM KIẾM ===== (✅ Cải thiện)
  const handleSearchLogic = useCallback(
    (value: string) => {
      // ✅ Hủy timeout trước đó
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // ✅ Hủy debounced call trước đó
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

  // ===== CÁC HÀM XỬ LÝ SỰ KIỆN ===== (✅ Tất cả handlers đã cập nhật để tránh trùng lặp)

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
    // ✅ Xóa tất cả timeout và hủy debounced calls
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    debouncedSearch.cancel();

    // ✅ Reset tất cả states
    setSearchValue("");
    setStatusFilter("all");
    setPageLimit(10);
    setCurrentPage(1);
    setDateRange({ from: "", to: "" });

    // ✅ Tìm kiếm ngay lập tức với giá trị mặc định
    performSearch("", "all", 10, 1, "", "", { preserve: false });
  }, [debouncedSearch, performSearch]);

  // ✅ SỬA: Chỉ xử lý phím Enter
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // ✅ CHỈ XỬ LÝ PHÍM ENTER
      if (e.key === "Enter") {
        e.preventDefault();
        const value = e.currentTarget.value;

        // ✅ Hủy bỏ các tìm kiếm trước đó
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        debouncedSearch.cancel();

        // ✅ Tìm kiếm ngay lập tức khi nhấn Enter
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
    [debouncedSearch, performSearch, statusFilter, pageLimit, dateRange]
  );

  // ✅ CẬP NHẬT: Xử lý thay đổi page limit với cleanup tốt hơn
  const handlePageLimitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(e.target.value);

      // ✅ Hủy tất cả operations đang chờ trước
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();

      // ✅ Cập nhật states
      setPageLimit(value);
      setCurrentPage(1);

      // ✅ Tìm kiếm ngay lập tức với limit mới
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

      // ✅ Hủy operations đang chờ
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

      // ✅ Hủy operations đang chờ
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

      // ✅ Hủy operations đang chờ
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

  // ===== CÁC EFFECT ===== (✅ Cập nhật để tránh gọi initial calls trùng lặp)
  useEffect(() => {
    // ✅ Chỉ chạy một lần khi component mount
    if (!isInitialized) {
      setIsInitialized(true);
      performSearch("", "all", pageLimit, 1, "", "");
    }

    // ✅ Hàm cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();
      apiCallInProgressRef.current = false;
    };
  }, [isInitialized, performSearch, debouncedSearch, pageLimit]);

  // ===== GIÁ TRỊ TÍNH TOÁN =====
  const breadcrumbItems = useMemo(
    () => [
      { label: "Trang chủ", href: "/admin" },
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

  // ===== RENDER =====
  return (
    <AdminLayout title="Quản lý đơn hàng">
      {/* Header nội dung */}
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

      {/* Nội dung chính */}
      <section className="content">
        <div className="container-fluid">
          {/* Card tìm kiếm và lọc */}
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
                {/* Ô tìm kiếm */}
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
                        placeholder="Mã đơn hàng, tên khách hàng, SĐT... (Nhấn Enter để tìm)"
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
                          title="Làm mới dữ liệu và xóa bộ lọc"
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

                {/* Lọc trạng thái */}
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

                {/* Từ ngày */}
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

                {/* Đến ngày */}
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

                {/* Lọc số dòng hiển thị */}
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

          {/* Card danh sách đơn hàng */}
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

            {/* Phân trang */}
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
