"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Banners", href: "/admin/banners", icon: ImageIcon },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] p-4 flex flex-col shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 mb-6 bg-blue-50 text-blue-700 rounded-md">
        <ShieldCheck className="w-5 h-5 text-[#2874f0]" />
        <div>
          <span className="font-bold text-xs block">ShopKart Admin</span>
          <span className="text-[10px] text-blue-500">Store Management</span>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-sm font-semibold transition ${
                isActive
                  ? "bg-[#2874f0] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#2874f0] px-3 py-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
      </div>
    </aside>
  );
}
