import React from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8 py-3">
        {children}
      </main>
      <Footer />
    </div>
  );
}
