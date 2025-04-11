import React from "react";

interface OrderSummaryProps {
  subtotal: number;
  onCheckout: () => void;
  isEmpty?: boolean;
}

export default function OrderSummary({
  subtotal,
  onCheckout,
  isEmpty = false,
}: OrderSummaryProps) {
  return (
    <div className="w-full lg:w-96 mt-6 lg:mt-0">
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>

        <div className="flex justify-between py-2">
          <span className="text-gray-600">Tạm tính</span>
          <span className="font-medium">
            {subtotal.toLocaleString("vi-VN")} VND
          </span>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        <button
          onClick={onCheckout}
          disabled={isEmpty}
          className={`w-full py-3 rounded ${
            isEmpty
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          } transition`}
        >
          Thanh toán
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Phí vận chuyển và mã giảm giá sẽ được tính ở bước thanh toán
        </p>
      </div>
    </div>
  );
}
