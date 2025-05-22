"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { AuthClient } from "@/services/AuthClient";
import { API_BASE_URL } from "@/config/apiConfig";
import { Order } from "@/types/order";
import { UserAdminApi, UserNote } from "@/types/user";
import { UserService } from "@/services/UserService";

// Import components
import UserProfileSummary from "@/components/admin/users/UserProfileSummary";
import UserInfoTab from "@/components/admin/users/UserInfoTab";
import OrdersTab from "@/components/admin/users/OrderTab";
import AddressesTab from "@/components/admin/users/AddressesTab";
import NotesTab from "@/components/admin/users/NotesTab";
import StatusToggleModal from "@/components/admin/users/modals/StatusToggleModal";
import DeleteNoteModal from "@/components/admin/users/modals/DeleteNoteModal";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

export default function UserDetailPage() {
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState("info");

  // User data state
  const [user, setUser] = useState<UserAdminApi | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // Orders data state
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 10,
  });

  // Filter state
  const [orderStatus, setOrderStatus] = useState("all");
  const [orderIdFilter, setOrderIdFilter] = useState<string>("");
  const [orderIdInputValue, setOrderIdInputValue] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");

  // Status toggle modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Notes state
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

  // Thêm ngay dưới phần khai báo state hiện có
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    username: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
  }>({
    username: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Cập nhật dữ liệu form khi user thay đổi hoặc khi bắt đầu chỉnh sửa
  useEffect(() => {
    if (user) {
      // chỉnh lại data ngày sinh về định dạng YYYY-MM-DD
      const formattedDate = user.dateOfBirth
        ? user.dateOfBirth.split("T")[0]
        : "";

      setEditForm({
        username: user.username || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: formattedDate || "",
      });
    }
  }, [user, isEditing]);

  // Hàm xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Sửa lại hàm handleSaveUser
  const handleSaveUser = async () => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      if (!user?.id) {
        throw new Error("User ID is undefined");
      }

      // UserService.updateUserByAdmin đã xử lý HTTP response và trả về data
      await UserService.updateUserByAdmin(user.id, {
        username: editForm.username,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        dateOfBirth: editForm.dateOfBirth,
      });

      // Thay vì chỉ cập nhật state từ response API,
      // chúng ta fetch lại toàn bộ dữ liệu người dùng từ server
      await fetchUserData();

      // Thoát khỏi chế độ chỉnh sửa
      setIsEditing(false);
    } catch (error) {
      setUpdateError(
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi cập nhật thông tin người dùng"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Danh sách các trạng thái đơn hàng
  const orderStatuses = [
    { value: "all", label: "Tất cả" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "processing", label: "Đang xử lý" },
    { value: "shipping", label: "Đang giao hàng" },
    { value: "delivered", label: "Đã giao" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  // Hàm lấy dữ liệu đơn hàng
  const fetchUserOrders = useCallback(
    async (
      page: number,
      status: string,
      orderId: string,
      startDate: string,
      endDate: string
    ) => {
      // Hàm helper để tạo URL với các bộ lọc
      const createFilteredUrl = (
        page: number,
        status: string,
        orderId: string,
        startDate: string,
        endDate: string
      ) => {
        let url = `${API_BASE_URL}/orders/user/${id}?page=${page}&limit=${pagination.perPage}`;

        if (status !== "all") {
          url += `&status=${status}`;
        }

        if (orderId) {
          url += `&orderId=${orderId}`;
        }

        if (startDate) {
          url += `&startDate=${startDate}`;
        }

        if (endDate) {
          url += `&endDate=${endDate}`;
        }

        return url;
      };

      try {
        setOrdersLoading(true);
        setOrdersError(null);

        const url = createFilteredUrl(
          page,
          status,
          orderId,
          startDate,
          endDate
        );

        const response = await AuthClient.fetchWithAuth(url);

        if (!response.ok) {
          throw new Error(`Error fetching orders: ${response.status}`);
        }

        const data = await response.json();
        setUserOrders(data.orders || []);
        setPagination(
          data.pagination || {
            total: 0,
            totalPages: 1,
            currentPage: 1,
            perPage: 10,
          }
        );
      } catch (error) {
        setOrdersError(
          error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu đơn hàng"
        );
      } finally {
        setOrdersLoading(false);
      }
    },
    [id, pagination.perPage]
  );

  // Hàm lấy dữ liệu người dùng
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
      setUser(userData);
    } catch (error) {
      setUserError(
        error instanceof Error
          ? error.message
          : "Không thể tải thông tin người dùng"
      );
    } finally {
      setUserLoading(false);
    }
  }, [id]);

  // Tải dữ liệu người dùng
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Tải đơn hàng khi chuyển tab hoặc thay đổi bộ lọc
  useEffect(() => {
    if (activeTab === "orders") {
      fetchUserOrders(
        currentPage,
        orderStatus,
        orderIdFilter,
        startDateFilter,
        endDateFilter
      );
    }
  }, [
    activeTab,
    currentPage,
    orderStatus,
    orderIdFilter,
    startDateFilter,
    endDateFilter,
    fetchUserOrders,
  ]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/admin" },
    { label: "Người dùng", href: "/admin/users" },
    { label: id, active: true },
  ];

  // Hàm xử lý bộ lọc
  const applyFilters = useCallback(
    (filterChanges: {
      status?: string;
      orderId?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const newStatus = filterChanges.status ?? orderStatus;
      const newOrderId = filterChanges.orderId ?? orderIdFilter;
      const newStartDate = filterChanges.startDate ?? startDateFilter;
      const newEndDate = filterChanges.endDate ?? endDateFilter;

      // Cập nhật state
      if (filterChanges.status !== undefined)
        setOrderStatus(filterChanges.status);
      if (filterChanges.orderId !== undefined)
        setOrderIdFilter(filterChanges.orderId);
      if (filterChanges.startDate !== undefined)
        setStartDateFilter(filterChanges.startDate);
      if (filterChanges.endDate !== undefined)
        setEndDateFilter(filterChanges.endDate);

      // Reset về trang đầu tiên và fetch dữ liệu mới
      setCurrentPage(1);
      fetchUserOrders(1, newStatus, newOrderId, newStartDate, newEndDate);
    },
    [
      orderStatus,
      orderIdFilter,
      startDateFilter,
      endDateFilter,
      fetchUserOrders,
    ]
  );

  // Hàm xóa bộ lọc
  const handleClearFilters = () => {
    setOrderStatus("all");
    setOrderIdFilter("");
    setOrderIdInputValue("");
    setStartDateFilter("");
    setEndDateFilter("");
    setCurrentPage(1);
    fetchUserOrders(1, "all", "", "", "");
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  // Các hàm xử lý trạng thái tài khoản
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
      setStatusError(
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi thay đổi trạng thái tài khoản"
      );
    } finally {
      setIsStatusLoading(false);
    }
  };

  // Các hàm xử lý ghi chú
  const fetchUserNotes = useCallback(async () => {
    if (!id) return;

    try {
      setNotesLoading(true);
      setNotesError(null);

      const data = await UserService.getUserNotes(Number(id));
      setNotes(data.notes || []);
    } catch (error) {
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

  const handleAddNote = async () => {
    if (!newNote.trim() || isSubmittingNote) return;

    try {
      setIsSubmittingNote(true);

      await UserService.addUserNote(Number(id), newNote.trim());

      await fetchUserNotes();
      setNewNote("");
    } catch (error) {
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

      await UserService.updateUserNote(editingNote.id, editingNote.note.trim());

      await fetchUserNotes();
      setEditingNote(null);
    } catch (error) {
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

      await UserService.deleteUserNote(deleteNoteModal.noteId);

      await fetchUserNotes();
      setDeleteNoteModal({ show: false, noteId: null });
    } catch (error) {
      setNotesError(
        error instanceof Error ? error.message : "Không thể xóa ghi chú"
      );
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <AdminLayout title={`Thông tin khách hàng ${id}`}>
      {/* Content Header */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Thông tin khách hàng
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
                onClick={() => setIsEditing(true)}
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
                <LoadingSpinner
                  size="lg"
                  text="Đang tải thông tin người dùng..."
                />
              </div>
            ) : userError ? (
              <div className="alert alert-danger mb-6">
                <i className="fas fa-exclamation-circle mr-2"></i> {userError}
              </div>
            ) : user ? (
              <UserProfileSummary user={user} />
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
                  <UserInfoTab
                    user={user}
                    isEditing={isEditing}
                    editForm={editForm}
                    isUpdating={isUpdating}
                    updateError={updateError}
                    handleInputChange={handleInputChange}
                    handleSaveUser={handleSaveUser}
                    handleCancelEdit={() => setIsEditing(false)}
                  />
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <OrdersTab
                    userOrders={userOrders}
                    ordersLoading={ordersLoading}
                    ordersError={ordersError}
                    orderStatus={orderStatus}
                    setOrderStatus={setOrderStatus}
                    orderIdInputValue={orderIdInputValue}
                    setOrderIdInputValue={setOrderIdInputValue}
                    startDateFilter={startDateFilter}
                    setStartDateFilter={setStartDateFilter}
                    endDateFilter={endDateFilter}
                    setEndDateFilter={setEndDateFilter}
                    handleClearFilters={handleClearFilters}
                    orderStatuses={orderStatuses}
                    applyFilters={applyFilters}
                    pagination={pagination}
                    handlePageChange={handlePageChange}
                  />
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                  <AddressesTab
                    user={user}
                    userLoading={userLoading}
                    userError={userError}
                    fetchUserData={fetchUserData}
                  />
                )}

                {/* Notes Tab */}
                {activeTab === "notes" && (
                  <NotesTab
                    notes={notes}
                    notesLoading={notesLoading}
                    notesError={notesError}
                    newNote={newNote}
                    setNewNote={setNewNote}
                    editingNote={editingNote}
                    setEditingNote={setEditingNote}
                    isSubmittingNote={isSubmittingNote}
                    handleAddNote={handleAddNote}
                    handleUpdateNote={handleUpdateNote}
                    handleDeleteNote={handleDeleteNote}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal xác nhận thay đổi trạng thái */}
      {showStatusModal && (
        <StatusToggleModal
          user={user}
          isStatusLoading={isStatusLoading}
          statusError={statusError}
          onConfirm={handleToggleStatus}
          onCancel={() => setShowStatusModal(false)}
        />
      )}

      {/* Modal xác nhận xóa ghi chú */}
      {deleteNoteModal.show && (
        <DeleteNoteModal
          isSubmittingNote={isSubmittingNote}
          notesError={notesError}
          onConfirm={confirmDeleteNote}
          onCancel={() => setDeleteNoteModal({ show: false, noteId: null })}
        />
      )}
    </AdminLayout>
  );
}
