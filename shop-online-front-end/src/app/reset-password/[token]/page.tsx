import { Metadata } from "next";
import { createResetPasswordMetadata } from "@/utils/metadata";
import ResetPasswordPageClient from "@/components/Auth/ResetPasswordPageClient";

// Định nghĩa props cho server component
interface Props {
  params: {
    token: string;
  };
}

// Sử dụng metadata tĩnh cho trang đặt lại mật khẩu
export const metadata: Metadata = createResetPasswordMetadata();

// Server Component truyền token từ URL vào Client Component
export default function ResetPasswordPage({ params }: Props) {
  return <ResetPasswordPageClient token={params.token} />;
}
