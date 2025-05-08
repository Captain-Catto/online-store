import React from "react";
import Link from "next/link";
import { Order } from "@/types/order";
import { formatDateDisplay } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/currencyUtils";
import PaginationComponent from "@/components/Category/Pagination";
import OrderFilters from "./OrderFilters";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

interface OrdersTabProps {
  userOrders: Order[];
  ordersLoading: boolean;
  ordersError: string | null;
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
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
  handlePageChange: (page: number) => void;
}

const OrdersTab = ({
  userOrders,
  ordersLoading,
  ordersError,
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
  pagination,
  handlePageChange,
}: OrdersTabProps) => {
  // Helper functions
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

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3">Lịch sử đơn hàng</h3>
      <OrderFilters
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
      />

      {ordersLoading ? (
        <div className="text-center py-4">
          <LoadingSpinner size="lg" text="Đang tải đơn hàng..." />
        </div>
      ) : ordersError ? (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle mr-2"></i> {ordersError}
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
                          orderStatuses.find((s) => s.value === orderStatus)
                            ?.label
                        }"`
                      : "Không có đơn hàng nào"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {!ordersLoading &&
            !ordersError &&
            userOrders &&
            userOrders.length > 0 && (
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
  );
};

export default OrdersTab;
