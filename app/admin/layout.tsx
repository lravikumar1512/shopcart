import React from "react";
import Header from "@/components/layout/header";
import AdminNav from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | ShopKart",
  description: "Manage products, inventory, orders, refunds and banners",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f1f3f6]">
      <Header />
      <div className="flex flex-1">
        <AdminNav />
        <main className="flex-1 p-5 md:p-8 max-w-7xl overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
