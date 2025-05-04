"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";

import { useEffect, useCallback } from "react";
import { AuthClient } from "@/services/AuthClient";
import { API_BASE_URL } from "@/config/apiConfig";
import { Order } from "@/types/order";
import { formatDateDisplay } from "@/utils/dateUtils";
import { UserAdminApi } from "@/types/user";
import PaginationComponent from "@/components/Category/Pagination";
import { UserService } from "@/services/UserService";
import { UserNote } from "@/types/user";
import { formatCurrency } from "@/utils/currencyUtils";

export default function UserDetailPage() {
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState("info");
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [user, setUser] = useState<UserAdminApi | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // state cho phân trang và bộ lọc
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 10,
  });
  const [orderStatus, setOrderStatus] = useState("all");

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // state xử lý notes
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<{
    id: number;
    note: string;
  } | null>(null);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [deleteNoteModal, setDeleteNoteModal] = useState<{
    show: boolean;
    noteId: number | null;
  }>({
    show: false,
    noteId: null,
  });

  // Danh sách các trạng thái đơn hàng
  const orderStatuses = [
    { value: "all", label: "Tất cả" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "processing", label: "Đang xử lý" },
    { value: "shipping", label: "Đang giao hàng" },
    { value: "delivered", label: "Đã giao" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  const fetchUserOrders = useCallback(
    async (page = currentPage, status = orderStatus) => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);

        let url = `${API_BASE_URL}/orders/user/${id}?page=${page}&limit=${pagination.perPage}`;
        if (status !== "all") {
          url += `&status=${status}`;
        }

        console.log("Fetching user orders from:", url);
        const response = await AuthClient.fetchWithAuth(url);

        if (!response.ok) {
          throw new Error(`Error fetching orders: ${response.status}`);
        }

        const data = await response.json();
        console.log("User orders data:", data);

        setUserOrders(data.orders);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Failed to fetch user orders:", error);
        setOrdersError(
          error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu đơn hàng"
        );
      } finally {
        setOrdersLoading(false);
      }
    },
    [id, currentPage, orderStatus, pagination.perPage]
  );

  const fetchUserData = useCallback(async () => {
    try {
      setUserLoading(true);
      setUserError(null);

      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/users/${id}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching user: ${response.status}`);
      }

      const userData = await response.json();
      console.log("User data:", userData);

      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUserError(
        error instanceof Error
          ? error.message
          : "Không thể tải thông tin người dùng"
      );
    } finally {
      setUserLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Thêm useEffect để fetch dữ liệu khi tab được kích hoạt
  useEffect(() => {
    if (activeTab === "orders") {
      fetchUserOrders(currentPage, orderStatus);
    }
  }, [activeTab, id, currentPage, orderStatus, fetchUserOrders]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/admin" },
    { label: "Người dùng", href: "/admin/users" },
    { label: id, active: true },
  ];

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderStatus(event.target.value);
    setCurrentPage(1);
  };

  // Hàm helper để map trạng thái đơn hàng sang màu sắc
  const getOrderStatusClass = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-gray-500";
      case "processing":
        return "bg-yellow-500";
      case "shipping":
        return "bg-blue-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Hàm map trạng thái sang nhãn tiếng Việt
  const getOrderStatusLabel = (status: string): string => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipping":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Hàm xử lý khi chuyển trang
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const OrderFilters = () => (
    <div className="mb-4 bg-gray-50 p-4 rounded-lg">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          <label
            htmlFor="status-filter"
            className="mr-2 mb-0 text-sm font-medium text-gray-700"
          >
            Lọc theo trạng thái:
          </label>
          <select
            id="status-filter"
            className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            value={orderStatus}
            onChange={handleStatusChange}
          >
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {orderStatus !== "all" && (
          <button
            onClick={() => setOrderStatus("all")}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            <i className="fas fa-times mr-1"></i> Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );

  const handleToggleStatusClick = () => {
    setShowStatusModal(true);
    setStatusError(null);
  };

  const handleToggleStatus = async () => {
    try {
      setIsStatusLoading(true);
      setStatusError(null);

      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/users/${id}/toggle-status`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Không thể thay đổi trạng thái tài khoản`
        );
      }

      await response.json();

      // Cập nhật dữ liệu người dùng trong state
      setUser((prev) => (prev ? { ...prev, isActive: !prev.isActive } : null));

      // Đóng modal sau khi thành công
      setShowStatusModal(false);
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      setStatusError(
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi thay đổi trạng thái tài khoản"
      );
    } finally {
      setIsStatusLoading(false);
    }
  };

  const fetchUserNotes = useCallback(async () => {
    if (!id) return;

    try {
      setNotesLoading(true);
      setNotesError(null);

      const data = await UserService.getUserNotes(Number(id));
      console.log("User notes data:", data);
      setNotes(data.notes || []);
    } catch (error) {
      console.error("Failed to fetch user notes:", error);
      setNotesError(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách ghi chú"
      );
    } finally {
      setNotesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "notes") {
      fetchUserNotes();
    }
  }, [activeTab, fetchUserNotes]);

  // Thêm các hàm xử lý
  const handleAddNote = async () => {
    if (!newNote.trim() || isSubmittingNote) return;

    try {
      setIsSubmittingNote(true);

      const response = await UserService.addUserNote(
        Number(id),
        newNote.trim()
      );
      console.log("Note added successfully:", response);

      // Làm mới danh sách ghi chú
      await fetchUserNotes();
      setNewNote("");
    } catch (error) {
      console.error("Error adding note:", error);
      setNotesError(
        error instanceof Error ? error.message : "Không thể thêm ghi chú"
      );
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !editingNote.note.trim() || isSubmittingNote) return;

    try {
      setIsSubmittingNote(true);

      const response = await UserService.updateUserNote(
        editingNote.id,
        editingNote.note.trim()
      );
      console.log("Note updated successfully:", response);

      // Làm mới danh sách ghi chú và reset trạng thái chỉnh sửa
      await fetchUserNotes();
      setEditingNote(null);
    } catch (error) {
      console.error("Error updating note:", error);
      setNotesError(
        error instanceof Error ? error.message : "Không thể cập nhật ghi chú"
      );
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    setDeleteNoteModal({
      show: true,
      noteId: noteId,
    });
  };

  const confirmDeleteNote = async () => {
    if (!deleteNoteModal.noteId || isSubmittingNote) return;

    try {
      setIsSubmittingNote(true);

      const response = await UserService.deleteUserNote(deleteNoteModal.noteId);
      console.log("Note deleted successfully:", response);

      // Làm mới danh sách ghi chú
      await fetchUserNotes();

      // Đóng modal
      setDeleteNoteModal({ show: false, noteId: null });
    } catch (error) {
      console.error("Error deleting note:", error);
      setNotesError(
        error instanceof Error ? error.message : "Không thể xóa ghi chú"
      );
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
  };

  return (
    <AdminLayout title={`Thông tin khách hàng ${id}`}>
      {/* Content Header */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Thông tin khách hàng #{id}
              </h1>
            </div>
            <div className="mt-2 sm:mt-0">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="p-4 sm:p-6">
        <div className="container mx-auto">
          <div className="mb-6">
            {/* Action buttons */}
            <div className="mb-6 flex flex-wrap gap-2">
              <Link
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 bg-secondary border border-transparent rounded-md font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
              >
                <i className="fas fa-arrow-left mr-2"></i> Quay lại
              </Link>
              <button
                onClick={() => console.log(`Edit user ${id}`)}
                className="inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                <i className="fas fa-edit mr-2"></i> Chỉnh sửa
              </button>
              {user?.isActive ? (
                <button
                  onClick={handleToggleStatusClick}
                  className="inline-flex items-center px-4 py-2 bg-danger border border-transparent rounded-md font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                >
                  <i className="fas fa-ban mr-2"></i> Vô hiệu hóa
                </button>
              ) : (
                <button
                  onClick={handleToggleStatusClick}
                  className="inline-flex items-center px-4 py-2 bg-success border border-transparent rounded-md font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                >
                  <i className="fas fa-check-circle mr-2"></i> Kích hoạt
                </button>
              )}
            </div>

            {userLoading ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm mb-6">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Đang tải...</span>
                </div>
                <p className="mt-2">Đang tải thông tin người dùng...</p>
              </div>
            ) : userError ? (
              <div className="alert alert-danger mb-6">
                <i className="fas fa-exclamation-circle mr-2"></i> {userError}
              </div>
            ) : user ? (
              <>
                {/* User profile summary */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/4 flex flex-col items-center">
                      <h2 className="text-xl font-bold text-center">
                        {user.username || "Chưa đặt tên"}
                      </h2>
                      <p className="text-gray-600 text-center">{user.email}</p>
                      <span
                        className={`mt-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive ? "bg-green-500" : "bg-red-500"
                        } text-white`}
                      >
                        {user.isActive ? "Đang hoạt động" : "Đã bị vô hiệu hóa"}
                      </span>
                    </div>
                    <div className="md:w-3/4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-gray-500 font-medium mb-2">
                            Thông tin tài khoản
                          </h3>
                          <table className="min-w-full">
                            <tbody className="divide-y divide-gray-200">
                              <tr>
                                <td className="py-2 text-sm font-medium text-gray-500 w-1/3">
                                  ID
                                </td>
                                <td className="py-2 text-sm text-gray-900">
                                  {user.id}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2 text-sm font-medium text-gray-500">
                                  Điện thoại
                                </td>
                                <td className="py-2 text-sm text-gray-900">
                                  {user.phoneNumber || "Chưa cung cấp"}
                                </td>
                              </tr>

                              <tr>
                                <td className="py-2 text-sm font-medium text-gray-500">
                                  Ngày đăng ký
                                </td>
                                <td className="py-2 text-sm text-gray-900">
                                  {formatDateDisplay(user.createdAt)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div>
                          <h3 className="text-gray-500 font-medium mb-2">
                            Thống kê mua hàng
                          </h3>
                          <table className="min-w-full">
                            <tbody className="divide-y divide-gray-200">
                              <tr>
                                <td className="py-2 text-sm font-medium text-gray-500 w-1/2">
                                  Tổng đơn hàng
                                </td>
                                <td className="py-2 text-sm text-gray-900">
                                  {user.totalOrders || 0} đơn
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2 text-sm font-medium text-gray-500">
                                  Tổng chi tiêu
                                </td>
                                <td className="py-2 text-sm text-gray-900">
                                  {formatCurrency(user.totalSpent || 0)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="alert alert-warning mb-6">
                Không tìm thấy thông tin người dùng
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "info"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("info")}
                  >
                    Thông tin chi tiết
                  </button>
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "orders"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("orders")}
                  >
                    Lịch sử mua hàng
                  </button>
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "addresses"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("addresses")}
                  >
                    Địa chỉ
                  </button>
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "notes"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("notes")}
                  >
                    Ghi chú
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* User Info Tab */}
                {activeTab === "info" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Thông tin cá nhân
                      </h3>
                      <table className="min-w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500 w-1/3">
                              Họ tên
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {user?.username || "Chưa đặt tên"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500">
                              Email
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {user?.email}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500">
                              Điện thoại
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {user?.phoneNumber || "Chưa cung cấp"}
                            </td>
                          </tr>

                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500">
                              Ngày sinh
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {formatDateDisplay(user?.dateOfBirth || "") ||
                                "Chưa cung cấp"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Thông tin tài khoản
                      </h3>
                      <table className="min-w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500 w-1/3">
                              ID tài khoản
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {user?.id}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500">
                              Trạng thái
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  user?.isActive ? "bg-green-500" : "bg-red-500"
                                } text-white`}
                              >
                                {user?.isActive
                                  ? "Đang hoạt động"
                                  : "Đã bị vô hiệu hóa"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500">
                              Ngày đăng ký
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {formatDateDisplay(user?.createdAt || "")}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Lịch sử đơn hàng
                    </h3>
                    {/* Thêm bộ lọc */}
                    <OrderFilters />
                    {ordersLoading ? (
                      <div className="text-center py-4">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="sr-only">Đang tải...</span>
                        </div>
                        <p className="mt-2">Đang tải dữ liệu đơn hàng...</p>
                      </div>
                    ) : ordersError ? (
                      <div className="alert alert-danger">
                        <i className="fas fa-exclamation-circle mr-2"></i>{" "}
                        {ordersError}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Mã đơn hàng
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Ngày đặt
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Trạng thái
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Sản phẩm
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Tổng tiền
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {userOrders && userOrders.length > 0 ? (
                              userOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {order.id}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDateDisplay(order.createdAt)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusClass(
                                        order.status
                                      )} text-white`}
                                    >
                                      {getOrderStatusLabel(order.status)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.orderDetails?.length || 0} sản phẩm
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(order.total)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                      href={`/admin/orders/${order.id}`}
                                      className="text-indigo-600 hover:text-indigo-900"
                                    >
                                      Xem chi tiết
                                    </Link>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-6 py-4 text-center text-sm text-gray-500"
                                >
                                  {orderStatus !== "all"
                                    ? `Không có đơn hàng nào có trạng thái "${
                                        orderStatuses.find(
                                          (s) => s.value === orderStatus
                                        )?.label
                                      }"`
                                    : "Không có đơn hàng nào"}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>

                        {!ordersLoading && !ordersError && userOrders && (
                          <div className="mt-6">
                            <PaginationComponent
                              currentPage={pagination.currentPage}
                              totalPages={pagination.totalPages}
                              onPageChange={handlePageChange}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Danh sách địa chỉ
                    </h3>

                    {userLoading ? (
                      <div className="text-center py-4">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="sr-only">Đang tải...</span>
                        </div>
                        <p className="mt-2">Đang tải dữ liệu địa chỉ...</p>
                      </div>
                    ) : userError ? (
                      <div className="alert alert-danger">
                        <i className="fas fa-exclamation-circle mr-2"></i>{" "}
                        {userError}
                      </div>
                    ) : user?.addresses && user.addresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {user.addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`border rounded-lg p-4 ${
                              address.isDefault
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">
                                {address.fullName || "Địa chỉ"}
                                {address.isDefault && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    Mặc định
                                  </span>
                                )}
                              </h4>
                            </div>
                            <p className="text-gray-600 mb-1">
                              {address.streetAddress}
                            </p>
                            <p className="text-gray-600 mb-1">
                              {address.ward}, {address.district}, {address.city}
                            </p>
                            <p className="text-gray-600">
                              Điện thoại: {address.phoneNumber}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                          Người dùng chưa có địa chỉ nào
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === "notes" && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Ghi chú về khách hàng
                    </h3>

                    {/* Form thêm ghi chú */}
                    <div className="mb-6">
                      <label
                        htmlFor="newNote"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Thêm ghi chú mới
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="newNote"
                          className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                          placeholder="Nhập ghi chú về khách hàng này..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          disabled={isSubmittingNote}
                        />
                        <button
                          type="button"
                          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            !newNote.trim() || isSubmittingNote
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          }`}
                          onClick={handleAddNote}
                          disabled={!newNote.trim() || isSubmittingNote}
                        >
                          {isSubmittingNote ? "Đang lưu..." : "Lưu ghi chú"}
                        </button>
                      </div>
                    </div>

                    {/* Hiển thị danh sách ghi chú */}
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-700 mb-3">
                        Lịch sử ghi chú
                      </h4>

                      {notesLoading ? (
                        <div className="text-center py-4">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="sr-only">Đang tải...</span>
                          </div>
                          <p className="mt-2">Đang tải danh sách ghi chú...</p>
                        </div>
                      ) : notesError ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                          <i className="fas fa-exclamation-circle mr-2"></i>{" "}
                          {notesError}
                        </div>
                      ) : notes.length === 0 ? (
                        <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
                          <i className="far fa-sticky-note mr-2"></i> Chưa có
                          ghi chú nào về khách hàng này
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {notes.map((note) => (
                            <div
                              key={note.id}
                              className="bg-white border border-gray-200 rounded-md shadow-sm p-4"
                            >
                              {editingNote && editingNote.id === note.id ? (
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editingNote.note}
                                    onChange={(e) =>
                                      setEditingNote({
                                        ...editingNote,
                                        note: e.target.value,
                                      })
                                    }
                                    disabled={isSubmittingNote}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                      onClick={handleCancelEdit}
                                      disabled={isSubmittingNote}
                                    >
                                      Hủy
                                    </button>
                                    <button
                                      type="button"
                                      className={`px-3 py-1 ${
                                        !editingNote.note.trim() ||
                                        isSubmittingNote
                                          ? "bg-gray-400 cursor-not-allowed"
                                          : "bg-blue-600 hover:bg-blue-700"
                                      } text-white rounded-md`}
                                      onClick={handleUpdateNote}
                                      disabled={
                                        !editingNote.note.trim() ||
                                        isSubmittingNote
                                      }
                                    >
                                      {isSubmittingNote ? "Đang lưu..." : "Lưu"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex justify-between items-start">
                                    <p className="text-gray-800">{note.note}</p>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() =>
                                          setEditingNote({
                                            id: note.id,
                                            note: note.note,
                                          })
                                        }
                                        disabled={isSubmittingNote}
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button
                                        type="button"
                                        className="text-red-600 hover:text-red-800"
                                        onClick={() =>
                                          handleDeleteNote(note.id)
                                        }
                                        disabled={isSubmittingNote}
                                      >
                                        <i className="fas fa-trash-alt"></i>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-xs text-gray-500">
                                    <span>
                                      {formatDateDisplay(note.createdAt)}
                                    </span>
                                    {note.createdAt !== note.updatedAt && (
                                      <span>
                                        {" "}
                                        (Đã chỉnh sửa{" "}
                                        {formatDateDisplay(note.updatedAt)})
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Modal xác nhận thay đổi trạng thái */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {user?.isActive
                ? "Vô hiệu hóa tài khoản?"
                : "Kích hoạt tài khoản?"}
            </h3>
            <p className="mb-6">
              {user?.isActive
                ? "Bạn có chắc chắn muốn vô hiệu hóa tài khoản này? Người dùng sẽ không thể đăng nhập vào hệ thống."
                : "Bạn có chắc chắn muốn kích hoạt tài khoản này? Người dùng sẽ có thể đăng nhập và sử dụng hệ thống."}
            </p>

            {statusError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {statusError}
              </div>
            )}

            <div className="flex justify-end space-x-3 gap-1">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isStatusLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 rounded-md text-white ${
                  user?.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                disabled={isStatusLoading}
              >
                {isStatusLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm mr-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Đang xử lý...
                  </>
                ) : user?.isActive ? (
                  "Vô hiệu hóa"
                ) : (
                  "Kích hoạt"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal xác nhận xóa ghi chú */}
      {deleteNoteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Xác nhận xóa</h3>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa ghi chú này? Hành động này không thể
              hoàn tác.
            </p>

            {notesError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {notesError}
              </div>
            )}

            <div className="flex justify-end space-x-3 gap-1">
              <button
                onClick={() =>
                  setDeleteNoteModal({ show: false, noteId: null })
                }
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmittingNote}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteNote}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
                disabled={isSubmittingNote}
              >
                {isSubmittingNote ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm mr-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Đang xử lý...
                  </>
                ) : (
                  "Xóa ghi chú"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
