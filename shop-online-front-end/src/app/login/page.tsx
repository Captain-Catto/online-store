import { Metadata } from "next";
import { Suspense } from "react";
import { createLoginMetadata } from "@/utils/metadata";
import LoginPageClient from "@/components/Auth/LoginPageClient";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

// Static metadata for login page
export const metadata: Metadata = createLoginMetadata();

export default function LoginPage() {
  return (
    <Suspense
      fallback={<LoadingSpinner size="lg" text="Đang tải trang đăng nhập..." />}
    >
      <LoginPageClient />
    </Suspense>
  );
}
