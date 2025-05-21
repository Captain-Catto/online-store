export enum PaymentMethodId {
  COD = 1,
  MOMO = 2,
  ZALOPAY = 3,
  VNPAY = 4,
}

export const PAYMENT_METHOD_NAMES: Record<PaymentMethodId, string> = {
  [PaymentMethodId.COD]: "Thanh toán khi nhận hàng (COD)",
  [PaymentMethodId.MOMO]: "Ví Momo",
  [PaymentMethodId.ZALOPAY]: "ZaloPay",
  [PaymentMethodId.VNPAY]: "Thanh toán qua VNPAY",
};

export enum PaymentStatusId {
  PENDING = 1,
  PAID = 2,
  FAILED = 3,
  REFUNDED = 4,
  CANCELLED = 5,
}

export const PAYMENT_STATUS_NAMES: Record<PaymentStatusId, string> = {
  [PaymentStatusId.PENDING]: "Chưa thanh toán",
  [PaymentStatusId.PAID]: "Đã thanh toán",
  [PaymentStatusId.FAILED]: "Thanh toán thất bại",
  [PaymentStatusId.REFUNDED]: "Đã hoàn tiền",
  [PaymentStatusId.CANCELLED]: "Đã hủy thanh toán",
};

// Helper function to get payment method name
export const getPaymentMethodName = (paymentMethodId: number): string => {
  return (
    PAYMENT_METHOD_NAMES[paymentMethodId as PaymentMethodId] || "Không xác định"
  );
};

// Helper function to get payment status name
export const getPaymentStatusName = (paymentStatusId: number): string => {
  return (
    PAYMENT_STATUS_NAMES[paymentStatusId as PaymentStatusId] || "Không xác định"
  );
};
