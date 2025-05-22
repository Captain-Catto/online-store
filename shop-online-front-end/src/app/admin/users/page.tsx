"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { AuthClient } from "@/services/AuthClient";
import { API_BASE_URL } from "@/config/apiConfig";
import { formatDateDisplay } from "@/utils/dateUtils";
import { UserAdminApi } from "@/types/user";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { useToast } from "@/utils/useToast";

export default function UsersPage() {
  const { showToast, Toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const [users, setUsers] = useState<UserAdminApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
    perPage: 10,
  });
  const [disableLoading, setDisableLoading] = useState<number | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams();
        params.append("page", currentPage.toString());
        params.append("limit", usersPerPage.toString());

        if (searchTerm) {
          params.append("search", searchTerm);
        }
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }

        // Fetch data from API
        const response = await AuthClient.fetchWithAuth(
          `${API_BASE_URL}/users?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.status}`);
        }

        const data = await response.json();

        // Update state with API data
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, usersPerPage, searchTerm, statusFilter]); // Re-fetch when these change

  // Format user data for display
  const formattedUsers = users.map((user) => {
    return {
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
    };
  });

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/admin" },
    { label: "Quản lý người dùng", active: true },
  ];

  // Handle search - debounced search would be better
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter change
  const handleStatusFilter = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleToggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      setDisableLoading(userId); // Bắt đầu loading cho user cụ thể

      // Gọi API để thay đổi trạng thái người dùng
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/users/${userId}/toggle-status`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        // Xử lý các lỗi khác nhau từ server
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 403) {
          showToast("Bạn không có quyền thực hiện hành động này", {
            type: "error",
          });
          return;
        }

        throw new Error(
          errorData.message || `Không thể thay đổi trạng thái tài khoản`
        );
      }

      // Cập nhật lại danh sách người dùng trong state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isActive: !isActive } : user
        )
      );

      // Hiển thị thông báo thành công
      showToast(
        `Đã ${isActive ? "vô hiệu hóa" : "kích hoạt"} tài khoản thành công`,
        {
          type: "success",
        }
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi thay đổi trạng thái tài khoản",
        { type: "error" }
      );
    } finally {
      setDisableLoading(null); // Kết thúc loading
    }
  };

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
                        onChange={handleSearch}
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
                      onChange={handleStatusFilter}
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Đã vô hiệu hóa</option>
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
              {loading ? (
                <div className="text-center p-4">
                  <LoadingSpinner size="lg" text="Đang tải người dùng..." />
                </div>
              ) : error ? (
                <div className="alert alert-danger m-3">{error}</div>
              ) : (
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Số điện thoại</th>
                      <th>Vai trò</th>
                      <th>Tổng số đơn hàng</th>
                      <th>Tổng số tiền</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formattedUsers.length > 0 ? (
                      formattedUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.email}</td>
                          <td>{user.phoneNumber}</td>
                          <td>{user.role}</td>
                          <td>{user.totalOrders}</td>
                          <td>
                            {(user.totalSpent || 0).toLocaleString("vi-VN")} VNĐ
                          </td>
                          <td>
                            <span className={`badge ${user.statusClass}`}>
                              {user.statusLabel}
                            </span>
                          </td>
                          <td>{user.createdAt}</td>
                          <td>
                            <div className="btn-group">
                              <Link
                                href={`/admin/users/${user.id}`}
                                className="btn btn-sm btn-info mr-1"
                              >
                                <i className="fas fa-eye"></i>
                              </Link>

                              <button
                                className={`btn btn-sm ${
                                  user.isActive ? "btn-danger" : "btn-success"
                                }`}
                                title={
                                  user.isActive ? "Vô hiệu hóa" : "Kích hoạt"
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
                        <td colSpan={8} className="text-center py-4">
                          Không tìm thấy người dùng nào
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
                    Hiển thị{" "}
                    {pagination.total > 0
                      ? `${
                          (pagination.currentPage - 1) * pagination.perPage + 1
                        } đến ${Math.min(
                          pagination.currentPage * pagination.perPage,
                          pagination.total
                        )}`
                      : "0"}{" "}
                    của {pagination.total} người dùng
                  </div>
                </div>
                <ul className="pagination pagination-sm m-0 float-right">
                  <li
                    className={`page-item ${
                      pagination.currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      «
                    </button>
                  </li>
                  {Array.from({ length: pagination.pages }, (_, i) => (
                    <li
                      key={i + 1}
                      className={`page-item ${
                        pagination.currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => {
                          setCurrentPage(i + 1);
                        }}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      pagination.currentPage === pagination.pages
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.pages}
                    >
                      »
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
