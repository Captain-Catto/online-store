import { API_BASE_URL } from "@/config/apiConfig";
import { jwtDecode } from "jwt-decode";

// Interface for the decoded JWT payload
export interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

//schema cho user
export interface User {
  email: string;
  password: string;
}

// Hàm Helper để lấy giá trị từ cookie
export const getCookie = (name: string): string | null => {
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
    rememberMe: boolean
  ): Promise<{
    accessToken: string;
    user: { id: string; username: string; email: string; roleId: string };
  }> => {
    try {
      const response = await fetch(API_BASE_URL + "/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Quan trọng: để gửi và nhận cookies
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng nhập thất bại");
      }

      const data = await response.json();
      console.log("Login response data:", data);

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
      // decode jwt-token response data
      const decodedToken = jwtDecode<JwtPayload>(data.accessToken);

      const safeUserData = {
        id: decodedToken.id.toString(),
        name: decodedToken.username,
        email: email,
        role: decodedToken.role,
      };
      console.log("safeUserData", safeUserData);
      localStorage.setItem("user", JSON.stringify(safeUserData));

      console.log("Login successful:", data);

      // Kích hoạt sự kiện đăng nhập thành công
      const loginSuccessEvent = new CustomEvent("auth-login-success");
      window.dispatchEvent(loginSuccessEvent);

      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Gọi API logout với timeout để tránh chờ quá lâu
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(API_BASE_URL + "/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Quan trọng: để gửi và nhận cookies
          signal: controller.signal,
        });

        if (!response.ok) {
          console.warn(`Logout API returned status ${response.status}`);
        }
      } catch (apiError) {
        console.warn(
          "API logout failed, continuing with client logout:",
          apiError
        );
      } finally {
        clearTimeout(timeoutId);
      }

      // Xóa tất cả cookies liên quan đến auth
      const cookies = ["auth_status", "refreshToken", "accessToken"];
      cookies.forEach((cookieName) => {
        document.cookie = `${cookieName}=; max-age=0; path=/; samesite=strict`;
        // Nếu có domain cụ thể
        document.cookie = `${cookieName}=; max-age=0; path=/; domain=${window.location.hostname}; samesite=strict`;
      });

      // Xóa sessionStorage
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("cartData"); // Xóa cả cache giỏ hàng nếu có

      // Xóa localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");

      // Kích hoạt sự kiện đăng xuất thành công
      const logoutSuccessEvent = new CustomEvent("auth-logout-success");
      window.dispatchEvent(logoutSuccessEvent);

      // Đảm bảo thời gian đủ để các component khác phản ứng
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log("Logout completed successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      // Vẫn xóa dữ liệu phía client ngay cả khi API lỗi
      document.cookie = `auth_status=; max-age=0; path=/`;
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");

      // Vẫn dispatch event để các components khác cập nhật
      const logoutErrorEvent = new CustomEvent("auth-logout-error");
      window.dispatchEvent(logoutErrorEvent);
    }
  },

  // Phương thức để kiểm tra người dùng có phải admin không
  isAdmin: (): boolean => {
    if (typeof window === "undefined") return false;

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return false;

      const user = JSON.parse(userStr);
      return user.role === 1 || user.role === 2;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  },
  // Hàm để khởi tạo xác thực khi trang web tải lên
  initAuth: async (): Promise<boolean> => {
    // Nếu có dấu hiệu đăng nhập, thử refresh token
    if (AuthService.isLoggedIn()) {
      try {
        // Import AuthClient dynamically để tránh circular dependency
        const { AuthClient } = await import("./AuthClient");
        const newToken = await AuthClient.refreshToken();
        return !!newToken;
      } catch (error) {
        console.error("Lỗi khởi tạo xác thực:", error);
        return false;
      }
    }
    return false;
  },
};

// hàm xử lý để tạo user
export const createUser = async (user: User) => {
  // lấy token từ sessionStorage
  const response = await fetch(API_BASE_URL + "/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("Email đã tồn tại. Vui lòng thử lại!");
  }

  const data = await response.json();
  return data;
};
