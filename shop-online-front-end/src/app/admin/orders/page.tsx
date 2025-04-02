"use client";
import { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";

export default function OrdersPage() {
  // State cho bộ lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Danh sách trạng thái đơn hàng
  const orderStatuses = [
    { value: "all", label: "Tất cả trạng thái", color: "" },
    { value: "pending", label: "Chờ xác nhận", color: "bg-secondary" },
    { value: "processing", label: "Đang xử lý", color: "bg-warning" },
    { value: "shipping", label: "Đang giao", color: "bg-info" },
    { value: "completed", label: "Hoàn thành", color: "bg-success" },
    { value: "cancelled", label: "Đã hủy", color: "bg-danger" },
  ];

  // Dữ liệu mẫu cho danh sách đơn hàng
  const orders = [
    {
      id: "ORD-0001",
      customer: "Nguyễn Văn A",
      phone: "0912345678",
      status: "completed",
      statusLabel: "Hoàn thành",
      statusClass: "bg-success",
      total: "1.500.000đ",
      items: 3,
      date: "2025-04-01",
      formattedDate: "01/04/2025",
    },
    {
      id: "ORD-0002",
      customer: "Trần Thị B",
      phone: "0923456789",
      status: "processing",
      statusLabel: "Đang xử lý",
      statusClass: "bg-warning",
      total: "2.300.000đ",
      items: 5,
      date: "2025-04-01",
      formattedDate: "01/04/2025",
    },
    {
      id: "ORD-0003",
      customer: "Lê Văn C",
      phone: "0934567890",
      status: "shipping",
      statusLabel: "Đang giao",
      statusClass: "bg-info",
      total: "950.000đ",
      items: 2,
      date: "2025-03-31",
      formattedDate: "31/03/2025",
    },
    {
      id: "ORD-0004",
      customer: "Phạm Thị D",
      phone: "0945678901",
      status: "cancelled",
      statusLabel: "Đã hủy",
      statusClass: "bg-danger",
      total: "1.200.000đ",
      items: 3,
      date: "2025-03-30",
      formattedDate: "30/03/2025",
    },
    {
      id: "ORD-0005",
      customer: "Hoàng Văn E",
      phone: "0956789012",
      status: "pending",
      statusLabel: "Chờ xác nhận",
      statusClass: "bg-secondary",
      total: "850.000đ",
      items: 1,
      date: "2025-03-29",
      formattedDate: "29/03/2025",
    },
    {
      id: "ORD-0006",
      customer: "Ngô Thị F",
      phone: "0967890123",
      status: "completed",
      statusLabel: "Hoàn thành",
      statusClass: "bg-success",
      total: "3.100.000đ",
      items: 6,
      date: "2025-03-28",
      formattedDate: "28/03/2025",
    },
    {
      id: "ORD-0007",
      customer: "Đỗ Văn G",
      phone: "0978901234",
      status: "processing",
      statusLabel: "Đang xử lý",
      statusClass: "bg-warning",
      total: "1.750.000đ",
      items: 4,
      date: "2025-03-27",
      formattedDate: "27/03/2025",
    },
    {
      id: "ORD-0008",
      customer: "Vũ Thị H",
      phone: "0989012345",
      status: "shipping",
      statusLabel: "Đang giao",
      statusClass: "bg-info",
      total: "2.600.000đ",
      items: 5,
      date: "2025-03-26",
      formattedDate: "26/03/2025",
    },
    {
      id: "ORD-0009",
      customer: "Khoang Văn H",
      phone: "0989032345",
      status: "shipping",
      statusLabel: "Đang giao",
      statusClass: "bg-info",
      total: "3.000.000đ",
      items: 5,
      date: "2025-03-26",
      formattedDate: "26/03/2025",
    },

    {
      id: "ORD-0010",
      customer: "Khoang Văn H",
      phone: "0989032345",
      status: "shipping",
      statusLabel: "Đang giao",
      statusClass: "bg-info",
      total: "3.000.000đ",
      items: 5,
      date: "2025-03-26",
      formattedDate: "26/03/2025",
    },

    {
      id: "ORD-0011",
      customer: "Khoang Văn H",
      phone: "0989032345",
      status: "shipping",
      statusLabel: "Đang giao",
      statusClass: "bg-info",
      total: "3.000.000đ",
      items: 5,
      date: "2025-03-26",
      formattedDate: "26/03/2025",
    },
  ];

  // Lọc đơn hàng theo các điều kiện đã chọn
  const filteredOrders = orders.filter((order) => {
    // Lọc theo từ khóa tìm kiếm
    const searchMatch =
      searchTerm === "" ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm);

    // Lọc theo trạng thái
    const statusMatch = statusFilter === "all" || order.status === statusFilter;

    // Lọc theo khoảng thời gian
    let dateMatch = true;
    if (dateRange.from) {
      dateMatch = dateMatch && order.date >= dateRange.from;
    }
    if (dateRange.to) {
      dateMatch = dateMatch && order.date <= dateRange.to;
    }

    return searchMatch && statusMatch && dateMatch;
  });

  // Tính toán cho phân trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Xử lý thay đổi trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/admin" },
    { label: "Đơn hàng", active: true },
  ];

  //gọi hàm cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = (orderId: string) => {
    console.log(`Cập nhật trạng thái cho đơn hàng ${orderId}`);
    // gọi api, làm sau
  };

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
                        <button type="button" className="btn btn-default">
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
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setDateRange({ from: "", to: "" });
                    }}
                  >
                    <i className="fas fa-sync-alt"></i> Reset
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
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.phone}</td>
                        <td>
                          <span className={`badge ${order.statusClass}`}>
                            {order.statusLabel}
                          </span>
                        </td>
                        <td>{order.total}</td>
                        <td>{order.items} sản phẩm</td>
                        <td>{order.formattedDate}</td>
                        <td>
                          <div className="btn-group">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="btn btn-sm btn-info mr-1"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                            <button
                              className="btn btn-sm btn-primary mr-1"
                              title="Cập nhật trạng thái"
                              onClick={() => {
                                handleUpdateOrderStatus(order.id);
                              }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-success mr-1"
                              title="In hóa đơn"
                              onClick={() => {
                                console.log(`In hóa đơn cho ${order.id}`);
                                // gọi hàm in hóa đơn sau đó xài window.print
                              }}
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
            </div>
            <div className="card-footer clearfix">
              <div className="float-left">
                <div className="dataTables_info">
                  Hiển thị{" "}
                  {filteredOrders.length > 0 ? indexOfFirstOrder + 1 : 0} đến{" "}
                  {Math.min(indexOfLastOrder, filteredOrders.length)} của{" "}
                  {filteredOrders.length} đơn hàng
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
                      if (currentPage > 1) paginate(currentPage - 1);
                    }}
                  >
                    &laquo;
                  </a>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
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
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <a
                    className="page-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) paginate(currentPage + 1);
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
    </AdminLayout>
  );
}
