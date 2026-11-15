"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ArrowLeft,
  MapPin,
  CreditCard,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_TIMELINE_STEPS, OrderStatusType } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";
import InvoiceDownload from "@/components/orders/invoice-download";

interface OrderDetailProps {
  params: { id: string };
}

export default function OrderDetailPage({ params }: OrderDetailProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = () => {
    fetch(`/api/orders/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then((data) => setOrder(data.order))
      .catch((err) => {
        console.error("Order fetch error:", err);
        error("Could not load order details");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const res = await fetch(`/api/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to cancel order");
        return;
      }

      success(data.message || "Order cancelled successfully");
      setShowCancelModal(false);
      fetchOrder();
    } catch (err: any) {
      error(err.message || "Error during cancellation");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2874f0]" />
        <span className="text-sm font-medium">Fetching order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-sm shadow-sm p-8 text-center max-w-lg mx-auto my-12">
        <p className="text-base font-bold text-gray-800 mb-2">Order Not Found</p>
        <p className="text-xs text-gray-500 mb-4">The requested order does not exist or you do not have permission to view it.</p>
        <Link href="/orders" className="text-xs font-bold text-[#2874f0] hover:underline">
          Return to My Orders
        </Link>
      </div>
    );
  }

  let addressData: any = {};
  try {
    addressData = JSON.parse(order.shippingAddress);
  } catch {
    addressData = { name: "Customer" };
  }

  const statusInfo = ORDER_STATUS_LABELS[order.status as OrderStatusType] || {
    label: order.status,
    color: "bg-gray-100 text-gray-800",
    desc: "",
  };

  // Determine current timeline progress index
  const currentStepIndex = ORDER_TIMELINE_STEPS.indexOf(order.status as OrderStatusType);
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const canCancel =
    order.status === "PLACED" || order.status === "PAID" || order.status === "PACKED";

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-1">
        <Link
          href="/orders"
          className="text-xs font-semibold text-[#2874f0] hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
        </Link>
        <InvoiceDownload order={order} />
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
        {/* Header Block */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-gray-900">
                Order #{order.orderNumber}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 border border-rose-300 hover:bg-rose-50 rounded transition"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Status Timeline */}
        <div className="p-5 sm:p-6">
          <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-4">
            Order Status Timeline
          </h3>

          {isCancelled ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded flex items-center gap-3 text-rose-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <div>
                <span className="font-bold text-sm block">Order {order.status}</span>
                <span className="text-xs text-rose-700">
                  {order.status === "REFUNDED"
                    ? "Full refund has been processed back to your original payment method."
                    : "This order was cancelled. Any inventory held has been restored."}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-between">
              {/* Connector line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-[#388e3c] -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${
                    currentStepIndex >= 0
                      ? (currentStepIndex / (ORDER_TIMELINE_STEPS.length - 1)) * 100
                      : 0
                  }%`,
                }}
              />

              {/* Step Dots */}
              {ORDER_TIMELINE_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                        isPassed
                          ? "bg-[#388e3c] border-[#388e3c] text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 fill-current" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={`mt-2 text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                        isCurrent
                          ? "text-[#388e3c]"
                          : isPassed
                          ? "text-gray-800"
                          : "text-gray-400"
                      }`}
                    >
                      {ORDER_STATUS_LABELS[step]?.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ordered Items List */}
        <div className="p-5">
          <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-3">
            Items Ordered ({order.items.length})
          </h3>

          <div className="divide-y divide-gray-100">
            {order.items.map((item: any) => (
              <div key={item.id} className="py-3 flex items-center gap-4">
                <div className="relative w-16 h-16 border rounded p-1 flex-shrink-0 bg-white">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 text-xs sm:text-sm">
                  <p className="font-medium text-gray-900 leading-snug">{item.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>Qty: {item.quantity}</span>
                    <span>•</span>
                    <span>Price: {formatCurrency(item.price)} each</span>
                  </div>
                </div>
                <div className="text-right font-bold text-sm text-gray-900">
                  {formatCurrency(item.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address & Payment Summary (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 p-5 bg-gray-50/30 text-xs">
          {/* Shipping Address */}
          <div className="pr-0 md:pr-4 pb-4 md:pb-0 space-y-1.5">
            <h4 className="font-bold text-gray-700 uppercase flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-[#2874f0]" /> Delivery Address
            </h4>
            <p className="font-bold text-gray-900 text-sm">{addressData.name}</p>
            <p className="text-gray-600 leading-relaxed">
              {addressData.street}, {addressData.locality && `${addressData.locality}, `}
              {addressData.city}, {addressData.state} - {addressData.pincode}
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-700">Phone:</strong> {addressData.phone}
            </p>
          </div>

          {/* Payment & Price Summary */}
          <div className="pl-0 md:pl-4 pt-4 md:pt-0 space-y-2">
            <h4 className="font-bold text-gray-700 uppercase flex items-center gap-1.5 mb-2">
              <CreditCard className="w-3.5 h-3.5 text-[#2874f0]" /> Payment & Price Details
            </h4>
            <div className="flex justify-between text-gray-600">
              <span>Payment Mode:</span>
              <strong className="text-gray-900 uppercase">{order.paymentMethod}</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal (MRP):</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#388e3c]">
              <span>Discount Savings:</span>
              <span>- {formatCurrency(order.discount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charges:</span>
              <span>{order.deliveryCharge === 0 ? "FREE" : formatCurrency(order.deliveryCharge)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-gray-900">
              <span>Total Amount:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Order Cancellation</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              Are you sure you want to cancel order <strong>#{order.orderNumber}</strong>?
              {order.paymentMethod === "RAZORPAY" && order.status === "PAID"
                ? " Since this order was paid online, a full refund will automatically be processed to your source account."
                : " This action cannot be undone."}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                disabled={cancelling}
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition"
              >
                No, Keep Order
              </button>
              <button
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
