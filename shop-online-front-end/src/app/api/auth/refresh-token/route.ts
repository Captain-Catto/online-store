import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config/apiConfig";
export async function POST() {
  try {
    console.log("Refreshing token...");

    // Gọi API backend để làm mới token
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      // Log lỗi
      try {
        const errorData = await response.json();
        console.error("Backend refresh token error:", errorData);
      } catch {
        console.error(
          "Backend refresh token failed:",
          response.status,
          response.statusText
        );
      }

      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: response.status }
      );
    }

    // Lấy data sau khi đã kiểm tra response.ok
    const data = await response.json();
    console.log("Token refreshed successfully");

    // Bây giờ data đã được định nghĩa
    const nextResponse = NextResponse.json({ accessToken: data.accessToken });

    // Chuyển tiếp cookies từ backend
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
