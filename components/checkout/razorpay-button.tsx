"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface RazorpayButtonProps {
  orderId: string;
  razorpayOrder: {
    providerOrderId: string;
    amount: number;
    currency: string;
  };
  keyId: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  onSuccess: (paymentData: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayButton({
  orderId,
  razorpayOrder,
  keyId,
  user,
  onSuccess,
}: RazorpayButtonProps) {
  const router = useRouter();
  const { error, success } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    // If mock or test credentials, give option to open Razorpay or simulate verified instant payment
    if (keyId.includes("mock") || keyId.includes("test")) {
      setShowSimulateModal(true);
      setLoading(false);
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      error("Failed to load Razorpay payment gateway. Please check your internet connection.");
      setLoading(false);
      return;
    }

    try {
      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "ShopKart",
        description: `Payment for Order #${orderId.slice(-6)}`,
        order_id: razorpayOrder.providerOrderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || "9999999999",
        },
        theme: {
          color: "#2874f0",
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              error(verifyData.error || "Payment signature verification failed");
              return;
            }

            success("Payment successful! Your order has been placed.");
            onSuccess(verifyData.order);
          } catch (err: any) {
            error(err.message || "Failed to verify payment with server");
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            error("Payment window closed by user");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        error(resp.error?.description || "Payment failed at gateway");
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay initiation error:", err);
      error("Could not initiate payment");
      setLoading(false);
    }
  };

  // Instant simulator for Test/Dev verification
  const handleSimulatePayment = async (status: "success" | "fail") => {
    setLoading(true);
    setShowSimulateModal(false);

    if (status === "fail") {
      error("Simulated payment failure. Order remains pending.");
      setLoading(false);
      return;
    }

    try {
      const mockPaymentId = `pay_mock_${Date.now()}`;
      const mockSignature = `sig_mock_${Date.now()}`;

      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          razorpayOrderId: razorpayOrder.providerOrderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        }),
      });

      const data = await verifyRes.json();
      if (!verifyRes.ok) {
        error(data.error || "Payment verification failed");
        setLoading(false);
        return;
      }

      success("Payment verified and confirmed!");
      onSuccess(data.order);
    } catch (err: any) {
      error(err.message || "Simulation error");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full fk-btn-orange flex items-center justify-center gap-2 py-3.5 text-base shadow"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5" />
        )}
        <span>{loading ? "Processing Payment..." : "Pay via Razorpay / UPI"}</span>
      </button>

      {/* Simulator Modal for Sandbox / Dev */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 border-t-4 border-[#2874f0]">
            <div className="flex items-center gap-2.5 text-[#2874f0] font-black text-xl mb-1">
              <span>Razorpay</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                Test Checkout
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Razorpay Test Mode / Simulation. Choose how to test the server-side HMAC verification and stock decrement transaction:
            </p>

            <div className="bg-gray-50 p-3 rounded text-xs space-y-1 mb-5 border text-gray-700">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold">₹{(razorpayOrder.amount / 100).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Reference:</span>
                <span className="font-mono">{razorpayOrder.providerOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{user.name} ({user.email})</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => handleSimulatePayment("success")}
                className="w-full flex items-center justify-center gap-2 bg-[#388e3c] hover:bg-[#2e7d32] text-white py-2.5 rounded font-bold text-sm shadow transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Successful Payment</span>
              </button>

              <button
                onClick={() => handleSimulatePayment("fail")}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded font-bold text-sm shadow transition"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Simulate Failed Payment</span>
              </button>

              <button
                onClick={() => setShowSimulateModal(false)}
                className="w-full text-center text-xs text-gray-500 hover:underline pt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
