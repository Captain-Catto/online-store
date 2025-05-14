import { Metadata } from "next";
import { createOrderDetailMetadata } from "@/utils/metadata";
import OrderDetailPageClient from "@/components/Account/OrderDetailPageClient";

// Define Props type to handle async params and searchParams
type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Async page component
export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { orderId } = await params; // Await params to get orderId
  await searchParams; // Await searchParams if used
  return <OrderDetailPageClient orderId={orderId} />;
}

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId } = await params; // Await params to get orderId
  return createOrderDetailMetadata(orderId);
}
