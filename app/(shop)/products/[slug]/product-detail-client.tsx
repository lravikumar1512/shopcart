"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingCart,
  Zap,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
} from "lucide-react";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import ReviewSection from "@/components/product/review-section";

interface ProductDetailClientProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice: number;
    discountPercent: number;
    stock: number;
    sku?: string | null;
    rating: number;
    reviewCount: number;
    highlights?: string | null;
    specifications?: string | null;
    category?: { id: string; name: string; slug: string };
    brand?: { id: string; name: string; slug: string };
    images: { id: string; url: string; isPrimary: boolean; altText?: string | null }[];
    reviews: any[];
  };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { success, error } = useToast();

  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Parse highlights & specifications safely
  let highlightsList: string[] = [];
  try {
    if (product.highlights) highlightsList = JSON.parse(product.highlights);
  } catch {
    // fallback if raw string
  }

  let specsObj: Record<string, Record<string, string>> = {};
  try {
    if (product.specifications) specsObj = JSON.parse(product.specifications);
  } catch {
    // fallback
  }

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      error("This product is currently out of stock");
      return;
    }
    setIsAdding(true);
    const result = await addItem(product, 1);
    setIsAdding(false);
    if (result.success) {
      success("Added to cart successfully!");
    } else {
      error(result.error || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (product.stock <= 0) {
      error("This product is currently out of stock");
      return;
    }
    setIsBuyingNow(true);
    const result = await addItem(product, 1);
    setIsBuyingNow(false);
    if (result.success) {
      router.push("/checkout");
    } else {
      error(result.error || "Failed to proceed to checkout");
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Product Card */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery & Action CTA buttons (5 Cols) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-96 scrollbar-none">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 border rounded p-1 flex-shrink-0 transition ${
                      selectedImage === img.url
                        ? "border-[#2874f0] ring-1 ring-[#2874f0]"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || product.title}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image */}
            <div className="flex-1 relative h-72 sm:h-96 border border-gray-100 rounded flex items-center justify-center p-4 overflow-hidden bg-white group">
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Flipkart CTA Buttons (Add to Cart & Buy Now) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.stock <= 0}
              className="fk-btn-yellow flex items-center justify-center gap-2 py-3.5 text-sm sm:text-base font-bold disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{isAdding ? "Adding..." : "ADD TO CART"}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isBuyingNow || product.stock <= 0}
              className="fk-btn-orange flex items-center justify-center gap-2 py-3.5 text-sm sm:text-base font-bold disabled:opacity-50"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>{isBuyingNow ? "Processing..." : "BUY NOW"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Product Info & Specs (7 Cols) */}
        <div className="md:col-span-7 flex flex-col space-y-4">
          {/* Breadcrumb / Brand */}
          <div className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
            <span>Home</span>
            <span>&gt;</span>
            <span>{product.category?.name || "Products"}</span>
            <span>&gt;</span>
            <span className="text-gray-700 font-semibold">{product.brand?.name}</span>
          </div>

          {/* Title */}
          <h1 className="text-lg sm:text-xl font-medium text-gray-900 leading-snug">
            {product.title}
          </h1>

          {/* Rating & Assured Badge */}
          <div className="flex items-center gap-3">
            {product.rating > 0 ? (
              <span className="fk-badge-rating text-sm px-2 py-0.5">
                {product.rating.toFixed(1)} <Star className="w-3 h-3 fill-current" />
              </span>
            ) : null}
            <span className="text-xs text-gray-500 font-semibold">
              {product.reviewCount.toLocaleString()} Ratings & {product.reviews.length} Reviews
            </span>
            <span className="italic font-black text-sm text-[#2874f0]">
              FAssured
            </span>
          </div>

          {/* Price Strip */}
          <div className="space-y-1">
            <div className="text-xs text-[#388e3c] font-bold">Special price</div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatCurrency(product.discountPrice)}
              </span>
              {product.discountPercent > 0 && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#388e3c]">
                    {product.discountPercent}% off
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-400">Inclusive of all taxes</p>
          </div>

          {/* Stock Availability */}
          <div className="pt-1">
            {product.stock > 10 ? (
              <span className="inline-flex items-center gap-1 text-xs text-[#388e3c] font-bold bg-green-50 px-2 py-0.5 rounded">
                <Check className="w-3.5 h-3.5" /> In Stock ({product.stock} units available)
              </span>
            ) : product.stock > 0 ? (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Hurry! Only {product.stock} units left in stock.
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                Currently Out of Stock
              </span>
            )}
          </div>

          {/* Available Offers */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wide">
              Available Offers
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <Tag className="w-3.5 h-3.5 text-[#388e3c] mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-gray-900">Bank Offer:</strong> 10% Instant Discount on HDFC & ICICI Bank Credit Cards up to ₹1,500.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Tag className="w-3.5 h-3.5 text-[#388e3c] mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-gray-900">Special Price:</strong> Get extra 5% off (price inclusive of cashback/coupon).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Tag className="w-3.5 h-3.5 text-[#388e3c] mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-gray-900">Partner Offer:</strong> Sign up for ShopKart Pay Later & get ₹500 welcome voucher.
                </span>
              </li>
            </ul>
          </div>

          {/* Delivery & Trust highlights */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-center text-xs text-gray-600">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-[#2874f0]" />
              <span className="font-medium text-[11px]">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-[#2874f0]" />
              <span className="font-medium text-[11px]">7 Days Replacement</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#2874f0]" />
              <span className="font-medium text-[11px]">1 Year Warranty</span>
            </div>
          </div>

          {/* Highlights */}
          {highlightsList.length > 0 && (
            <div className="pt-2">
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wide mb-2">
                Highlights
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                {highlightsList.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          <div className="pt-2">
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wide mb-1.5">
              Description
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications Table */}
          {Object.keys(specsObj).length > 0 && (
            <div className="pt-3">
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wide mb-3">
                Specifications
              </h3>
              <div className="border border-gray-200 rounded divide-y divide-gray-200 text-xs">
                {Object.entries(specsObj).map(([categoryName, specs]) => (
                  <div key={categoryName} className="p-3">
                    <h4 className="font-bold text-gray-800 mb-2 text-xs">{categoryName}</h4>
                    <div className="space-y-1.5">
                      {Object.entries(specs).map(([key, val]) => (
                        <div key={key} className="grid grid-cols-3 gap-2">
                          <span className="text-gray-400 font-medium">{key}</span>
                          <span className="col-span-2 text-gray-800 font-normal">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verified Reviews Section */}
      <ReviewSection
        productId={product.id}
        rating={product.rating}
        reviewCount={product.reviewCount}
        reviews={product.reviews}
      />
    </div>
  );
}
