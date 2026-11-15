"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, OrderStatusType } from "@/lib/constants";

interface OrderItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatusType;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch((err) => console.error("Orders error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2874f0]" />
        <span className="text-sm font-medium">Loading your orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-8 sm:p-12 text-center max-w-xl mx-auto my-8">
        <div className="w-20 h-20 bg-blue-50 text-[#2874f0] rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">No Orders Placed Yet</h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          You haven&apos;t placed any orders yet. Check out our latest products and deals!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 fk-btn-yellow py-2.5 px-6 font-bold text-sm shadow"
        >
          <span>Start Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-xl font-bold text-gray-900">
          My Orders ({orders.length})
        </h1>
        <Link
          href="/products"
          className="text-xs font-semibold text-[#2874f0] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.map((order) => {
          const statusInfo = ORDER_STATUS_LABELS[order.status] || {
            label: order.status,
            color: "bg-gray-100 text-gray-800 border-gray-200",
          };

          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-sm shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition p-4 sm:p-5"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">
                    Order #{order.orderNumber}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{formatDate(order.createdAt)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Items in this Order */}
              <div className="py-3 divide-y divide-gray-50">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2 flex items-center gap-4">
                    <div className="relative w-14 h-14 border rounded p-1 flex-shrink-0 bg-white">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 text-xs sm:text-sm">
                      <p className="font-medium text-gray-800 line-clamp-1">{item.title}</p>
                      <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                    </div>
                    <div className="text-right text-xs sm:text-sm font-bold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Total Items: {order.items.reduce((s, i) => s + i.quantity, 0)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="text-base font-extrabold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
