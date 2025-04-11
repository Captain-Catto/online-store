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
        setError(error?.message || "Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router]);

  // Hàm chuyển đổi trạng thái đơn hàng
  const mapOrderStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      processing: "Đang xử lý",
      shipping: "Đang vận chuyển",
      delivered: "Đã giao hàng",
      canceled: "Đã hủy",
      refunded: "Đã hoàn tiền",
    };
    return statusMap[status] || status;
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
        <div className="mt-6 flex justify-between">
          <Link
            href="/account?tab=orders"
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Quay lại
          </Link>
          {order.status === "processing" && (
            <button
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              onClick={() => {
                alert("Tính năng hủy đơn hàng đang được phát triển");
              }}
            >
              Hủy đơn hàng
            </button>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
