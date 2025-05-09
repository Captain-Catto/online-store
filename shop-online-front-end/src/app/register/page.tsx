import { Metadata } from "next";
import { createRegisterMetadata } from "@/utils/metadata";
import RegisterPageClient from "@/components/Auth/RegisterPageClient";

// Sử dụng metadata tĩnh cho trang đăng ký
export const metadata: Metadata = createRegisterMetadata();

// Server Component không chứa logic, chỉ render Client Component
export default function RegisterPage() {
  return <RegisterPageClient />;
}
