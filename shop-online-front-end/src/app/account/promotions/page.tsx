import { Metadata } from "next";
import { createPromotionsMetadata } from "@/utils/metadata";
import AccountLayout from "@/components/Account/AccountLayout";

export const metadata: Metadata = createPromotionsMetadata();

export default function PromotionsPage() {
  return <AccountLayout defaultActiveTab="promotions" />;
}
