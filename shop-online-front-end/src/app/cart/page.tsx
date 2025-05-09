import { Metadata } from "next";
import { createCartMetadata } from "@/utils/metadata";
import CartPageClient from "@/components/Cart/CartPageClient";

export const metadata: Metadata = createCartMetadata();

export default function CartPage() {
  return <CartPageClient />;
}
