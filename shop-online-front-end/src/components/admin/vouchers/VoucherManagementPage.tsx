"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AdminVoucher,
  CreateVoucherData,
  VoucherService,
} from "@/services/VoucherService";
import { useToast } from "@/utils/useToast";
import { AuthService } from "@/services/AuthService";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { formatNumberWithCommas, parseCurrency } from "@/utils/currencyUtils";
import FilterSection from "./FilterSection";
import VoucherTable from "./VoucherTable";
import VoucherFormModal from "./VoucherFormModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import debounce from "lodash/debounce";

interface FocusOptions {
  preserve?: boolean;
  selectAll?: boolean;
}

export default function VoucherManagementPage() {
  const router = useRouter();
  const { showToast, Toast } = useToast();

  // ===== STATES =====
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isComposing, setIsComposing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // ===== PAGINATION STATE =====
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  });

  // ===== FORM STATES =====
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
      type: string,
      page = 1,
      focusOptions?: FocusOptions
    ) => {
      try {
        setLoading(true);
        setIsSearching(true);
        setCurrentPage(page);

        const filters: { status: string; type: string; search?: string } = {
          status,
          type,
        };

        if (searchTerm.trim()) {
          filters.search = searchTerm.trim();
        }

        const response = await VoucherService.getVouchersWithPagination(
          page,
          itemsPerPage,
          filters
        );

        setVouchers(response.vouchers || []);
        setPagination(
          response.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            perPage: itemsPerPage,
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
            : "Không thể tìm kiếm voucher. Vui lòng thử lại."
        );
        setVouchers([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          perPage: itemsPerPage,
        });
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [itemsPerPage, focusInput]
  );

  // ===== DEBOUNCED SEARCH =====
  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string, status: string, type: string) => {
        performSearch(searchTerm, status, type, 1, { preserve: true });
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
          performSearch("", statusFilter, typeFilter, 1, { preserve: true });
        } else if (value.trim().length > 0) {
          debouncedSearch(value, statusFilter, typeFilter);
        }
      }, 100);
    },
    [debouncedSearch, performSearch, statusFilter, typeFilter]
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

  // ✅ Refresh thay cho Clear Filters - Reset tất cả về mặc định
  const handleRefresh = useCallback(() => {
    // Clear all states
    setSearchValue("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    debouncedSearch.cancel();

    // Reload with default values - no focus preserve
    performSearch("", "all", "all", 1, { preserve: false });
  }, [debouncedSearch, performSearch]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Ctrl/Cmd + K to focus and select all
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        focusInput({ selectAll: true });
      }

      // ✅ Escape to refresh (clear all filters)
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
          performSearch(value, statusFilter, typeFilter, 1, { preserve: true });
        } else {
          performSearch("", statusFilter, typeFilter, 1, { preserve: true });
        }
      }
    },
    [
      focusInput,
      handleRefresh,
      debouncedSearch,
      performSearch,
      statusFilter,
      typeFilter,
    ]
  );

  // Filter change handler - Unified cho FilterSection
  const handleFilterChange = useCallback(
    (type: "search" | "status" | "type", value: string) => {
      switch (type) {
        case "search":
          handleSearchChange({
            target: { value },
          } as React.ChangeEvent<HTMLInputElement>);
          break;
        case "status":
          setStatusFilter(value);
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
          }
          debouncedSearch.cancel();
          performSearch(searchValue, value, typeFilter, 1);
          break;
        case "type":
          setTypeFilter(value);
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
          }
          debouncedSearch.cancel();
          performSearch(searchValue, statusFilter, value, 1);
          break;
      }
    },
    [
      handleSearchChange,
      debouncedSearch,
      performSearch,
      searchValue,
      statusFilter,
      typeFilter,
    ]
  );

  // Page size change
  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSize = Number(e.target.value);
      setItemsPerPage(newSize);
      setCurrentPage(1);
      performSearch(searchValue, statusFilter, typeFilter, 1);
    },
    [performSearch, searchValue, statusFilter, typeFilter]
  );

  // Pagination
  const handlePageChange = useCallback(
    (newPage: number) => {
      performSearch(searchValue, statusFilter, typeFilter, newPage);
    },
    [performSearch, searchValue, statusFilter, typeFilter]
  );

  // ===== EFFECTS =====

  // Initial load
  useEffect(() => {
    // Check admin permission
    if (!AuthService.isAdmin()) {
      router.push("/login");
      return;
    }

    performSearch("", "all", "all", 1);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();
    };
  }, [router, performSearch, debouncedSearch]);

  // ===== FORM HANDLERS =====

  // Validate form
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = "Mã giảm giá không được để trống";
    } else if (formData.code.includes(" ")) {
      errors.code = "Mã giảm giá không được chứa khoảng trắng";
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

    if (formData.type === "fixed" && formData.value <= 0) {
      errors.value = "Giá trị voucher phải lớn hơn 0";
    }

    if (formData.minOrderValue < 0) {
      errors.minOrderValue = "Giá trị đơn hàng tối thiểu không được âm";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Submit form
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      try {
        // Parse currency values trước khi submit
        const processedFormData = {
          ...formData,
          value:
            typeof formData.value === "string"
              ? parseCurrency(formData.value)
              : formData.value,
          minOrderValue:
            typeof formData.minOrderValue === "string"
              ? parseCurrency(formData.minOrderValue)
              : formData.minOrderValue,
        };

        if (formMode === "add") {
          await VoucherService.createVoucher(processedFormData);
          showToast("Tạo voucher thành công", { type: "success" });
        } else if (editingVoucher) {
          await VoucherService.updateVoucher(
            editingVoucher.id,
            processedFormData
          );
          showToast("Cập nhật voucher thành công", { type: "success" });
        }

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
        performSearch(searchValue, statusFilter, typeFilter, currentPage);
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Có lỗi xảy ra", {
          type: "error",
        });
      }
    },
    [
      validateForm,
      formMode,
      formData,
      editingVoucher,
      showToast,
      performSearch,
      searchValue,
      statusFilter,
      typeFilter,
      currentPage,
    ]
  );

  // Edit voucher
  const handleEdit = useCallback((voucher: AdminVoucher) => {
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
  }, []);

  // Delete voucher
  const handleDelete = useCallback((id: number) => {
    setDeletingVoucherId(id);
    setShowDeleteModal(true);
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(async () => {
    if (!deletingVoucherId) return;

    try {
      await VoucherService.deleteVoucher(deletingVoucherId);
      showToast("Xóa voucher thành công", { type: "success" });
      performSearch(searchValue, statusFilter, typeFilter, currentPage);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Không thể xóa voucher",
        { type: "error" }
      );
    } finally {
      setShowDeleteModal(false);
      setDeletingVoucherId(null);
    }
  }, [
    deletingVoucherId,
    showToast,
    performSearch,
    searchValue,
    statusFilter,
    typeFilter,
    currentPage,
  ]);

  // Open add modal
  const handleOpenAddModal = useCallback(() => {
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
  }, []);

  // ===== COMPUTED VALUES =====

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", href: "/admin" },
      { label: "Quản lý voucher", active: true },
    ],
    []
  );

  // Format vouchers với currency formatting
  const formattedVouchers = useMemo(
    () =>
      vouchers.map((voucher) => ({
        ...voucher,
        formattedValue:
          voucher.type === "percentage"
            ? `${voucher.value}%`
            : `${formatNumberWithCommas(voucher.value)} VNĐ`,
        formattedMinOrderValue: formatNumberWithCommas(voucher.minOrderValue),
      })),
    [vouchers]
  );
  // ===== RENDER =====
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
          {/* Filter Section */}
          <FilterSection
            searchQuery={searchValue}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            itemsPerPage={itemsPerPage}
            isSearching={isSearching}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh} // ✅ Pass refresh instead of clear filters
            onPageSizeChange={handlePageSizeChange}
            onOpenAddModal={handleOpenAddModal}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={handleKeyDown}
            searchInputRef={searchInputRef}
          />

          {/* Voucher Table */}
          <VoucherTable
            vouchers={formattedVouchers}
            loading={loading}
            error={error}
            currentPage={currentPage}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </section>

      {/* Modals */}
      <VoucherFormModal
        show={showForm}
        formMode={formMode}
        formData={formData}
        formErrors={formErrors}
        onClose={() => setShowForm(false)}
        onInputChange={(e) => {
          const { name, value, type } = e.target;

          // Sử dụng parseCurrency cho currency inputs
          if (name === "value" || name === "minOrderValue") {
            const numericValue =
              type === "number"
                ? value === ""
                  ? 0
                  : Number(value)
                : parseCurrency(value);

            setFormData({
              ...formData,
              [name]: numericValue,
            });
          } else {
            setFormData({
              ...formData,
              [name]:
                type === "number" ? (value === "" ? 0 : Number(value)) : value,
            });
          }
        }}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />

      {/* Toast notifications */}
      {Toast}
    </AdminLayout>
  );
}
