"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { OrderService } from "@/services/OrderService";

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
        const vnp_TxnRef = searchParams.get("vnp_TxnRef");

        if (!vnp_ResponseCode) {
          setStatus("error");
          setMessage("Không nhận được phản hồi từ VNPay");
          return;
        }
        // kiểm tra mã phản hồi từ VNPay dựa vào mã vnp_ResponseCode
        if (vnp_ResponseCode === "00") {
          // Payment successful
          setStatus("success");
          setMessage("Thanh toán thành công");

          if (vnp_TxnRef) {
            // Extract orderId from TxnRef (format: orderId_timestamp)
            const orderId = vnp_TxnRef.split("_")[0];
            sessionStorage.setItem("recentOrderId", orderId);

            // Update payment status to "Paid" (paymentStatusId=2)
            try {
              await OrderService.updatePaymentStatus(orderId, 2);
            } catch {
              // tiếp tục luồng thanh toán ngay cả khi không thành công
            }
          }

          setTimeout(() => {
            router.push("/order-confirmation");
          }, 2000);
        } else {
          // Payment failed
          setStatus("error");
          setMessage(getErrorMessage(vnp_ResponseCode));

          setTimeout(() => {
            router.push("/cart");
          }, 3000);
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          (error as string) || "Có lỗi xảy ra khi xử lý kết quả thanh toán"
        );
      }
    };

    processPayment();
  }, [router, searchParams]);

  // Helper function to get error message based on response code
  const getErrorMessage = (responseCode: string) => {
    const errorMessages: Record<string, string> = {
      "01": "Giao dịch đã tồn tại",
      "02": "Merchant không hợp lệ",
      "03": "Dữ liệu gửi sang không đúng định dạng",
      "04": "Khởi tạo GD không thành công do Website đang bị tạm khóa",
      "05": "Giao dịch không thành công do: Quý khách nhập sai mật khẩu quá số lần quy định",
      "07": "Giao dịch bị nghi ngờ là gian lận",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
      "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán",
      "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản không đủ số dư để thực hiện giao dịch",
      "65": "Giao dịch không thành công do: Tài khoản vượt quá hạn mức giao dịch trong ngày",
      "75": "Ngân hàng thanh toán đang bảo trì",
      "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định",
      "99": "Lỗi không xác định",
    };

    return (
      errorMessages[responseCode] ||
      "Thanh toán không thành công. Vui lòng thử lại."
    );
  };

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
        <div className="w-fit mx-auto bg-white p-6 rounded-lg shadow-md">
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
