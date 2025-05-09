import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { CartProvider } from "@/contexts/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Shop Online - Quần áo thời trang",
  },
  description:
    "Shop Online - Nơi mua sắm thời trang hàng đầu với nhiều sản phẩm đa dạng và chất lượng.",
  keywords: ["thời trang", "quần áo", "online store", "mua sắm"],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Shop Online",
    description:
      "Shop Online - Nơi mua sắm thời trang hàng đầu với nhiều sản phẩm đa dạng và chất lượng.",
    url: "https://yourwebsite.com",
    siteName: "Shop Online",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DeviceProvider>
          <CartProvider>
            <NavigationProvider>{children}</NavigationProvider>
          </CartProvider>
        </DeviceProvider>
      </body>
    </html>
  );
}
