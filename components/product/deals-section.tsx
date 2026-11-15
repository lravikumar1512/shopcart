"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import ProductCard from "./product-card";

interface DealsSectionProps {
  title: string;
  subtitle?: string;
  products: any[];
  viewAllLink?: string;
}

export default function DealsSection({
  title,
  subtitle,
  products,
  viewAllLink = "/products?deal=true",
}: DealsSectionProps) {
  // 24 hour countdown timer simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 40 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white rounded-sm shadow-sm p-4 mb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <span className="text-xs text-gray-500 font-medium">
              {subtitle}
            </span>
          )}

          {/* Clock timer */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="font-mono font-bold text-amber-700">
              {String(timeLeft.hours).padStart(2, "0")}h :{" "}
              {String(timeLeft.minutes).padStart(2, "0")}m :{" "}
              {String(timeLeft.seconds).padStart(2, "0")}s Left
            </span>
          </div>
        </div>

        <Link
          href={viewAllLink}
          className="inline-flex items-center justify-center gap-1 bg-[#2874f0] hover:bg-[#1259c7] text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-sm transition"
        >
          <span>VIEW ALL</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
