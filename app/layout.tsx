import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "ShopKart - Online Shopping India | Mobiles, Electronics, Fashion & More",
  description: "Shop for Mobiles, Electronics, Laptops, Fashion, Home Appliances and more at India's favorite shopping destination.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f1f3f6]">
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
