"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  Package,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, OrderStatusType } from "@/lib/constants";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Admin overview error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2874f0]" />
        <span className="text-sm font-semibold">Loading dashboard analytics...</span>
      </div>
    );
  }

  const { metrics, lowStockProducts, recentOrders, salesChart } = data || {
    metrics: { totalRevenue: 0, totalOrders: 0, ordersToday: 0, totalUsers: 0, lowStockCount: 0 },
    lowStockProducts: [],
    recentOrders: [],
    salesChart: [],
  };

  const maxChartVal = Math.max(...(salesChart.map((s: any) => s.revenueRupees) || [100]), 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-xs text-gray-500">
          Store performance, real-time sales metrics and inventory indicators
        </p>
      </div>

      {/* KPI Cards (4 Cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-sm p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1 block">
              {formatCurrency(metrics.totalRevenue)}
            </span>
            <span className="text-[11px] text-[#388e3c] font-semibold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Live Gross Sales
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-[#388e3c] rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Orders Today */}
        <div className="bg-white rounded-sm p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Orders Today
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1 block">
              {metrics.ordersToday}
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5 block">
              {metrics.totalOrders} Lifetime Orders
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-[#2874f0] rounded-full flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-sm p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Customers
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1 block">
              {metrics.totalUsers}
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5 block">
              Registered Accounts
            </span>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-sm p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Low-Stock Warnings
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1 block">
              {metrics.lowStockCount}
            </span>
            <span className="text-[11px] text-rose-500 mt-0.5 block">
              Items with stock &le; 10
            </span>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sales Chart (Last 30 Days) */}
      <div className="bg-white rounded-sm p-5 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Sales Revenue (Last 30 Days)
            </h2>
            <p className="text-xs text-gray-400">Daily gross revenue in Indian Rupees</p>
          </div>
          <span className="text-xs font-bold text-[#2874f0] bg-blue-50 px-2.5 py-1 rounded">
            Live Analytics
          </span>
        </div>

        {/* Bar Chart Visualization */}
        <div className="pt-4">
          <div className="h-44 flex items-end gap-1.5 sm:gap-2 px-2 border-b border-gray-200 overflow-x-auto">
            {salesChart.map((day: any) => {
              const heightPercent = maxChartVal > 0 ? (day.revenueRupees / maxChartVal) * 100 : 0;
              return (
                <div
                  key={day.date}
                  className="flex-1 min-w-[14px] flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none transition shadow whitespace-nowrap z-20">
                    {day.date}: ₹{day.revenueRupees.toLocaleString("en-IN")}
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full bg-[#2874f0] group-hover:bg-[#1259c7] rounded-t transition-all duration-300 min-h-[4px]"
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 pt-1.5 px-2">
            <span>30 days ago</span>
            <span>15 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Low Stock Alert & Recent Orders (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Low Stock Table (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-sm p-4 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Low Stock Alerts
            </h3>
            <Link
              href="/admin/products"
              className="text-xs text-[#2874f0] hover:underline font-semibold"
            >
              Manage
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">All inventory is healthy!</p>
          ) : (
            <div className="divide-y divide-gray-100 text-xs">
              {lowStockProducts.map((p: any) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-gray-800 truncate">{p.title}</p>
                    <span className="text-[11px] text-gray-400">
                      Price: {formatCurrency(p.discountPrice)}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-700 text-[11px]">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-sm p-4 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-[#2874f0]" /> Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-[#2874f0] hover:underline font-semibold"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {recentOrders.map((ord: any) => {
              const statusInfo = ORDER_STATUS_LABELS[ord.status as OrderStatusType] || {
                label: ord.status,
                color: "bg-gray-100 text-gray-800",
              };

              return (
                <div key={ord.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">#{ord.orderNumber}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{ord.user?.name}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {ord.items.length} {ord.items.length === 1 ? "item" : "items"} • {formatDate(ord.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">
                      {formatCurrency(ord.totalAmount)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
