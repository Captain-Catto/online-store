/**
 * Kiểm tra định dạng email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra định dạng số điện thoại Việt Nam
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Định dạng số điện thoại Việt Nam (loại bỏ khoảng trắng, dấu gạch ngang)
  const phoneRegex = /^(0|\+84)(\d{9,10})$/;
  const phoneNumberCleaned = phone.replace(/[\s.-]/g, "");
  return phoneRegex.test(phoneNumberCleaned);
};

/**
 * Tạo validator cho form tài khoản người dùng
 */
export const validateAccountForm = (data: {
  name?: string;
  email?: string;
  phone?: string;
  birthdate?: string;
}) => {
  const errors: Record<string, string> = {};

  // Kiểm tra tên
  if (!data.name || data.name.trim() === "") {
    errors.name = "Họ tên không được để trống";
  }

  // Kiểm tra email
  if (data.email && !isValidEmail(data.email)) {
    errors.email = "Email không hợp lệ";
  }

  // Kiểm tra số điện thoại
  if (data.phone && !isValidPhoneNumber(data.phone)) {
    errors.phone = "Số điện thoại không hợp lệ";
  }

  return errors;
};
