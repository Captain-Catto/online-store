import { Metadata } from "next";
import { createAddressesMetadata } from "@/utils/metadata";
import AccountLayout from "@/components/Account/AccountLayout";

export const metadata: Metadata = createAddressesMetadata();

export default function AddressesPage() {
  return <AccountLayout defaultActiveTab="addresses" />;
}
