// src/app/order-confirmation/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { OrderService } from "@/services/OrderService";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { colorToVietnamese } from "@/utils/colorUtils";

// Define interfaces for the order data
interface OrderDetail {
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
    sku: string;
  };
  voucher?: {
    id: number;
    code: string;
    type: string;
    value: number;
  };
}

interface OrderData {
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
  orderDetails: OrderDetail[];
}

export default function OrderConfirmationPage() {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Lấy ID đơn hàng từ sessionStorage
      const orderId = sessionStorage.getItem("recentOrderId");

      if (!orderId) {
        setError("Không tìm thấy thông tin đơn hàng");
        setLoading(false);
        return;
      }

      try {
        const order = await OrderService.getOrderById(Number(orderId));
        console.log("Order data:", order);
        setOrderData({
          ...order,
          phoneNumber: order.shippingPhoneNumber || "",
          orderDetails: (order.orderDetails || []).map((detail) => ({
            ...detail,
            product: {
              ...detail.product,
              sku: detail.product.sku || "",
            },
          })),
        });
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, []);

  // Helper function to map payment method ID to name
  const getPaymentMethodName = (methodId: number): string => {
    const methods: Record<number, string> = {
      1: "Thanh toán khi nhận hàng (COD)",
      2: "Thẻ tín dụng/Ghi nợ",
      3: "Internet Banking",
      4: "Ví MoMo",
    };
    return methods[methodId] || "Không xác định";
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8">
              <LoadingSpinner size="lg" text="Đang tải thông tin đơn hàng..." />
            </div>
          ) : error || !orderData ? (
            // Hiển thị lỗi
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                {error || "Không tìm thấy thông tin đơn hàng"}
              </h2>
              <p className="mb-6">Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.</p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/"
                  className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                >
                  Về trang chủ
                </Link>
                <Link
                  href="/account/orders"
                  className="px-6 py-2 border border-black rounded hover:bg-gray-100 transition"
                >
                  Xem đơn hàng của tôi
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Thông báo đặt hàng thành công */}
              <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-green-600 mb-2">
                  Đặt hàng thành công!
                </h2>
                {/* nếu ng dùng đăng nhập thì hiển thị */}
                {orderData.id ? (
                  <p className="text-gray-600">
                    Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
                  </p>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">
                      Cảm ơn bạn đã mua hàng.
                    </p>
                    <p className="text-gray-600 mb-4">
                      Đơn hàng của bạn sẽ được nhân viên gọi điện xác nhận để
                      giao hàng.
                    </p>
                  </>
                )}
                {/* Hiển thị mã đơn hàng */}
                <p className="text-lg font-medium">
                  Mã đơn hàng:{" "}
                  <span className="text-black">{orderData.id}</span>
                </p>
                {/* Các nút hành động */}
                <div className="flex justify-center space-x-4 mt-4">
                  <Link
                    href="/"
                    className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
                  >
                    Tiếp tục mua sắm
                  </Link>

                  {/* nếu có người dùng trả về ở response mới hiển thị xem tất cả đơn hàng*/}
                  {orderData.userId && (
                    <Link
                      href="/account/orders"
                      className="px-6 py-3 border border-black rounded hover:bg-gray-100 transition"
                    >
                      Xem tất cả đơn hàng
                    </Link>
                  )}
                </div>
              </div>

              {/* Chi tiết đơn hàng */}
              <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                  Chi tiết đơn hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Thông tin giao hàng
                    </h4>
                    <p className="mb-1 text-gray-600">
                      {orderData.shippingAddress}
                    </p>
                    <p className="mb-3 text-gray-600">
                      Số điện thoại: {orderData.phoneNumber}
                    </p>

                    <h4 className="font-medium text-gray-700 mb-2 mt-4">
                      Trạng thái đơn hàng
                    </h4>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium text-sm capitalize">
                      {orderData.status === "pending"
                        ? "Đang xử lý"
                        : orderData.status}
                    </span>

                    <h4 className="font-medium text-gray-700 mb-2 mt-4">
                      Ngày đặt hàng
                    </h4>
                    <p className="text-gray-600">
                      {formatDate(orderData.createdAt)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Phương thức thanh toán
                    </h4>
                    <p className="mb-3 text-gray-600">
                      {getPaymentMethodName(orderData.paymentMethodId)}
                    </p>

                    <h4 className="font-medium text-gray-700 mb-2 mt-4">
                      Trạng thái thanh toán
                    </h4>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium text-sm">
                      {orderData.paymentStatusId === 1
                        ? "Chưa thanh toán"
                        : "Đã thanh toán"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                  Sản phẩm đã mua
                </h3>
                <div className="divide-y">
                  {orderData.orderDetails.map((item) => (
                    <div key={item.id} className="py-4 flex items-center">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                        <Image
                          src={item.imageUrl}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-black hover:text-blue-600"
                          >
                            {item.product.name}
                          </Link>
                        </h4>
                        <p className="text-gray-600 text-sm">
                          Màu: {colorToVietnamese[item.color]}, Kích thước:{" "}
                          {item.size}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        {item.discountPrice !== item.originalPrice ? (
                          <>
                            <p className="text-gray-500 line-through text-sm">
                              {item.originalPrice.toLocaleString("vi-VN")} VND
                            </p>
                            <p className="text-black font-medium">
                              {item.discountPrice.toLocaleString("vi-VN")} VND
                            </p>
                          </>
                        ) : (
                          <p className="text-black font-medium">
                            {item.originalPrice.toLocaleString("vi-VN")} VND
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng giá trị đơn hàng */}
              <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                  Tổng tiền
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span>
                      {orderData.subtotal.toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                  {orderData.voucherDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="text-red-600">
                        -{orderData.voucherDiscount.toLocaleString("vi-VN")} VND
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-dashed border-gray-200 mt-2">
                    <span className="font-medium">Tổng cộng:</span>
                    <span className="font-bold text-lg">
                      {orderData.total.toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
