"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { OrderService } from "@/services/OrderService";
import { useToast } from "@/utils/useToast";
import { formatCurrency } from "@/utils/currencyUtils";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

// Định nghĩa kiểu dữ liệu cho order
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
  shippingPhone?: string;
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

export default function OrdersPage() {
  // Toast notifications
  const { showToast, Toast } = useToast();
  const showToastRef = useRef<typeof showToast | null>(null);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  // States
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 10,
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Danh sách trạng thái đơn hàng
  const orderStatuses = [
    { value: "all", label: "Tất cả trạng thái", color: "" },
    { value: "pending", label: "Chờ xác nhận", color: "bg-secondary" },
    { value: "processing", label: "Đang xử lý", color: "bg-warning" },
    { value: "shipping", label: "Đang giao", color: "bg-info" },
    { value: "delivered", label: "Hoàn thành", color: "bg-success" },
    { value: "cancelled", label: "Đã hủy", color: "bg-danger" },
  ];

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

  // Hàm xử lý việc lấy đơn hàng từ API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const role = getUserRole();

      let response: { orders: Order[]; pagination: Pagination };

      if (role === 1) {
        // Admin: gọi API lấy full đơn hàng
        response = await OrderService.getAdminOrders(
          currentPage,
          10,
          statusFilter,
          searchTerm,
          dateRange.from,
          dateRange.to
        );
      } else if (role === 2) {
        // Employee: gọi API chỉ lấy đơn hàng cơ bản
        response = await OrderService.getEmployeeOrders(
          currentPage,
          10,
          statusFilter,
          searchTerm,
          dateRange.from,
          dateRange.to
        );
      } else {
        setError("Bạn không có quyền truy cập trang này.");
        setOrders([]);
        setLoading(false);
        return;
      }

      // Định dạng dữ liệu order trả về
      const formattedOrders = response.orders.map((order: Order) => {
        // Map trạng thái đơn hàng sang class và label tương ứng
        const getStatusInfo = (
          status: string
        ): { label: string; cssClass: string } => {
          const statusMap: Record<string, { label: string; cssClass: string }> =
            {
              pending: { label: "Chờ xác nhận", cssClass: "bg-secondary" },
              processing: { label: "Đang xử lý", cssClass: "bg-warning" },
              shipping: { label: "Đang giao", cssClass: "bg-info" },
              delivered: { label: "Hoàn thành", cssClass: "bg-success" },
              cancelled: { label: "Đã hủy", cssClass: "bg-danger" },
            };
          return (
            statusMap[status] || { label: status, cssClass: "bg-secondary" }
          );
        };

        const statusInfo = getStatusInfo(order.status);

        // Format ngày tháng
        const date = new Date(order.createdAt);
        const formattedDate = new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(date);

        // Tổng hợp thông tin người dùng
        let customerName = "Khách hàng";
        if (order.user) {
          customerName = order.user.email || "Khách hàng";
        }

        return {
          ...order,
          customer: customerName,
          phone: order.phoneNumber || "Chưa có SĐT",
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
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unknown column")) {
        setError("Lỗi cấu trúc dữ liệu: " + error.message);
        // Sử dụng ref thay vì trực tiếp
        if (showToastRef.current) {
          showToastRef.current(
            "Cấu trúc dữ liệu không phù hợp. Liên hệ với quản trị viên để cập nhật ứng dụng.",
            { type: "error" }
          );
        }
        setOrders([]);
      } else {
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
        if (showToastRef.current) {
          showToastRef.current("Lỗi khi tải dữ liệu đơn hàng", {
            type: "error",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm, dateRange.from, dateRange.to]);

  // Fetch orders on component mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Paginate
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to page 1
    fetchOrders();
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange({ from: "", to: "" });
    setCurrentPage(1);
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string | number) => {
    try {
      // Redirect to order detail page
      window.location.href = `/admin/orders/${orderId}`;
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("Không thể cập nhật trạng thái đơn hàng", { type: "error" });
    }
  };

  // Print invoice
  const handlePrintInvoice = async (orderId: string | number) => {
    try {
      await OrderService.printOrderInvoice(orderId);
      showToast("Đang chuẩn bị in hóa đơn", { type: "success" });
    } catch (error) {
      console.error("Error printing invoice:", error);
      showToast("Không thể in hóa đơn", { type: "error" });
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/admin" },
    { label: "Đơn hàng", active: true },
  ];

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
          {/* Filters */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Bộ lọc và tìm kiếm</h3>
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
                        placeholder="Mã đơn hàng, tên khách hàng, SĐT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="input-group-append">
                        <button
                          type="button"
                          className="btn btn-default"
                          onClick={handleApplyFilters}
                        >
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                    </div>
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
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="form-group">
                    <label>Từ ngày</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, from: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="form-group">
                    <label>Đến ngày</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, to: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-md-1 d-flex align-items-end mb-3">
                  <button
                    className="btn btn-default w-100"
                    onClick={handleResetFilters}
                  >
                    <i className="fas fa-sync-alt"></i> Reset
                  </button>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <button
                    className="btn btn-primary"
                    onClick={handleApplyFilters}
                  >
                    Áp dụng lọc
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Danh sách đơn hàng</h3>
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
              {loading ? (
                <div className="text-center py-5">
                  <LoadingSpinner size="lg" text="Đang tải đơn hàng..." />
                </div>
              ) : error ? (
                <div className="text-center py-5 text-danger">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {error}
                </div>
              ) : (
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Khách hàng</th>
                      <th>Số điện thoại</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      <th>Sản phẩm</th>
                      <th>Ngày đặt</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.customer}</td>
                          <td>{order.phone}</td>
                          <td>
                            <span className={`badge ${order.statusClass}`}>
                              {order.statusLabel}
                            </span>
                          </td>
                          <td>{order.formattedTotal}</td>
                          <td>{order.items} sản phẩm</td>
                          <td>{order.formattedDate}</td>
                          <td>
                            <div className="btn-group">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="btn btn-sm btn-info mr-1"
                                title="Xem chi tiết"
                              >
                                <i className="fas fa-eye"></i>
                              </Link>
                              <button
                                className="btn btn-sm btn-primary mr-1"
                                title="Cập nhật trạng thái"
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id)
                                }
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-success mr-1"
                                title="In hóa đơn"
                                onClick={() => handlePrintInvoice(order.id)}
                              >
                                <i className="fas fa-print"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          Không tìm thấy đơn hàng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="card-footer clearfix">
              <div className="float-left">
                <div className="dataTables_info">
                  Hiển thị{" "}
                  {orders.length > 0
                    ? (pagination.currentPage - 1) * pagination.perPage + 1
                    : 0}{" "}
                  đến{" "}
                  {Math.min(
                    pagination.currentPage * pagination.perPage,
                    pagination.total
                  )}{" "}
                  của {pagination.total} đơn hàng
                </div>
              </div>
              <ul className="pagination pagination-sm m-0 float-right">
                <li
                  className={`page-item ${
                    pagination.currentPage === 1 ? "disabled" : ""
                  }`}
                >
                  <a
                    className="page-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.currentPage > 1)
                        paginate(pagination.currentPage - 1);
                    }}
                  >
                    &laquo;
                  </a>
                </li>
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      pagination.currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <a
                      className="page-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        paginate(index + 1);
                      }}
                    >
                      {index + 1}
                    </a>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    pagination.currentPage === pagination.totalPages
                      ? "disabled"
                      : ""
                  }`}
                >
                  <a
                    className="page-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.currentPage < pagination.totalPages)
                        paginate(pagination.currentPage + 1);
                    }}
                  >
                    &raquo;
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Toast notifications */}
      {Toast}
    </AdminLayout>
  );
}
