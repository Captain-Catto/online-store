import { Metadata } from "next";
import { createForgotPasswordMetadata } from "@/utils/metadata";
import ForgotPasswordPageClient from "@/components/Auth/ForgotPasswordPageClient";

// Sử dụng metadata tĩnh cho trang quên mật khẩu
export const metadata: Metadata = createForgotPasswordMetadata();

// Server Component không chứa logic, chỉ render Client Component
export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
