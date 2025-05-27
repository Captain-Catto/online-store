"use client";

import { useMemo } from "react";
import { AdminVoucher } from "@/services/VoucherService";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { formatDateDisplay } from "@/utils/dateUtils";
import { formatNumberWithCommas } from "@/utils/currencyUtils";

interface VoucherTableProps {
  vouchers: AdminVoucher[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  onPageChange: (page: number) => void;
  onEdit: (voucher: AdminVoucher) => void;
  onDelete: (id: number) => void;
}

export default function VoucherTable({
  vouchers,
  loading,
  error,
  currentPage,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
}: VoucherTableProps) {
  // ✅ Pagination info using currentPage (same pattern as UsersPage)
  const paginationInfo = useMemo(() => {
    const startIndex = (currentPage - 1) * pagination.perPage + 1;
    const endIndex = Math.min(
      currentPage * pagination.perPage,
      pagination.totalItems
    );

    return {
      startIndex,
      endIndex,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === pagination.totalPages,
      showPagination: true, // ✅ Always show pagination
    };
  }, [currentPage, pagination]);

  const hasResults = vouchers.length > 0;

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

  const formatVoucherValue = (voucher: AdminVoucher) => {
    if (voucher.type === "percentage") {
      return `${voucher.value}%`;
    } else {
      return formatNumberWithCommas(voucher.value) + " VND";
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <i className="fas fa-ticket-alt mr-2"></i>
          Danh sách voucher
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

      <div className="card-body table-responsive p-0">
        {loading ? (
          <div className="text-center p-5">
            <LoadingSpinner size="lg" text="Đang tải danh sách voucher..." />
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
                  onClick={() => window.location.reload()}
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
                <th>ID</th>
                <th>Mã voucher</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu (VNĐ)</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
                <th>Đã dùng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {hasResults ? (
                vouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td>
                      <span className="badge badge-light">#{voucher.id}</span>
                    </td>
                    <td>
                      <div className="d-block font-weight-bold">
                        {voucher.code}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          voucher.type === "percentage"
                            ? "badge-info"
                            : "badge-warning"
                        }`}
                      >
                        {voucher.type === "percentage"
                          ? "Phần trăm"
                          : "Số tiền cố định"}
                      </span>
                    </td>
                    <td>
                      <strong className="text-primary">
                        {formatVoucherValue(voucher)}
                      </strong>
                    </td>
                    <td>
                      <span className="text-black">
                        {formatNumberWithCommas(voucher.minOrderValue)}
                      </span>
                    </td>
                    <td>
                      <small
                        className="text-muted"
                        title={voucher.expirationDate}
                      >
                        {formatDateDisplay(voucher.expirationDate)}
                      </small>
                    </td>
                    <td>{renderStatusBadge(voucher.status)}</td>
                    <td>
                      <div className="text-center">
                        <span className="badge badge-outline-info">
                          {voucher.usageLimit > 0
                            ? `${voucher.usageCount}/${voucher.usageLimit}`
                            : voucher.usageCount}
                        </span>
                        {voucher.usageLimit > 0 && (
                          <div
                            className="progress mt-1"
                            style={{ height: "4px" }}
                          >
                            <div
                              className="progress-bar bg-info"
                              style={{
                                width: `${
                                  (voucher.usageCount / voucher.usageLimit) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => onEdit(voucher)}
                          title="Chỉnh sửa voucher"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => onDelete(voucher.id)}
                          title="Xóa voucher"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-5">
                    <div className="empty-state">
                      <i className="fas fa-ticket-alt fa-4x text-muted mb-3"></i>
                      <h5 className="text-muted">Không tìm thấy voucher</h5>
                      <p className="text-muted mb-3">
                        Vui lòng thêm voucher mới hoặc thay đổi từ khóa tìm kiếm
                      </p>
                      {/* ✅ Removed refresh button - same as UsersPage pattern */}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ Always show pagination when not loading - even if no results */}
      {!loading && (
        <div className="card-footer clearfix">
          <div className="float-left">
            <div className="dataTables_info">
              <i className="fas fa-info-circle mr-1"></i>
              Hiển thị{" "}
              <strong>
                {pagination.totalItems > 0
                  ? `${paginationInfo.startIndex} - ${paginationInfo.endIndex}`
                  : "0"}
              </strong>{" "}
              của <strong>{pagination.totalItems}</strong> voucher
              <span className="text-muted ml-2">
                (Trang {currentPage} / {pagination.totalPages})
              </span>
            </div>
          </div>

          {/* ✅ Always show pagination - even if no results */}
          <ul className="pagination pagination-sm m-0 float-right">
            {/* Previous Button */}
            <li
              className={`page-item ${
                paginationInfo.isFirstPage ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={paginationInfo.isFirstPage}
                title="Trang trước"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            </li>

            {/* Page Numbers */}
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
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              }
            )}

            {/* Next Button */}
            <li
              className={`page-item ${
                paginationInfo.isLastPage ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage + 1)}
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
  );
}
