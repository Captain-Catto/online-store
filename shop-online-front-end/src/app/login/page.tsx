import { Metadata } from "next";
import { createLoginMetadata } from "@/utils/metadata";
import LoginPageClient from "@/components/Auth/LoginPageClient";

// Sử dụng metadata tĩnh cho trang đăng nhập
export const metadata: Metadata = createLoginMetadata();

// Server Component không chứa logic, chỉ render Client Component
export default function LoginPage() {
  return <LoginPageClient />;
}
