import React from "react";
import { ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PriceDetailsCardProps {
  totalQuantity: number;
  subtotal: number; // in paise
  discount: number; // in paise
  deliveryCharge: number; // in paise
  finalAmount: number; // in paise
  ctaButton?: React.ReactNode;
}

export default function PriceDetailsCard({
  totalQuantity,
  subtotal,
  discount,
  deliveryCharge,
  finalAmount,
  ctaButton,
}: PriceDetailsCardProps) {
  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden sticky top-20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide">
          Price Details
        </h3>
      </div>

      {/* Breakdown */}
      <div className="p-4 space-y-3.5 text-sm text-gray-800">
        <div className="flex items-center justify-between">
          <span>Price ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-[#388e3c]">
          <span>Discount</span>
          <span>- {formatCurrency(discount)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Delivery Charges</span>
          <span>
            {deliveryCharge === 0 ? (
              <span className="text-[#388e3c] font-semibold">FREE</span>
            ) : (
              formatCurrency(deliveryCharge)
            )}
          </span>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-3.5 flex items-center justify-between text-base font-bold text-gray-900">
          <span>Total Amount</span>
          <span>{formatCurrency(finalAmount)}</span>
        </div>

        {discount > 0 && (
          <div className="pt-1 text-[#388e3c] font-semibold text-xs border-t border-gray-100">
            You will save {formatCurrency(discount)} on this order! 🎉
          </div>
        )}
      </div>

      {/* Optional Checkout CTA */}
      {ctaButton && <div className="p-4 pt-0">{ctaButton}</div>}

      {/* Trust Badge */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
        <ShieldCheck className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <span>Safe and Secure Payments. 100% Authentic products.</span>
      </div>
    </div>
  );
}
