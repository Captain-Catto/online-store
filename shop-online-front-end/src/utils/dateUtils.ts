/**
 * Chuyển đổi định dạng ngày tháng thành chuỗi yyyy-MM-dd cho input HTML
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";

  try {
    // Nếu đã đúng định dạng yyyy-MM-dd, trả về ngay
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Parse định dạng có thể là dd/MM/yyyy hoặc MM/dd/yyyy
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        // Xử lý định dạng d/m/yyyy
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
          2,
          "0"
        )}`;
      }
      return "";
    }

    // Định dạng date object thành yyyy-MM-dd
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

/**
 * Hiển thị ngày theo định dạng Việt Nam
 */
export const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};
