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
    // Kiểm tra cả cookie và localStorage
    if (typeof window !== "undefined") {
      return (
        !!getCookie("auth_status") ||
        localStorage.getItem("isLoggedIn") === "true"
      );
    }
    return false;
  },

  login: async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<any> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng nhập thất bại");
      }

      const data = await response.json();

      // 1. Lưu accessToken trong memory hoặc sessionStorage (tồn tại trong tab)
      sessionStorage.setItem("authToken", data.accessToken);

      // 2. Đặt cookie cho trạng thái đăng nhập với thời hạn dựa vào rememberMe
      const expiry = rememberMe ? 30 : 1; // 30 ngày hoặc 1 ngày
      document.cookie = `auth_status=true; max-age=${
        expiry * 24 * 60 * 60
      }; path=/; samesite=strict`;

      // 3. Lưu trạng thái đăng nhập ở localStorage để dự phòng
      localStorage.setItem("isLoggedIn", "true");

      // 4. Chỉ lưu thông tin phi nhạy cảm của user
      if (data.user) {
        const safeUserData = {
          id: data.user.id,
          name: data.user.username,
          email: data.user.email,
          role: data.user.roleId,
        };
        localStorage.setItem("user", JSON.stringify(safeUserData));
      }

      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Gọi API logout
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // Xóa cookie
      document.cookie = `auth_status=; max-age=0; path=/`;

      // Xóa sessionStorage
      sessionStorage.removeItem("authToken");

      // Xóa localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout failed:", error);
      // Vẫn xóa dữ liệu phía client ngay cả khi API lỗi
      document.cookie = `auth_status=; max-age=0; path=/`;
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
    }
  },
};

//schema cho user
export interface User {
  email: string;
  password: string;
}

// hàm xử lý để tạo user
export const createUser = async (user: User) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error("Đăng ký thất bại");
  }

  const data = await response.json();
  return data;
};
