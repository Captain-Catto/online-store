"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export default function ForgotPasswordPageClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra");
      }

      setSuccess(true);
    } catch (error) {
      console.error("Lỗi quên mật khẩu:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Không thể gửi email đặt lại mật khẩu"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">Quên mật khẩu</h1>

          {success ? (
            <div className="p-4 mb-6 text-sm text-green-700 bg-green-100 rounded-lg flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-green-500 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-medium mb-2">
                Gửi yêu cầu thành công!
              </p>
              <p className="text-center">
                Email hướng dẫn đặt lại mật khẩu đã được gửi đến {email}. Vui
                lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
              </p>
              <Link
                href="/login"
                className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}

              <p className="mb-6 text-gray-600">
                Nhập email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block mb-2 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  {loading ? "Đang xử lý..." : "Gửi link đặt lại mật khẩu"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
