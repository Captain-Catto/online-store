import React, { useRef } from "react";
import { debounce } from "lodash";

interface OrderFiltersProps {
  orderStatus: string;
  setOrderStatus: (value: string) => void;
  orderIdInputValue: string;
  setOrderIdInputValue: (value: string) => void;
  startDateFilter: string;
  setStartDateFilter: (value: string) => void;
  endDateFilter: string;
  setEndDateFilter: (value: string) => void;
  handleClearFilters: () => void;
  orderStatuses: { value: string; label: string }[];
  applyFilters: (changes: {
    status?: string;
    orderId?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
}

const OrderFilters = ({
  orderStatus,
  setOrderStatus,
  orderIdInputValue,
  setOrderIdInputValue,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  handleClearFilters,
  orderStatuses,
  applyFilters,
}: OrderFiltersProps) => {
  // Debounce cho input mã đơn hàng
  const debouncedApplyFilters = useRef(
    debounce((value: string) => {
      applyFilters({ orderId: value });
    }, 500)
  ).current;

  const handleOrderIdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOrderIdInputValue(value);
    debouncedApplyFilters(value);
  };

  return (
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
          {/* Mã đơn hàng - tương tự như ô tìm kiếm trong Users */}
          <div className="col-md-4">
            <div className="form-group">
              <label>Mã đơn hàng</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập mã đơn hàng..."
                  value={orderIdInputValue}
                  onChange={handleOrderIdInputChange}
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={() => applyFilters({ orderId: orderIdInputValue })}
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Trạng thái đơn hàng */}
          <div className="col-md-3">
            <div className="form-group">
              <label>Trạng thái</label>
              <select
                className="form-control"
                value={orderStatus}
                onChange={(e) => {
                  setOrderStatus(e.target.value);
                  applyFilters({ status: e.target.value });
                }}
              >
                {orderStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Từ ngày */}
          <div className="col-md-2">
            <div className="form-group">
              <label>Từ ngày</label>
              <input
                type="date"
                className="form-control"
                value={startDateFilter}
                onChange={(e) => {
                  setStartDateFilter(e.target.value);
                  applyFilters({ startDate: e.target.value });
                }}
              />
            </div>
          </div>

          {/* Đến ngày */}
          <div className="col-md-2">
            <div className="form-group">
              <label>Đến ngày</label>
              <input
                type="date"
                className="form-control"
                value={endDateFilter}
                onChange={(e) => {
                  setEndDateFilter(e.target.value);
                  applyFilters({ endDate: e.target.value });
                }}
              />
            </div>
          </div>

          {/* Nút xóa bộ lọc */}
          <div className="col-md-1">
            <div className="form-group">
              <label>&nbsp;</label>
              {(orderStatus !== "all" ||
                orderIdInputValue ||
                startDateFilter ||
                endDateFilter) && (
                <button
                  onClick={handleClearFilters}
                  className="btn btn-default btn-block"
                  title="Xóa bộ lọc"
                >
                  <i className="fas fa-times"></i> Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
