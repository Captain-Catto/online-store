import { Metadata } from "next";
import { createContactMetadata } from "@/utils/metadata";
import ContactPageClient from "@/components/Contact/ContactPageClient";

// Metadata tĩnh cho trang liên hệ
export const metadata: Metadata = createContactMetadata();

export default function ContactPage() {
  return <ContactPageClient />;
}
