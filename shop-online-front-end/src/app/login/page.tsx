"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { AuthService } from "@/services/AuthService";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/account";

  // State cho form đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);

  // Xử lý đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({ email: "", password: "", general: "" });

    // Validate
    let isValid = true;

    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email không được để trống" }));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Email không hợp lệ" }));
      isValid = false;
    }

    if (!password) {
      setErrors((prev) => ({
        ...prev,
        password: "Mật khẩu không được để trống",
      }));
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      // Gọi API login qua AuthService
      const result = await AuthService.login(email, password, rememberMe);

      // Nếu login thành công, lưu trạng thái và redirect
      if (result.accessToken) {
        console.log("Đăng nhập thành công, chuyển hướng đến:", returnUrl);
        router.replace(returnUrl);
      } else {
        throw new Error("Không nhận được token, đăng nhập thất bại");
      }
    } catch (error: unknown) {
      // Xử lý lỗi
      if (error instanceof Error) {
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Đăng nhập thất bại.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Đã xảy ra lỗi không xác định.",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">Đăng nhập</h1>

          {errors.general && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="password" className="font-medium">
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className={`w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>

            {/* Register link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Bạn chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:underline"
                >
                  Đăng ký
                </Link>
              </span>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
