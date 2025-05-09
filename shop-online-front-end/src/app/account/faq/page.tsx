import { Metadata } from "next";
import { createFaqMetadata } from "@/utils/metadata";
import AccountLayout from "@/components/Account/AccountLayout";

export const metadata: Metadata = createFaqMetadata();

export default function FaqPage() {
  return <AccountLayout defaultActiveTab="faq" />;
}
