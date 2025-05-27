"use client";

import { RefObject } from "react";

interface FilterSectionProps {
  searchQuery: string;
  statusFilter: string;
  typeFilter: string;
  itemsPerPage: number;
  isSearching?: boolean;
  onFilterChange: (type: "search" | "status" | "type", value: string) => void;
  onPageSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onOpenAddModal: () => void;
  onRefresh?: () => void;
  onCompositionStart?: () => void;
  onCompositionEnd?: (e: React.CompositionEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
}

export default function FilterSection({
  searchQuery,
  statusFilter,
  typeFilter,
  itemsPerPage,
  isSearching = false,
  onFilterChange,
  onPageSizeChange,
  onOpenAddModal,
  onCompositionStart,
  onCompositionEnd,
  onKeyDown,
  searchInputRef,
}: FilterSectionProps) {
  return (
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
          {/* Search Input */}
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="search-input">
                <i className="fas fa-search mr-1"></i>
                Tìm kiếm
              </label>
              <div className="input-group">
                <input
                  ref={searchInputRef} // ✅ Sử dụng ref
                  id="search-input"
                  type="text"
                  className={`form-control ${
                    isSearching ? "border-primary" : ""
                  }`} // ✅ Sử dụng isSearching
                  placeholder="Mã voucher, giá trị... (Ctrl+K, Enter, Esc)"
                  value={searchQuery}
                  onChange={(e) => onFilterChange("search", e.target.value)}
                  onCompositionStart={onCompositionStart} // ✅ IME events
                  onCompositionEnd={onCompositionEnd}
                  onKeyDown={onKeyDown}
                  autoComplete="off"
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => window.location.reload()}
                    title="Làm mới (F5)"
                  >
                    <i
                      className={`fas ${
                        isSearching ? "fa-search fa-pulse" : "fa-sync-alt"
                      }`}
                    ></i>{" "}
                    {/* ✅ Sử dụng isSearching */}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Filter */}
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
                onChange={(e) => onFilterChange("status", e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="expired">Hết hạn</option>
              </select>
            </div>
          </div>

          {/* Type Filter */}
          <div className="col-md-2">
            <div className="form-group">
              <label htmlFor="type-filter">
                <i className="fas fa-tag mr-1"></i>
                Loại
              </label>
              <select
                id="type-filter"
                className="form-control"
                value={typeFilter}
                onChange={(e) => onFilterChange("type", e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="percentage">Phần trăm</option>
                <option value="fixed">Số tiền cố định</option>
              </select>
            </div>
          </div>

          {/* Page Size */}
          <div className="col-md-2">
            <div className="form-group">
              <label htmlFor="page-size">
                <i className="fas fa-list mr-1"></i>
                Hiển thị
              </label>
              <select
                id="page-size"
                className="form-control"
                value={itemsPerPage}
                onChange={onPageSizeChange}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="col-md-2">
            <div className="form-group">
              <label>&nbsp;</label>
              <div className="d-block">
                <button
                  type="button"
                  className="btn btn-success btn-block"
                  onClick={onOpenAddModal}
                  disabled={isSearching}
                >
                  <i className="fas fa-plus mr-1"></i>
                  Thêm mới
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
