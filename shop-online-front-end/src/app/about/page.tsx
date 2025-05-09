import { Metadata } from "next";
import { createAboutMetadata } from "@/utils/metadata";
import AboutPageClient from "@/components/About/AboutPageClient";

// Metadata tĩnh cho trang Giới thiệu
export const metadata: Metadata = createAboutMetadata();

export default function AboutPage() {
  return <AboutPageClient />;
}
