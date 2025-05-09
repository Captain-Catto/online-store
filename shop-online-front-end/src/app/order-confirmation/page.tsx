import { Metadata } from "next";
import { createOrderConfirmationMetadata } from "@/utils/metadata";
import OrderConfirmationPageClient from "@/components/OrderConfirmation/OrderConfirmationPageClient";

// Metadata tĩnh cho trang xác nhận đơn hàng
export const metadata: Metadata = createOrderConfirmationMetadata();

export default function OrderConfirmationPage() {
  return <OrderConfirmationPageClient />;
}
