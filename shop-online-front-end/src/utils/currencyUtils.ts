export const formatCurrency = (amount: number) => {
  // Định dạng tiền tệ cơ bản
  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  // Thay thế ký tự "đ" hoặc "VND" bằng "₫"
  return formatted.replace(/đ|VND/g, "₫");
};

// sửa input number có phân cách ở phần ngàn
export const formatNumberWithCommas = (value: number): string => {
  // Định dạng lại với dấu phẩy
  return value.toLocaleString("vi-VN");
};

// Hàm chuyển đổi từ định dạng có dấu phân cách sang số
export const parseCurrency = (value: string): number => {
  // Loại bỏ tất cả dấu phân cách và các ký tự không phải số
  const plainNumber = value.replace(/[^\d]/g, "");
  return plainNumber ? parseInt(plainNumber, 10) : 0;
};
