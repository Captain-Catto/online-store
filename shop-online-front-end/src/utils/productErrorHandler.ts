/**
 * Phân tích và trả về thông báo lỗi từ API khi cập nhật sản phẩm
 * @param error Đối tượng lỗi từ API
 * @returns Thông báo lỗi đã được định dạng
 */
export const getProductErrorMessage = (error: unknown): string => {
  if (!error) return "Đã xảy ra lỗi không xác định";

  if (error instanceof Error) {
    const message = error.message || "";

    // Kiểm tra các trường hợp lỗi phổ biến
    if (message.includes("Validation error")) {
      return "Lỗi xác thực dữ liệu: Có thể bạn đang thêm biến thể với màu sắc và kích thước trùng lặp.";
    }

    if (message.includes("duplicate")) {
      return "Lỗi dữ liệu trùng lặp: Màu sắc và kích thước này đã tồn tại.";
    }

    if (message.includes("Token")) {
      return "Lỗi xác thực: Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.";
    }

    // Xử lý lỗi liên quan đến hình ảnh
    if (message.includes("Lỗi khi đặt ảnh chính")) {
      if (message.includes("không tìm thấy")) {
        return "Không tìm thấy hình ảnh để đặt làm ảnh chính. Có thể hình ảnh đã bị xóa.";
      }
      if (message.includes("không thuộc")) {
        return "Hình ảnh này không thuộc về sản phẩm hiện tại.";
      }
      return "Không thể đặt ảnh chính. Vui lòng thử lại sau.";
    }

    if (
      message.includes("Lỗi khi thêm hình ảnh") ||
      message.includes("Lỗi khi xóa hình ảnh")
    ) {
      return "Có lỗi khi thao tác với hình ảnh. Vui lòng thử lại sau.";
    }

    // Trả về thông báo gốc nếu không phải các trường hợp trên
    return message;
  }

  // Nếu không phải Error object
  return "Đã xảy ra lỗi không xác định khi cập nhật sản phẩm";
};

/**
 * Xử lý lỗi khi cập nhật biến thể sản phẩm
 * @param errorResponse Response từ API
 * @returns Thông báo lỗi đã được định dạng
 */
export const handleProductVariantError = async (
  errorResponse: Response
): Promise<string> => {
  const errorMsg = "Có lỗi khi cập nhật biến thể sản phẩm.";

  try {
    const errorData = await errorResponse.json();
    if (errorData && errorData.message) {
      if (
        errorData.message.includes("Validation error") ||
        errorData.message.includes("duplicate")
      ) {
        return "Lỗi xác thực: Màu sắc và kích thước này đã tồn tại trong sản phẩm.";
      }
      return errorData.message;
    }
  } catch (e) {
    // Nếu không parse được JSON
    console.error("Failed to parse error response:", e);
    // Trả về thông báo lỗi mặc định
    return errorMsg;
  }

  return errorMsg;
};
