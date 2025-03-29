import PromoCodeInput from "./PromoCodeInput";

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  promoDiscount: number;
  deliveryFee: number;
  total: number;
  onApplyPromo: (code: string) => void;
  onCheckout: () => void;
}

export default function OrderSummary({
  subtotal,
  discount,
  promoDiscount,
  deliveryFee,
  total,
  onApplyPromo,
  onCheckout,
}: OrderSummaryProps) {
  return (
    <div
      className="flex-1 p-4 rounded border-gray-300 shadow-lg h-fit space-y-4"
      style={{ position: "sticky", top: "4rem" }}
    >
      <h3 className="font-bold text-lg">Tất cả đơn hàng</h3>
      <div className="flex justify-between">
        <span>Tạm tính</span>
        <span>{subtotal.toLocaleString("vi-VN")} VND</span>
      </div>
      <div className="flex justify-between">
        <span>Giảm giá</span>
        {discount === 0 ? (
          <span>0 VND</span>
        ) : (
          <span>- {discount.toLocaleString("vi-VN")} VND</span>
        )}
      </div>
      <div className="flex justify-between">
        <span>Mã giảm giá</span>
        {promoDiscount === 0 ? (
          <span>0 VND</span>
        ) : (
          <span>- {promoDiscount.toLocaleString("vi-VN")} VND</span>
        )}
      </div>
      <div className="flex justify-between">
        <span>Phí giao hàng</span>
        <span>{deliveryFee.toLocaleString("vi-VN")} VND</span>
      </div>
      <div className="flex justify-between font-bold">
        <span>Tổng</span>
        <span>{total.toLocaleString("vi-VN")} VND</span>
      </div>
      <PromoCodeInput onApply={onApplyPromo} />
      <button
        onClick={onCheckout}
        className="w-full mt-4 bg-black text-white py-2 rounded"
      >
        Checkout
      </button>
    </div>
  );
}
