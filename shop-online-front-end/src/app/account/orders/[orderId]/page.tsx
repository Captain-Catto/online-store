import { Metadata } from "next";
import { createOrderDetailMetadata } from "@/utils/metadata";
import OrderDetailPageClient from "@/components/Account/OrderDetailPageClient";

// Props cho generateMetadata và page component
type Props = {
  params: { orderId: string };
};

// Tạo metadata động dựa trên orderId
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const orderId = params.orderId;

  return createOrderDetailMetadata(orderId);
}

// Server Component - chỉ truyền orderId sang Client Component
export default function OrderDetailPage({ params }: Props) {
  return <OrderDetailPageClient orderId={params.orderId} />;
}
