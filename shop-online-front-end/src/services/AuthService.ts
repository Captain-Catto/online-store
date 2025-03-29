const COOKIE_NAME = "refreshToken";

// Hàm Helper để lấy giá trị từ cookie
const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;

  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  if (!cookieValue) return null;

  return cookieValue.split("=")[1];
};

export const AuthService = {
  isLoggedIn: (): boolean => {
    if (typeof window !== "undefined") {
      return !!getCookie(COOKIE_NAME);
    }
    return false;
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return getCookie(COOKIE_NAME);
    }
    return null;
  },

  // Nếu cần thiết, bạn có thể thêm các phương thức khác
  // như setToken và removeToken, nhưng trong trường hợp
  // cookie được đặt từ backend, bạn chỉ cần các phương thức
  // để kiểm tra
};
