import { Metadata } from "next";
import { createOrdersMetadata } from "@/utils/metadata";
import AccountLayout from "@/components/Account/AccountLayout";

export const metadata: Metadata = createOrdersMetadata();

export default function OrdersPage() {
  return <AccountLayout defaultActiveTab="orders" />;
}
