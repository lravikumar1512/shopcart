"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Loader2,
  RotateCcw,
  Package,
  ExternalLink,
  CreditCard,
  User,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, OrderStatusType } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";

export default function AdminOrdersPage() {
  const { success, error } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Refund Modal State
  const [refundingOrderId, setRefundingOrderId] = useState<string | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchTerm) params.set("q", searchTerm);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to update order status");
        return;
      }

      success(data.message || `Status updated to ${newStatus}`);
      loadOrders();
    } catch (err: any) {
      error(err.message || "Failed to update status");
    }
  };

  const handleIssueRefund = async (orderId: string) => {
    try {
      setIsRefunding(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refund" }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Refund failed");
        return;
      }

      success("Refund processed via Razorpay!");
      setRefundingOrderId(null);
      loadOrders();
    } catch (err: any) {
      error(err.message || "Refund error");
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-xs text-gray-500">
          Track fulfillment status, update shipping milestones and issue Razorpay refunds
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-sm p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded text-gray-700"
          >
            Search
          </button>
        </form>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 border border-gray-300 rounded bg-white text-gray-800"
          >
            <option value="">All Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="PAID">Paid</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 flex justify-center text-[#2874f0]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 text-center text-gray-400 text-xs rounded border">
          No orders found matching the filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusInfo = ORDER_STATUS_LABELS[order.status as OrderStatusType] || {
              label: order.status,
              color: "bg-gray-100 text-gray-800",
            };

            const isPaidOnline =
              order.paymentMethod === "RAZORPAY" &&
              order.payments.some((p: any) => p.status === "COMPLETED");

            return (
              <div
                key={order.id}
                className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-5 space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b text-xs">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-gray-900">
                        #{order.orderNumber}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="font-semibold text-gray-700">{order.user?.name}</span>
                      <span className="text-gray-400">({order.user?.email})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 mt-0.5 block">
                      Ordered at: {formatDateTime(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded font-mono uppercase text-gray-700">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-100 text-xs"
                    >
                      <div className="relative w-12 h-12 rounded bg-white border p-0.5 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="48px"
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-medium text-gray-900 truncate">{item.title}</p>
                        <span className="text-gray-500 text-[11px]">
                          Qty: {item.quantity} • {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Actions: Status Dropdown & Refund Button */}
                <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Update Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="p-1.5 border border-gray-300 rounded bg-white text-xs font-semibold text-gray-800"
                    >
                      <option value="PLACED">PLACED</option>
                      <option value="PAID">PAID</option>
                      <option value="PACKED">PACKED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Issue Refund option if paid online and not already refunded */}
                    {isPaidOnline && order.status !== "REFUNDED" && (
                      <button
                        onClick={() => setRefundingOrderId(order.id)}
                        className="px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-50 border border-purple-300 rounded transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Issue Refund</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Refund Confirmation Modal */}
                {refundingOrderId === order.id && (
                  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded p-6 max-w-md w-full shadow-2xl text-xs space-y-4">
                      <h3 className="text-sm font-bold text-gray-900">
                        Confirm Razorpay Refund
                      </h3>
                      <p className="text-gray-600">
                        Are you sure you want to refund <strong>{formatCurrency(order.totalAmount)}</strong> for Order #{order.orderNumber}? The amount will be refunded directly to customer via Razorpay.
                      </p>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          disabled={isRefunding}
                          onClick={() => setRefundingOrderId(null)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={isRefunding}
                          onClick={() => handleIssueRefund(order.id)}
                          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded"
                        >
                          {isRefunding ? "Processing..." : "Confirm & Refund"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
