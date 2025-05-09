import { Metadata } from "next";
import { createAccountMetadata } from "@/utils/metadata";
import AccountLayout from "@/components/Account/AccountLayout";

export const metadata: Metadata = createAccountMetadata();

export default function AccountPage() {
  return <AccountLayout defaultActiveTab="account" />;
}
