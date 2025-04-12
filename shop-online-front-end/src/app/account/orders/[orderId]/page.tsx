"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { OrderService } from "@/services/OrderService";
import Image from "next/image";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  // State cho modal hủy đơn hàng
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelNote, setCancelNote] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Thêm state cho việc quản lý lý do hủy đơn
  const [selectedCancelReason, setSelectedCancelReason] = useState<string>("");
  const commonCancelReasons = [
    "Tôi muốn thay đổi địa chỉ giao hàng",
    "Tôi muốn thay đổi phương thức thanh toán",
    "Tôi đặt nhầm sản phẩm",
    "Tôi đặt nhầm kích thước/màu sắc",
    "Tôi tìm thấy sản phẩm tương tự với giá tốt hơn",
    "Thời gian giao hàng quá lâu",
    "Tôi không còn nhu cầu mua sản phẩm này nữa",
    "Tôi đang gặp vấn đề tài chính",
    "Khác (vui lòng nêu rõ)",
  ];

  interface Order {
    id: number;
    userId: number;
    total: number;
    subtotal: number;
    voucherDiscount: number;
    status: string;
    paymentMethodId: number;
    paymentStatusId: number;
    shippingAddress: string;
    phoneNumber: string;
    cancelNote: string | null;
    refundAmount: number | null;
    refundReason: string | null;
    createdAt: string;
    updatedAt: string;
    orderDetails: Array<{
      id: number;
      orderId: number;
      productId: number;
      productDetailId: number;
      quantity: number;
      color: string;
      size: string;
      originalPrice: number;
      discountPrice: number;
      discountPercent: number;
      voucherId: number | null;
      imageUrl: string;
      createdAt: string;
      updatedAt: string;
      product: {
        id: number;
        name: string;
      };
    }>;
  }

  useEffect(() => {
    // Kiểm tra authenication
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/login?returnUrl=/account/orders/" + orderId);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await OrderService.getOrderById(Number(orderId));
        setOrder(orderData);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải thông tin đơn hàng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router, cancelSuccess]);

  // Hàm xử lý hủy đơn hàng
  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra validation như cũ
    if (!selectedCancelReason) {
      setCancelError("Vui lòng chọn lý do hủy đơn hàng");
      return;
    }

    if (
      selectedCancelReason === "Khác (vui lòng nêu rõ)" &&
      !cancelNote.trim()
    ) {
      setCancelError("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    if (!order) return;

    setCancelLoading(true);
    setCancelError(null);

    try {
      // Lấy token từ sessionStorage
      const token = sessionStorage.getItem("authToken");
      // Quyết định nội dung ghi chú hủy đơn
      const finalCancelNote =
        selectedCancelReason === "Khác (vui lòng nêu rõ)"
          ? cancelNote
          : selectedCancelReason;
      console.log("final cancel note", finalCancelNote);
      // Gọi API hủy đơn hàng
      const response = await fetch(
        `http://localhost:3000/api/orders/${order.id}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cancelNote: finalCancelNote }),
        }
      );

      if (!response.ok) {
        // PHẦN ĐƯỢC SỬA: Kiểm tra content-type trước khi parse JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          // Nếu là JSON, parse bình thường
          const errorData = await response.json();
          throw new Error(errorData.message || "Không thể hủy đơn hàng");
        } else {
          // Nếu không phải JSON, sử dụng status text hoặc status code
          throw new Error(
            `Không thể hủy đơn hàng (${response.status}: ${
              response.statusText || "Lỗi server"
            })`
          );
        }
      }

      // Nếu thành công, đóng modal và hiển thị thông báo
      setCancelSuccess(true);
      setShowCancelModal(false);

      // Refresh lại dữ liệu đơn hàng sau khi hủy
      const updatedOrder = await OrderService.getOrderById(Number(orderId));
      setOrder(updatedOrder);
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      setCancelError(
        error instanceof Error ? error.message : "Không thể hủy đơn hàng"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  // Hàm chuyển đổi trạng thái đơn hàng
  const mapOrderStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Chờ xác nhận",
      processing: "Đang xử lý",
      shipping: "Đang vận chuyển",
      delivered: "Đã giao hàng",
      canceled: "Đã hủy",
      refunded: "Đã hoàn tiền",
    };
    return statusMap[status] || status;
  };

  // Kiểm tra xem có cho phép hủy đơn hàng không
  const canCancelOrder = (status: string) => {
    return status === "pending" || status === "processing";
  };

  // Hàm chuyển đổi trạng thái thanh toán
  const mapPaymentStatus = (statusId: number) => {
    const statusMap: Record<number, string> = {
      1: "Chờ thanh toán",
      2: "Đã thanh toán",
      3: "Thanh toán thất bại",
      4: "Đã hoàn tiền",
    };
    return statusMap[statusId] || "Không xác định";
  };

  // Hàm chuyển đổi phương thức thanh toán
  const mapPaymentMethod = (methodId: number) => {
    const methodMap: Record<number, string> = {
      1: "Thanh toán khi nhận hàng (COD)",
      2: "Chuyển khoản ngân hàng",
      3: "Thẻ tín dụng/Thẻ ghi nợ",
      4: "Ví điện tử",
    };
    return methodMap[methodId] || "Không xác định";
  };

  // Định dạng ngày giờ
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 min-h-screen">
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 min-h-screen">
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-red-600">
              {error || "Không tìm thấy thông tin đơn hàng"}
            </p>
            <Link
              href="/account?tab=orders"
              className="mt-4 inline-block px-4 py-2 bg-black text-white rounded"
            >
              Quay lại trang tài khoản
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/account" className="text-gray-600 hover:text-black">
            Tài khoản
          </Link>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <Link
            href="/account?tab=orders"
            className="text-gray-600 hover:text-black"
          >
            Đơn hàng của tôi
          </Link>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-900">Chi tiết đơn hàng #{order.id}</span>
        </div>

        {cancelSuccess && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
            Đơn hàng đã được hủy thành công. Chúng tôi sẽ xử lý yêu cầu của bạn
            trong thời gian sớm nhất.
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng #{order.id}</h1>
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full
            ${
              order.status === "delivered"
                ? "bg-green-100 text-green-800"
                : order.status === "shipping"
                ? "bg-blue-100 text-blue-800"
                : order.status === "canceled"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {mapOrderStatus(order.status)}
          </span>
        </div>

        {/* Thông tin đơn hàng */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-600 uppercase text-xs tracking-wider mb-2">
                Thông tin chung
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Ngày đặt hàng:</span>{" "}
                  {formatDateTime(order.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Phương thức thanh toán:</span>{" "}
                  {mapPaymentMethod(order.paymentMethodId)}
                </p>
                <p>
                  <span className="font-medium">Trạng thái thanh toán:</span>{" "}
                  {mapPaymentStatus(order.paymentStatusId)}
                </p>
                {order.cancelNote && (
                  <p>
                    <span className="font-medium">Lý do hủy:</span>{" "}
                    {order.cancelNote}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-gray-600 uppercase text-xs tracking-wider mb-2">
                Thông tin giao hàng
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Địa chỉ giao hàng:</span>{" "}
                  {order.shippingAddress}
                </p>
                <p>
                  <span className="font-medium">Số điện thoại:</span>{" "}
                  {order.phoneNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chi tiết sản phẩm */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <h3 className="p-6 border-b border-gray-200 font-medium">
            Chi tiết sản phẩm
          </h3>
          <div className="divide-y divide-gray-200">
            {order.orderDetails.map((item) => (
              <div key={item.id} className="p-6 flex items-center">
                <div className="flex-shrink-0 w-20 h-20 relative">
                  <Image
                    src={item.imageUrl}
                    alt={item.product.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <div className="ml-6 flex-1">
                  <Link
                    href={`/products/${item.productId}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {item.product.name}
                  </Link>
                  <div className="mt-1 text-sm text-gray-500">
                    <p>Màu sắc: {item.color}</p>
                    <p>Kích thước: {item.size}</p>
                    <p>Số lượng: {item.quantity}</p>
                  </div>
                </div>
                <div className="ml-6 text-right">
                  <p className="text-lg font-medium">
                    {item.discountPrice.toLocaleString("vi-VN")}đ
                  </p>
                  {item.discountPercent > 0 && (
                    <p className="text-sm text-gray-500 line-through">
                      {item.originalPrice.toLocaleString("vi-VN")}đ
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính:</span>
              <span>{order.subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            {order.voucherDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Giảm giá:</span>
                <span>-{order.voucherDiscount.toLocaleString("vi-VN")}đ</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Tổng cộng:</span>
              <span>{order.total.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between items-center">
          <Link
            href="/account?tab=orders"
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Quay lại
          </Link>

          {/* Hiển thị theo điều kiện: nút hủy đơn hoặc nút liên hệ CSKH */}
          {canCancelOrder(order.status) ? (
            <button
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              onClick={() => setShowCancelModal(true)}
            >
              Hủy đơn hàng
            </button>
          ) : (
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">
                Đơn hàng đã qua bước xác nhận. Vui lòng liên hệ CSKH để hủy đơn
                hoặc được hỗ trợ thêm.
              </p>
              <a
                href="https://m.me/yourstorefanpage"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
              >
                Liên hệ hỗ trợ
              </a>
            </div>
          )}
        </div>

        {/* Modal hủy đơn hàng */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                Hủy đơn hàng #{order.id}
              </h3>

              <form onSubmit={handleCancelOrder}>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">
                    Lý do hủy đơn hàng <span className="text-red-500">*</span>
                  </label>

                  <div className="space-y-2">
                    {commonCancelReasons.map((reason) => (
                      <div key={reason} className="flex items-center">
                        <input
                          type="radio"
                          id={`reason-${reason}`}
                          name="cancelReason"
                          value={reason}
                          checked={selectedCancelReason === reason}
                          onChange={(e) => {
                            setSelectedCancelReason(e.target.value);
                            setCancelError(null);
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`reason-${reason}`} className="text-sm">
                          {reason}
                        </label>
                      </div>
                    ))}
                  </div>

                  {selectedCancelReason === "Khác (vui lòng nêu rõ)" && (
                    <div className="mt-3">
                      <textarea
                        id="cancelNote"
                        value={cancelNote}
                        onChange={(e) => setCancelNote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này..."
                      ></textarea>
                    </div>
                  )}

                  {cancelError && (
                    <p className="text-red-500 text-sm mt-1">{cancelError}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelModal(false);
                      setSelectedCancelReason("");
                      setCancelNote("");
                      setCancelError(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={cancelLoading}
                  >
                    Đóng
                  </button>

                  <button
                    type="submit"
                    disabled={cancelLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
                  >
                    {cancelLoading ? (
                      <span className="flex items-center">
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
                      </span>
                    ) : (
                      "Xác nhận hủy"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
