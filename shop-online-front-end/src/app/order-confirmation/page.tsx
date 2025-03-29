"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Link from "next/link";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId");
  const [orderId, setOrderId] = useState(orderIdFromUrl || "ORDER-PENDING");

  // Giả lập thông tin đơn hàng - trong thực tế bạn sẽ lấy từ params hoặc context
  const [orderInfo, setOrderInfo] = useState({
    totalAmount: searchParams.get("total") || "1,290,000",
    shippingAddress:
      searchParams.get("address") ||
      "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    expectedDelivery: "3-5 ngày làm việc",
  });

  // Tạo random orderId sau khi component đã mount trên client
  useEffect(() => {
    // Chỉ tạo random ID nếu không có ID từ URL
    if (!orderIdFromUrl) {
      setOrderId("ORD" + Math.floor(Math.random() * 100000));
    }
  }, [orderIdFromUrl]);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-green-600"
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-lg text-gray-600">
              Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi
            </p>
          </div>

          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Mã đơn hàng</h3>
                <p className="font-medium text-lg">{orderId}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500 mb-1">Tổng thanh toán</h3>
                <p className="font-medium text-lg">
                  {orderInfo.totalAmount} VND
                </p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500 mb-1">
                  Địa chỉ giao hàng
                </h3>
                <p className="font-medium">{orderInfo.shippingAddress}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500 mb-1">
                  Thời gian giao hàng dự kiến
                </h3>
                <p className="font-medium">{orderInfo.expectedDelivery}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Chúng tôi sẽ gọi điện/nhắn tin zalo <br /> xác nhận đơn hàng sớm
              nhất có thể.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 inline-block"
              >
                Tiếp tục mua sắm
              </Link>

              <Link
                href="/account/orders"
                className="border border-black text-black px-6 py-3 rounded-full hover:bg-gray-100 inline-block"
              >
                Xem đơn hàng của tôi
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
