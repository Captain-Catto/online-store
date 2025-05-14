import { Metadata } from "next";
import { createResetPasswordMetadata } from "@/utils/metadata";
import ResetPasswordPageClient from "@/components/Auth/ResetPasswordPageClient";

// Define Props type for async params
interface Props {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Use static metadata
export const metadata: Metadata = createResetPasswordMetadata();

// Async Server Component
export default async function ResetPasswordPage({ params }: Props) {
  const { token } = await params; // Await params to get token
  return <ResetPasswordPageClient token={token} />;
}
