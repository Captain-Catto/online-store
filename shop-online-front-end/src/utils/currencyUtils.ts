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
