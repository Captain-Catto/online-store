"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import {
  AdminVoucher,
  CreateVoucherData,
  VoucherService,
} from "@/services/VoucherService";
import { useToast } from "@/utils/useToast";
import { AuthService } from "@/services/AuthService";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { formatDateDisplay } from "@/utils/dateUtils";
import { formatNumberWithCommas } from "@/utils/currencyUtils";

export default function VoucherManagementPage() {
  const router = useRouter();
  const { showToast, Toast } = useToast();
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [formattedSearchQuery, setFormattedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  });

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingVoucher, setEditingVoucher] = useState<AdminVoucher | null>(
    null
  );
  const [formData, setFormData] = useState<CreateVoucherData>({
    code: "",
    type: "percentage",
    value: 0,
    minOrderValue: 0,
    expirationDate: new Date().toISOString().split("T")[0],
    status: "active",
    usageLimit: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingVoucherId, setDeletingVoucherId] = useState<number | null>(
    null
  );

  // Hàm tìm kiếm/lọc vouchers
  const fetchVouchers = useCallback(
    async (resetPage = false, searchOverride?: string) => {
      try {
        setLoading(true);

        // Reset về trang 1 nếu đang lọc
        const page = resetPage ? 1 : currentPage;
        if (resetPage) {
          setCurrentPage(1);
        }

        // Xây dựng bộ lọc
        const filters: { status: string; type: string; search?: string } = {
          status: statusFilter,
          type: typeFilter,
        };

        // Sử dụng searchOverride nếu được cung cấp, nếu không thì dùng searchQuery
        const searchValue =
          searchOverride !== undefined ? searchOverride : searchQuery;

        // Nếu searchValue có giá trị, thêm vào filter
        if (searchValue.trim()) {
          filters.search = searchValue.trim();
          console.log("Đã gửi search value:", searchValue.trim());
        }

        const response = await VoucherService.getVouchersWithPagination(
          page,
          itemsPerPage,
          filters
        );

        setVouchers(response.vouchers);
        setPagination(response.pagination);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thể tải danh sách voucher"
        );
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage, statusFilter, typeFilter, searchQuery]
  );

  // Tạo hàm debounced search sử dụng lodash
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      console.log("Đã gọi debounced search với:", searchValue);
      fetchVouchers(true, searchValue);
    }, 500),
    [fetchVouchers]
  );

  // Fetch vouchers ban đầu
  useEffect(() => {
    if (!AuthService.isAdmin()) {
      router.push("/login");
      return;
    }

    fetchVouchers();
  }, [router, fetchVouchers]);

  // Theo dõi thay đổi trang và kích thước trang
  useEffect(() => {}, [currentPage, itemsPerPage, fetchVouchers]);

  // Hàm xử lý thay đổi tìm kiếm/lọc với debounce lodash
  const handleFilterChange = (
    type: "search" | "status" | "type",
    value: string
  ) => {
    if (type === "search") {
      // Xử lý trường hợp rỗng
      if (!value) {
        setSearchQuery("");
        setFormattedSearchQuery("");
        debouncedSearch("");
        return;
      }

      // Loại bỏ dấu phẩy và dấu chấm
      const cleanValue = value.replace(/[,.]/g, "");
      console.log("Input value:", value, "cleanValue:", cleanValue);
      setSearchQuery(cleanValue);

      // Kiểm tra xem giá trị có phải số hợp lệ không
      const isNumeric = /^\d*$/.test(cleanValue);
      if (isNumeric && cleanValue) {
        // lưu string nguyên bản trước khi parse
        const originalLength = cleanValue.length;

        // parse số thanh dạng có ngăn cách
        const numericValue = parseInt(cleanValue, 10);

        // Format with commas
        let formatted = formatNumberWithCommas(numericValue);

        // Add back any leading zeros that were lost
        while (formatted.replace(/[,.]/g, "").length < originalLength) {
          formatted = "0" + formatted;
        }

        setFormattedSearchQuery(formatted);
      } else {
        setFormattedSearchQuery(value);
      }

      // Gọi hàm debounce tìm kiếm với giá trị đã xử lý
      debouncedSearch(cleanValue);
    } else if (type === "status") {
      setStatusFilter(value);
      fetchVouchers(true);
    } else if (type === "type") {
      setTypeFilter(value);
      fetchVouchers(true);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setFormattedSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");

    // Hủy bất kỳ debounce tìm kiếm đang chờ
    debouncedSearch.cancel();

    // Thực hiện tìm kiếm ngay lập tức
    fetchVouchers(true);
  };

  // Change page size
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Format status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="badge bg-success">Hoạt động</span>;
      case "inactive":
        return <span className="badge bg-secondary">Không hoạt động</span>;
      case "expired":
        return <span className="badge bg-danger">Hết hạn</span>;
      default:
        return <span className="badge bg-info">{status}</span>;
    }
  };

  // Format value display
  const formatVoucherValue = (voucher: AdminVoucher) => {
    if (voucher.type === "percentage") {
      return `${voucher.value}%`;
    } else {
      return formatNumberWithCommas(voucher.value) + " VND";
    }
  };

  // Xử lý thay đổi input form
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Handle number inputs
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: value === "" ? 0 : Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = "Mã giảm giá không được để trống";
    } else if (formData.code.includes(" ")) {
      errors.code = "Mã giảm giá không được chứa khoảng trắng";
    }

    if (formData.value <= 0) {
      errors.value = "Giá trị phải lớn hơn 0";
    }

    if (formData.type === "percentage" && formData.value > 100) {
      errors.value = "Phần trăm giảm giá không thể vượt quá 100%";
    }

    if (!formData.expirationDate) {
      errors.expirationDate = "Ngày hết hạn không được để trống";
    } else {
      const expDate = new Date(formData.expirationDate);
      const today = new Date();
      if (expDate < today) {
        errors.expirationDate = "Ngày hết hạn phải lớn hơn ngày hiện tại";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (formMode === "add") {
        await VoucherService.createVoucher(formData);
        showToast("Tạo voucher thành công", { type: "success" });
      } else if (editingVoucher) {
        await VoucherService.updateVoucher(editingVoucher.id, formData);
        showToast("Cập nhật voucher thành công", { type: "success" });
      }

      // Reset form and refresh data
      setShowForm(false);
      setFormData({
        code: "",
        type: "percentage",
        value: 0,
        minOrderValue: 0,
        expirationDate: new Date().toISOString().split("T")[0],
        status: "active",
        usageLimit: 0,
      });
      fetchVouchers();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Có lỗi xảy ra", {
        type: "error",
      });
    }
  };

  // Edit voucher
  const handleEdit = (voucher: AdminVoucher) => {
    setFormMode("edit");
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      minOrderValue: voucher.minOrderValue,
      expirationDate: new Date(voucher.expirationDate)
        .toISOString()
        .split("T")[0],
      status: voucher.status,
      usageLimit: voucher.usageLimit,
    });
    setShowForm(true);
  };

  // Delete voucher
  const handleDelete = (id: number) => {
    setDeletingVoucherId(id);
    setShowDeleteModal(true);
  };

  // Confirm delete voucher
  const confirmDelete = async () => {
    if (!deletingVoucherId) return;

    try {
      await VoucherService.deleteVoucher(deletingVoucherId);
      showToast("Xóa voucher thành công", { type: "success" });
      fetchVouchers();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Không thể xóa voucher",
        { type: "error" }
      );
    } finally {
      setShowDeleteModal(false);
      setDeletingVoucherId(null);
    }
  };

  // Mở modal thêm voucher mới
  const handleOpenAddModal = () => {
    setFormMode("add");
    setEditingVoucher(null);
    setFormData({
      code: "",
      type: "percentage",
      value: 0,
      minOrderValue: 0,
      expirationDate: new Date().toISOString().split("T")[0],
      status: "active",
      usageLimit: 0,
    });
    setFormErrors({});
    setShowForm(true);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/admin" },
    { label: "Khuyến mãi", active: true },
  ];

  return (
    <AdminLayout title="Quản lý voucher">
      {/* Content Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Quản lý voucher</h1>
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
          {/* Filters - UI Cải tiến */}
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
                <div className="col-md-5">
                  <div className="form-group">
                    <label>Tìm kiếm</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Mã voucher, mô tả hoặc giá trị..."
                        value={formattedSearchQuery}
                        onChange={(e) =>
                          handleFilterChange("search", e.target.value)
                        }
                      />
                      <div className="input-group-append">
                        <span className="input-group-text">
                          <i className="fas fa-search"></i>
                        </span>
                      </div>
                    </div>
                    <small className="text-muted">
                      Nhập mã voucher, mô tả hoặc giá trị
                    </small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                      className="form-control"
                      value={statusFilter}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="expired">Hết hạn</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Loại voucher</label>
                    <select
                      className="form-control"
                      value={typeFilter}
                      onChange={(e) =>
                        handleFilterChange("type", e.target.value)
                      }
                    >
                      <option value="all">Tất cả loại</option>
                      <option value="percentage">Phần trăm</option>
                      <option value="fixed">Số tiền cố định</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-1 d-flex align-items-center mb-3">
                  <button
                    className="btn btn-default w-100"
                    onClick={handleResetFilters}
                    title="Xóa bộ lọc"
                  >
                    <i className="fas fa-sync-alt"></i>
                  </button>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-6">
                  <div className="form-group d-flex align-items-center">
                    <label className="mb-0 mr-2">Hiển thị</label>
                    <select
                      className="form-control form-control-sm mr-2"
                      style={{ width: "70px" }}
                      value={itemsPerPage}
                      onChange={handlePageSizeChange}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <label className="mb-0">mục mỗi trang</label>
                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-end">
                  <button
                    onClick={handleOpenAddModal}
                    className="btn btn-success"
                  >
                    <i className="fas fa-plus mr-1"></i> Thêm Voucher Mới
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Danh sách voucher</h3>

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
                <div className="text-center py-10">
                  <LoadingSpinner size="lg" text="Đang tải..." />
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              ) : (
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Loại</th>
                      <th>Giá trị</th>
                      <th>Đơn tối thiểu</th>
                      <th>Hết hạn</th>
                      <th>Trạng thái</th>
                      <th>Đã dùng</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          Không có voucher nào
                        </td>
                      </tr>
                    ) : (
                      vouchers.map((voucher) => (
                        <tr key={voucher.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {voucher.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {voucher.type === "percentage"
                              ? "Phần trăm"
                              : "Số tiền cố định"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatVoucherValue(voucher)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumberWithCommas(voucher.minOrderValue)} VND
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateDisplay(voucher.expirationDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(voucher.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {voucher.usageLimit > 0
                              ? `${voucher.usageCount}/${voucher.usageLimit}`
                              : voucher.usageCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-info mr-1"
                                onClick={() => handleEdit(voucher)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(voucher.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="card-footer clearfix">
              <div className="float-left d-flex align-items-center">
                <div className="dataTables_info mr-3">
                  Hiển thị{" "}
                  {vouchers.length > 0
                    ? (pagination.currentPage - 1) * pagination.perPage + 1
                    : 0}{" "}
                  đến{" "}
                  {Math.min(
                    pagination.currentPage * pagination.perPage,
                    pagination.totalItems
                  )}{" "}
                  của {pagination.totalItems} voucher
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
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                      }
                    }}
                  >
                    &laquo;
                  </a>
                </li>
                {Array.from({ length: pagination.totalPages }, (_, i) => (
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
                    currentPage === pagination.totalPages ? "disabled" : ""
                  }`}
                >
                  <a
                    className="page-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pagination.totalPages) {
                        setCurrentPage(currentPage + 1);
                      }
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {formMode === "add" ? "Thêm Voucher Mới" : "Sửa Voucher"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mã giảm giá
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  disabled={formMode === "edit"}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    formErrors.code ? "border-red-500" : ""
                  }`}
                />
                {formErrors.code && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loại voucher
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="percentage">Phần trăm</option>
                  <option value="fixed">Số tiền cố định</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giá trị {formData.type === "percentage" ? "(%)" : "(VND)"}
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  min="0"
                  max={formData.type === "percentage" ? "100" : undefined}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    formErrors.value ? "border-red-500" : ""
                  }`}
                />
                {formErrors.value && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.value}
                  </p>
                )}
              </div>

              {/* Min Order Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giá trị đơn hàng tối thiểu (VND)
                </label>
                <input
                  type="number"
                  name="minOrderValue"
                  value={formData.minOrderValue}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ngày hết hạn
                </label>
                <input
                  type="date"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    formErrors.expirationDate ? "border-red-500" : ""
                  }`}
                />
                {formErrors.expirationDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.expirationDate}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giới hạn sử dụng (0 = không giới hạn)
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {formMode === "add" ? "Thêm" : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">Xác nhận xóa</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Bạn có chắc chắn muốn xóa voucher này? Hành động này không thể
                hoàn tác.
              </p>
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Xóa voucher sẽ ảnh hưởng đến các đơn hàng đang sử dụng voucher
                  này
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
      {Toast}
    </AdminLayout>
  );
}
