import { Metadata } from "next";
import { createWishlistMetadata } from "@/utils/metadata";
import WishlistPageClient from "@/components/Account/WishlistPageClient";

// Tạo metadata động cho trang wishlist
export const metadata: Metadata = createWishlistMetadata();

export default function WishlistPage() {
  return <WishlistPageClient />;
}
