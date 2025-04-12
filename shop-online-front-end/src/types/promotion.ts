// Interface cho khuyến mãi hiển thị
export interface Promotion {
  id: string;
  title: string;
  expiry: string;
  code: string;
}

// Interface cho voucher từ API
export interface Voucher {
  id: number;
  code: string;
  discount: number;
  discountType: string;
  minOrderValue: number;
}
