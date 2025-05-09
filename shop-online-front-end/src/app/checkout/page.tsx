import { Metadata } from "next";
import { createCheckoutMetadata } from "@/utils/metadata";
import CheckoutPageClient from "@/components/Checkout/CheckoutPageClient";

// Metadata tĩnh cho trang thanh toán
export const metadata: Metadata = createCheckoutMetadata();

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
