import { Metadata } from "next";
import { Suspense } from "react";
import { createCheckoutMetadata } from "@/utils/metadata";
import CheckoutPageClient from "@/components/Checkout/CheckoutPageClient";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

// Static metadata for checkout page
export const metadata: Metadata = createCheckoutMetadata();

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <LoadingSpinner size="lg" text="Đang tải trang thanh toán..." />
      }
    >
      <CheckoutPageClient />
    </Suspense>
  );
}
