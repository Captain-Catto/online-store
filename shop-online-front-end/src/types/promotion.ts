// Interface cho khuyến mãi hiển thị
export interface Promotion {
  id: string | number;
  title: string;
  expiry: string;
  code: string;
  minOrderValue: number;
  description?: string;
  type?: string;
  value?: number;
}

// Interface cho voucher từ API
export interface Voucher {
  id: number;
  code: string;
  discount: number;
  discountType: string;
  minOrderValue: number;
}
