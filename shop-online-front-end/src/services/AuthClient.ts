import { jwtDecode } from "jwt-decode";
import { AuthService } from "./AuthService";
import { API_BASE_URL } from "@/config/apiConfig";

// Interface for JWT payload
interface JwtPayload {
  id: number;
  username: string;
  role: number;
  exp: number;
  iat: number;
}

// For handling multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Function to notify all subscribers with the new token
function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// Function to add subscribers
function addSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

export class AuthClient {
  static async refreshToken(): Promise<string | null> {
    // Nếu đang refresh, chờ kết quả
    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        addSubscriber((token) => resolve(token));
      });
    }

    isRefreshing = true;

    try {
      // Kiểm tra token hiện tại
      const token = sessionStorage.getItem("authToken");

      if (token) {
        try {
          // Kiểm tra xem token có hợp lệ không
          const decodedToken = jwtDecode<JwtPayload>(token);
          const currentTime = Date.now() / 1000;

          // Nếu token còn hạn và không gần hết hạn (còn hơn 5 phút)
          if (decodedToken.exp > currentTime + 300) {
            isRefreshing = false;
            return token;
          }
        } catch {
          // Token không hợp lệ, tiếp tục để refresh
        }
      } else {
        // "Không tìm thấy token trong session, tiến hành refresh"
      }

      // Gọi API refresh token
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(API_BASE_URL + "/auth/refresh-token", {
        method: "POST",
        credentials: "include", // Quan trọng: gửi cookies
        signal: controller.signal, // Để hủy yêu cầu nếu quá thời gian
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Gọi API logout để xóa cookie refreshToken ở server
        if (response.status === 401) {
          try {
            await fetch(API_BASE_URL + "/auth/logout", {
              method: "POST",
              credentials: "include",
            });
            // xóa thông tin đăng nhập ở client
            document.cookie = `auth_status=; max-age=0; path=/`;
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("user");
          } catch {
            // Vẫn phải xóa cookie ngay cả khi API lỗi
            document.cookie = `auth_status=; max-age=0; path=/`;
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("user");
          }
        }

        // Xóa thông tin đăng nhập ở client
        sessionStorage.removeItem("authToken");
        isRefreshing = false;
        return null;
      }

      const data = await response.json();
      const newToken = data.accessToken;

      if (!newToken) {
        isRefreshing = false;
        return null;
      }

      // Lưu token mới
      sessionStorage.setItem("authToken", newToken);

      // Thông báo cho các subscribers
      onRefreshed(newToken);
      isRefreshing = false;

      return newToken;
    } catch {
      isRefreshing = false;
      return null;
    }
  }

  static async fetchWithAuth(url: string, options: RequestInit = {}) {
    try {
      // Lấy token từ sessionStorage
      let token = sessionStorage.getItem("authToken");

      // Nếu có token, kiểm tra hợp lệ
      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const currentTime = Date.now() / 1000;

          // Nếu token gần hết hạn hoặc đã hết hạn, thử refresh
          if (decoded.exp <= currentTime + 300) {
            // Token gần hết hạn, thử refresh
            const newToken = await this.refreshToken();
            if (newToken) {
              token = newToken;
            }
            // Nếu không refresh được, tiếp tục dùng token cũ
          }
        } catch {
          // Token không hợp lệ, thử refresh
          const newToken = await this.refreshToken();
          if (newToken) {
            token = newToken;
          } else {
            throw new Error("Token không hợp lệ và không thể refresh");
          }
        }
      } else if (AuthService.isLoggedIn()) {
        // Không có token nhưng có dấu hiệu đăng nhập
        const newToken = await this.refreshToken();
        if (newToken) {
          token = newToken;
        } else {
          throw new Error("Thiếu token và không thể refresh");
        }
      } else {
        throw new Error("Không có quyền truy cập");
      }

      // Thêm token vào headers
      const headers = {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Gọi API với token đã kiểm tra
      return fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    } catch (error) {
      throw error;
    }
  }
}
