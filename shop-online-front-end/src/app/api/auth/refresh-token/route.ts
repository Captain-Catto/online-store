import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config/apiConfig";
export async function POST() {
  try {
    // Gọi API backend để làm mới token
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: response.status }
      );
    }

    // Lấy data sau khi đã kiểm tra response.ok
    const data = await response.json();

    // Bây giờ data đã được định nghĩa
    const nextResponse = NextResponse.json({ accessToken: data.accessToken });

    // Chuyển tiếp cookies từ backend
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
