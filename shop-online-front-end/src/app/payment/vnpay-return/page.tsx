"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

function PaymentStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const processPayment = async () => {
      try {
        const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");

        if (!vnp_ResponseCode) {
          setStatus("error");
          setMessage("Không nhận được phản hồi từ VNPay");
          return;
        }

        if (vnp_ResponseCode === "00") {
          setStatus("success");
          setMessage("Thanh toán thành công");
          // Redirect to order confirmation after a short delay
          setTimeout(() => {
            router.push("/order-confirmation");
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Thanh toán không thành công. Vui lòng thử lại.");
          // Redirect back to cart after error
          setTimeout(() => {
            router.push("/cart");
          }, 3000);
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        setStatus("error");
        setMessage("Có lỗi xảy ra khi xử lý thanh toán");
      }
    };

    processPayment();
  }, [router, searchParams]);

  if (status === "loading") {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner size="lg" text="Đang xử lý thanh toán..." />
      </div>
    );
  }

  return (
    <div className="text-center py-10">
      {status === "success" ? (
        <>
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">{message}</h2>
          <p className="text-gray-600 mb-4">
            Đang chuyển hướng đến trang xác nhận đơn hàng...
          </p>
        </>
      ) : (
        <>
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">{message}</h2>
          <p className="text-gray-600 mb-4">
            Đang chuyển hướng về trang giỏ hàng...
          </p>
        </>
      )}
    </div>
  );
}

export default function VNPayReturnPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 min-h-screen">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
          <Suspense
            fallback={
              <div className="flex justify-center py-10">
                <LoadingSpinner size="lg" text="Đang tải..." />
              </div>
            }
          >
            <PaymentStatus />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
