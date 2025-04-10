// src/app/api/auth/refresh-token/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("Refreshing token...");

    // Gọi API backend để làm mới token
    const response = await fetch(
      "http://localhost:3000/api/auth/refresh-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Để gửi kèm cookies
      }
    );

    if (!response.ok) {
      console.error("Backend refresh token failed:", response.status);
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Token refreshed successfully");

    return NextResponse.json({ accessToken: data.accessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
