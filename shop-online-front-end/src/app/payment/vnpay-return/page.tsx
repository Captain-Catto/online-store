"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

export default function VNPayReturnPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        // Tạo đối tượng từ tất cả các search params
        const vnpReturnData: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          vnpReturnData[key] = value;
        });

        // Gọi API xử lý kết quả thanh toán
        const response = await fetch(`/api/payments/vnpay/return`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(vnpReturnData),
        });

        const result = await response.json();

        if (result.success) {
          setSuccess(true);
          // Lấy orderId từ session storage hoặc từ kết quả trả về
          const orderId =
            sessionStorage.getItem("pendingVNPayOrderId") || result.orderId;

          // Lưu ID đơn hàng để hiển thị trang xác nhận
          sessionStorage.setItem("recentOrderId", orderId);
          sessionStorage.removeItem("pendingVNPayOrderId");

          // Chuyển hướng đến trang xác nhận đơn hàng sau 2 giây
          setTimeout(() => {
            router.push("/order-confirmation");
          }, 2000);
        } else {
          setError("Thanh toán không thành công: " + result.message);
        }
      } catch (error) {
        console.error("Lỗi xử lý kết quả thanh toán:", error);
        setError("Đã xảy ra lỗi khi xử lý kết quả thanh toán.");
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.size > 0) {
      processPaymentReturn();
    } else {
      setError("Không nhận được thông tin thanh toán");
      setLoading(false);
    }
  }, [searchParams, router]);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 min-h-screen">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Kết quả thanh toán
          </h1>

          {loading && (
            <div className="flex justify-center py-10">
              <LoadingSpinner size="lg" text="Đang xử lý thanh toán..." />
            </div>
          )}

          {success && !loading && (
            <div className="text-center">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold mb-2">
                Thanh toán thành công!
              </h2>
              <p className="mb-4">
                Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
              </p>
              <p className="text-sm text-gray-500">
                Đang chuyển hướng đến trang xác nhận đơn hàng...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">✗</div>
              <h2 className="text-xl font-semibold mb-2">
                Thanh toán thất bại
              </h2>
              <p className="text-red-500 mb-4">{error}</p>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => router.push("/account/orders")}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Xem đơn hàng
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  Về trang chủ
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
