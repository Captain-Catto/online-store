export class AuthClient {
  // Sửa file shop-online-front-end/src/services/AuthClient.ts
  static async fetchWithAuth(url: string, options: RequestInit = {}) {
    try {
      console.log("Sending request to:", url);

      // Lấy token từ sessionStorage
      const token = sessionStorage.getItem("authToken");
      console.log("Current token:", token ? "Available" : "Not available");

      if (!token) {
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }

      // Chuẩn bị headers với token hiện tại
      const headers = {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Thêm credentials: "include" vào request
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Thêm dòng này
      });

      console.log("Response status:", response.status);

      if (response.status === 401) {
        console.log("Token expired, attempting to refresh");

        // Thử refresh token và gọi lại API
        try {
          const refreshResponse = await fetch(
            `${url.split("/api/")[0]}/api/auth/refresh-token`,
            {
              method: "POST",
              credentials: "include",
            }
          );

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            sessionStorage.setItem("authToken", refreshData.accessToken);

            // Thử lại request ban đầu với token mới
            return await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshData.accessToken}`,
              },
              credentials: "include", // Thêm dòng này
            });
          } else {
            // Xóa token nếu refresh thất bại
            sessionStorage.removeItem("authToken");
            throw new Error(
              "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
            );
          }
        } catch (error) {
          throw error;
        }
      }

      return response;
    } catch (error) {
      console.error("AuthClient fetch error:", error);
      throw error;
    }
  }
}
