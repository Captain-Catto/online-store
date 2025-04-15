"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import Image from "next/image";
import { useParams } from "next/navigation";
import { AuthClient } from "@/services/AuthClient";
import { API_BASE_URL } from "@/config/apiConfig";
import { formatDateDisplay } from "@/utils/dateUtils";
import { Order } from "@/types/order";

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [updating, setUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Danh sách trạng thái và màu sắc tương ứng
  const availableStatuses = [
    { value: "pending", label: "Chờ xác nhận", color: "bg-gray-500" },
    { value: "processing", label: "Đang xử lý", color: "bg-yellow-500" },
    { value: "shipping", label: "Đang giao", color: "bg-blue-500" },
    { value: "delivered", label: "Đã giao", color: "bg-green-500" },
    { value: "cancelled", label: "Đã hủy", color: "bg-red-500" },
  ];

  // Fetch order data
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await AuthClient.fetchWithAuth(
          `${API_BASE_URL}/orders/${id}`
        );

        if (!response.ok) {
          throw new Error(`Error fetching order: ${response.status}`);
        }

        const data = await response.json();
        console.log("Order data:", data);
        setOrder(data);
        setOrderStatus(data.status);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message || "Không thể tải dữ liệu đơn hàng");
        } else {
          setError("Không thể tải dữ liệu đơn hàng");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Get status label
  const getStatusLabel = (status: string): string => {
    return availableStatuses.find((s) => s.value === status)?.label || status;
  };

  // Lấy thông tin màu của trạng thái
  interface Status {
    value: string;
    label: string;
    color: string;
  }

  const getCurrentStatusColor = (status: string): string => {
    return (
      availableStatuses.find((s: Status) => s.value === status)?.color ||
      "bg-gray-500"
    );
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Xử lý thay đổi trạng thái đơn hàng
  const handleUpdateStatus = async () => {
    if (order && orderStatus === order.status) {
      return; // Không có thay đổi
    }

    try {
      setUpdating(true);

      // Call API to update order status
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/orders/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: orderStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái đơn hàng");
      }

      const data = await response.json();
      console.log("Update response data:", data);

      // Update order data with the response
      if (data.order) {
        setOrder(data.order);
        // Đồng bộ orderStatus với dữ liệu mới
        setOrderStatus(data.order.status);
      }

      // Hiển thị toast thông báo thành công
      setToast({
        show: true,
        message: data.message || "Cập nhật trạng thái đơn hàng thành công",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      // Hiển thị toast lỗi
      setToast({
        show: true,
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi cập nhật trạng thái",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/admin" },
    { label: "Đơn hàng", href: "/admin/orders" },
    { label: id, active: true },
  ];

  // Thay thế hàm handleCancelOrder hiện tại
  const handleCancelOrder = () => {
    setShowCancelModal(true); // Mở modal thay vì hiển thị alert
  };

  // Thêm hàm xác nhận hủy đơn hàng
  const confirmCancelOrder = async () => {
    try {
      setUpdating(true);

      // Call API to cancel order
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/orders/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "cancelled" }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể hủy đơn hàng");
      }

      const data = await response.json();
      console.log("Cancel response data:", data);

      // Update order data directly from API response
      if (data.order) {
        setOrder(data.order);
        setOrderStatus(data.order.status);
      }

      // Hiển thị toast thành công
      setToast({
        show: true,
        message: data.message || "Đơn hàng đã được hủy thành công",
        type: "success",
      });

      // Đóng modal sau khi xử lý thành công
      setShowCancelModal(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
      // Hiển thị toast lỗi
      setToast({
        show: true,
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi hủy đơn hàng",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Đang tải...">
        <div className="content-wrapper">
          <section className="content">
            <div className="container-fluid">
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Đang tải...</span>
                </div>
                <p className="mt-3">Đang tải thông tin đơn hàng...</p>
              </div>
            </div>
          </section>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Lỗi">
        <div className="content-wrapper">
          <section className="content">
            <div className="container-fluid">
              <div className="alert alert-danger">
                <h5>
                  <i className="icon fas fa-ban"></i> Lỗi!
                </h5>
                {error}
              </div>
              <Link href="/admin/orders" className="btn btn-primary">
                <i className="fas fa-arrow-left mr-2"></i> Quay lại danh sách
                đơn hàng
              </Link>
            </div>
          </section>
        </div>
      </AdminLayout>
    );
  }

  if (!order) return null;

  const CancelOrderModal = () => {
    if (!showCancelModal) return null;

    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            onClick={() => !updating && setShowCancelModal(false)}
          ></div>

          {/* Modal */}
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex flex-col sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-red-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title"
                  >
                    Xác nhận hủy đơn hàng
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này
                      không thể hoàn tác. Số sản phẩm trong đơn hàng sẽ được
                      hoàn lại vô kho.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse flex gap-2">
              <button
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${
                  updating ? "opacity-75 cursor-not-allowed" : ""
                }`}
                onClick={confirmCancelOrder}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận hủy"
                )}
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowCancelModal(false)}
                disabled={updating}
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Toast = () => {
    useEffect(() => {
      if (!toast.show) return;

      const timer = setTimeout(() => {
        setToast((prevToast) => ({ ...prevToast, show: false }));
      }, 3000);

      return () => clearTimeout(timer);
    }, [toast.show]);

    // Điều kiện render sau khi đã khai báo tất cả hooks
    if (!toast.show) return null;

    const bgColor =
      toast.type === "success"
        ? "bg-green-500"
        : toast.type === "error"
        ? "bg-red-500"
        : "bg-blue-500";

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center`}
        >
          {toast.type === "success" && (
            <i className="fas fa-check-circle mr-2"></i>
          )}
          {toast.type === "error" && (
            <i className="fas fa-exclamation-circle mr-2"></i>
          )}
          <span>{toast.message}</span>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout title={`Chi tiết đơn hàng ${id}`}>
      {/* Content Header */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Chi tiết đơn hàng {id}
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
                href="/admin/orders"
                className="inline-flex items-center px-4 py-2 bg-secondary border border-transparent rounded-md font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
              >
                <i className="fas fa-arrow-left mr-2"></i> Quay lại
              </Link>
              <button
                className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                onClick={() => window.print()}
              >
                <i className="fas fa-print mr-2"></i> In hóa đơn
              </button>
            </div>

            {/* Order summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700">
                    Thông tin đơn hàng
                  </h3>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Mã đơn hàng
                        </th>
                        <td className="py-2 text-gray-800">{order.id}</td>
                      </tr>
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Ngày đặt hàng
                        </th>
                        <td className="py-2 text-gray-800">
                          {formatDateDisplay(order.createdAt)}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Phương thức thanh toán
                        </th>
                        <td className="py-2 text-gray-800">
                          {order.paymentMethodId === 1
                            ? "Tiền mặt khi nhận hàng (COD)"
                            : "Chuyển khoản ngân hàng"}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Trạng thái thanh toán
                        </th>
                        <td className="py-2 text-gray-800">
                          {order.paymentStatusId === 1
                            ? "Chưa thanh toán"
                            : "Đã thanh toán"}
                        </td>
                      </tr>
                      {/* <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Ghi chú
                        </th>
                        <td className="py-2 text-gray-800">
                          {order.note || "Không có"}
                        </td>
                      </tr> */}
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Trạng thái đơn hàng
                        </th>
                        <td className="py-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full text-white ${getCurrentStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700">
                    Thông tin khách hàng
                  </h3>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Tên khách hàng
                        </th>
                        <td className="py-2 text-gray-800">
                          {order.user?.name || "Khách hàng"}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Số điện thoại
                        </th>
                        <td className="py-2 text-gray-800">
                          {order.phoneNumber}
                        </td>
                      </tr>

                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Địa chỉ giao hàng
                        </th>
                        <td className="py-2 text-gray-800">
                          {order.shippingAddress}
                        </td>
                      </tr>

                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Xem chi tiết thông tin khách hàng
                        </th>
                        <td className="py-2 text-gray-800">
                          <Link
                            href={`/admin/users/${order.userId}`}
                            className="text-blue-500 hover:underline"
                          >
                            Xem chi tiết
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Order items */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-700">
                  Danh sách sản phẩm
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã SKU
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.orderDetails?.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                              <Image
                                src={item.imageUrl}
                                alt={item.product?.name || "Sản phẩm"}
                                fill
                                sizes="48px"
                                className="rounded object-cover"
                              />
                            </div>
                            <span className="text-sm text-gray-800">
                              {item.product?.name}
                              <br />
                              <span className="text-xs text-gray-500">
                                {item.color}, {item.size}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {item.product?.sku || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatCurrency(item.discountPrice)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                          {formatCurrency(item.discountPrice * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <th
                        colSpan={4}
                        className="py-3 px-4 text-right text-sm font-medium text-gray-500"
                      >
                        Tổng tiền sản phẩm:
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(order.subtotal)}
                      </th>
                    </tr>
                    <tr>
                      <th
                        colSpan={4}
                        className="py-3 px-4 text-right text-sm font-medium text-gray-500"
                      >
                        Phí vận chuyển:
                      </th>
                      <td className="py-3 px-4 text-right text-sm text-gray-900">
                        {formatCurrency(order.shippingFee ?? 0)}
                      </td>
                    </tr>
                    <tr>
                      <th
                        colSpan={4}
                        className="py-3 px-4 text-right text-sm font-medium text-gray-500"
                      >
                        Giảm giá:
                      </th>
                      <td className="py-3 px-4 text-right text-sm text-gray-900">
                        {formatCurrency(order.voucherDiscount)}
                      </td>
                    </tr>
                    <tr>
                      <th
                        colSpan={4}
                        className="py-3 px-4 text-right text-base font-semibold text-gray-700"
                      >
                        Tổng thanh toán:
                      </th>
                      <th className="py-3 px-4 text-right text-base font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Update order status */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-700">
                  Cập nhật trạng thái đơn hàng
                </h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                    >
                      {availableStatuses
                        .filter((status) => status.value !== "cancelled")
                        .map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${
                        updating ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                      onClick={handleUpdateStatus}
                      disabled={updating || orderStatus === order.status}
                    >
                      {updating ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Đang cập nhật...
                        </>
                      ) : (
                        "Cập nhật trạng thái"
                      )}
                    </button>

                    {/* Nút hủy đơn hàng - chỉ hiển thị khi đơn không ở trạng thái cancelled hoặc delivered */}
                    {order.status !== "cancelled" &&
                      order.status !== "delivered" && (
                        <button
                          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition ${
                            updating ? "opacity-75 cursor-not-allowed" : ""
                          }`}
                          onClick={handleCancelOrder}
                          disabled={updating}
                        >
                          {updating ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-ban mr-2"></i>
                              Hủy đơn hàng
                            </>
                          )}
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CancelOrderModal />
      {/* Toast Notification */}
      <Toast />
    </AdminLayout>
  );
}
