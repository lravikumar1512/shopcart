import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number; // MRP in paise
    discountPrice: number; // Selling price in paise
    discountPercent: number;
    rating: number;
    reviewCount: number;
    stock: number;
    images: { url: string; isPrimary?: boolean }[];
    category?: { name: string; slug: string };
    brand?: { name: string; slug: string };
    isDealOfTheDay?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-sm border border-transparent hover:border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col p-3.5 relative"
    >
      {/* Deal tag if applicable */}
      {product.isDealOfTheDay && (
        <span className="absolute top-2 left-2 z-10 bg-[#e53935] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
          DEAL OF THE DAY
        </span>
      )}

      {/* Image container */}
      <div className="relative w-full h-44 sm:h-52 mb-3 overflow-hidden flex items-center justify-center">
        <Image
          src={primaryImage}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Brand */}
        {product.brand && (
          <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">
            {product.brand.name}
          </span>
        )}

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-[#2874f0] transition-colors mb-1.5 leading-snug">
          {product.title}
        </h3>

        {/* Rating Badge */}
        <div className="flex items-center gap-2 mb-2">
          {product.rating > 0 ? (
            <span className="fk-badge-rating">
              {product.rating.toFixed(1)} <Star className="w-2.5 h-2.5 fill-current" />
            </span>
          ) : (
            <span className="text-[11px] text-gray-400">New Product</span>
          )}
          {product.reviewCount > 0 && (
            <span className="text-xs text-gray-400 font-normal">
              ({product.reviewCount.toLocaleString()})
            </span>
          )}
          {/* Assured Badge */}
          <span className="ml-auto text-[10px] italic font-black text-[#2874f0]">
            FAssured
          </span>
        </div>

        {/* Price Row */}
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-gray-900">
              {formatCurrency(product.discountPrice)}
            </span>
            {product.discountPercent > 0 && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-xs font-bold text-[#388e3c]">
                  {product.discountPercent}% off
                </span>
              </>
            )}
          </div>

          {/* Delivery & Stock notice */}
          <div className="mt-1 flex items-center justify-between text-[11px]">
            {product.stock <= 5 && product.stock > 0 ? (
              <span className="text-rose-600 font-semibold">Only {product.stock} left!</span>
            ) : product.stock === 0 ? (
              <span className="text-rose-600 font-semibold">Out of Stock</span>
            ) : (
              <span className="text-gray-500">Free delivery</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
