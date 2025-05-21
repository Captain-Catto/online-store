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
