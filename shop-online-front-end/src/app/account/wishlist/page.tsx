import { Metadata } from "next";
import { createWishlistMetadata } from "@/utils/metadata";
import AccountLayout from "@/components/Account/AccountLayout";

export const metadata: Metadata = createWishlistMetadata();

export default function WishlistPage() {
  return <AccountLayout defaultActiveTab="wishlist" />;
}
