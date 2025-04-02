"use client";

import { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Mock user data - replace with API call in production
  const users = [
    {
      id: "USR-001",
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0912345678",
      status: "active",
      statusLabel: "Đang hoạt động",
      statusClass: "bg-success",
      totalOrders: 5,
      totalSpent: "4.500.000đ",
      lastPurchase: "01/04/2025",
      createdAt: "15/01/2025",
    },
    {
      id: "USR-002",
      name: "Trần Thị B",
      email: "tranthib@example.com",
      phone: "0923456789",
      status: "active",
      statusLabel: "Đang hoạt động",
      statusClass: "bg-success",
      totalOrders: 3,
      totalSpent: "2.300.000đ",
      lastPurchase: "28/03/2025",
      createdAt: "20/01/2025",
    },
    {
      id: "USR-003",
      name: "Lê Văn C",
      email: "levanc@example.com",
      phone: "0934567890",
      status: "inactive",
      statusLabel: "Không hoạt động",
      statusClass: "bg-danger",
      totalOrders: 1,
      totalSpent: "890.000đ",
      lastPurchase: "15/02/2025",
      createdAt: "25/01/2025",
    },
    {
      id: "USR-004",
      name: "Phạm Thị D",
      email: "phamthid@example.com",
      phone: "0945678901",
      status: "active",
      statusLabel: "Đang hoạt động",
      statusClass: "bg-success",
      totalOrders: 7,
      totalSpent: "7.850.000đ",
      lastPurchase: "30/03/2025",
      createdAt: "10/02/2025",
    },
    {
      id: "USR-005",
      name: "Hoàng Văn E",
      email: "hoangvane@example.com",
      phone: "0956789012",
      status: "active",
      statusLabel: "Đang hoạt động",
      statusClass: "bg-success",
      totalOrders: 2,
      totalSpent: "1.750.000đ",
      lastPurchase: "20/03/2025",
      createdAt: "15/02/2025",
    },
  ];

  // Filter users based on search term and status
  const filteredUsers = users.filter((user) => {
    // Search filter
    const searchMatch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    // Status filter
    const statusMatch = statusFilter === "all" || user.status === statusFilter;

    return searchMatch && statusMatch;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/admin" },
    { label: "Quản lý người dùng", active: true },
  ];

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
                        placeholder="Tên, email, số điện thoại..."
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
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Danh sách người dùng</h3>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table table-hover text-nowrap">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Trạng thái</th>
                    <th>Số đơn hàng</th>
                    <th>Tổng chi tiêu</th>
                    <th>Lần mua gần nhất</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                          <span className={`badge ${user.statusClass}`}>
                            {user.statusLabel}
                          </span>
                        </td>
                        <td>{user.totalOrders} đơn</td>
                        <td>{user.totalSpent}</td>
                        <td>{user.lastPurchase}</td>
                        <td>
                          <div className="btn-group">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="btn btn-sm btn-info mr-1"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                            <button
                              className="btn btn-sm btn-primary mr-1"
                              title="Chỉnh sửa"
                              onClick={() => {
                                console.log(`Edit user ${user.id}`);
                              }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              title="Vô hiệu hóa"
                              onClick={() => {
                                console.log(`Disable user ${user.id}`);
                              }}
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        Không tìm thấy người dùng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="card-footer clearfix">
              <div className="float-left">
                <div className="dataTables_info">
                  Hiển thị {filteredUsers.length > 0 ? indexOfFirstUser + 1 : 0}{" "}
                  đến {Math.min(indexOfLastUser, filteredUsers.length)} của{" "}
                  {filteredUsers.length} người dùng
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
