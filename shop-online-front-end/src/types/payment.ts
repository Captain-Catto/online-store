export enum PaymentMethodId {
  COD = 1,
  MOMO = 2,
  ZALOPAY = 3,
}

export const PAYMENT_METHOD_NAMES: Record<PaymentMethodId, string> = {
  [PaymentMethodId.COD]: "Thanh toán khi nhận hàng (COD)",
  [PaymentMethodId.MOMO]: "Ví Momo",
  [PaymentMethodId.ZALOPAY]: "ZaloPay",
};
