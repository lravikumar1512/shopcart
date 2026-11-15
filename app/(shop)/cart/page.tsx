"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { formatCurrency } from "@/lib/utils";
import PriceDetailsCard from "@/components/cart/price-details-card";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    items,
    itemCount,
    totalQuantity,
    subtotal,
    discount,
    deliveryCharge,
    finalAmount,
    updateQuantity,
    removeItem,
    fetchCart,
    setLoggedIn,
  } = useCartStore();

  useEffect(() => {
    setLoggedIn(Boolean(user));
    fetchCart();
  }, [user, fetchCart, setLoggedIn]);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-8 sm:p-12 text-center max-w-2xl mx-auto my-8">
        <div className="w-24 h-24 bg-blue-50 text-[#2874f0] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Your Cart is Empty!</h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Explore our top categories and deals to add items to your shopping cart.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 fk-btn-yellow py-2.5 px-6 font-bold text-sm shadow"
        >
          <span>Shop Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left Column: Cart Items List (8 cols) */}
      <div className="lg:col-span-8 bg-white rounded-sm shadow-sm border border-gray-200 divide-y divide-gray-100">
        {/* Cart Header */}
        <div className="p-4 flex items-center justify-between">
          <h1 className="font-bold text-base text-gray-800">
            Shopping Cart ({itemCount} {itemCount === 1 ? "Product" : "Products"})
          </h1>
          <span className="text-xs text-gray-500">
            Deliver to: <strong className="text-gray-800">{user ? user.name : "Guest"}</strong>
          </span>
        </div>

        {/* Item Rows */}
        {items.map((item) => (
          <div key={item.productId} className="p-4 flex flex-col sm:flex-row gap-4 items-start">
            {/* Image */}
            <Link
              href={`/products/${item.slug}`}
              className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 border border-gray-100 rounded p-1 group"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="112px"
                className="object-contain group-hover:scale-105 transition"
              />
            </Link>

            {/* Info & Quantity */}
            <div className="flex-1 flex flex-col justify-between w-full">
              <div>
                <Link
                  href={`/products/${item.slug}`}
                  className="text-sm font-medium text-gray-800 hover:text-[#2874f0] line-clamp-2 transition leading-snug"
                >
                  {item.title}
                </Link>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                  <span className="text-base font-bold text-gray-900">
                    {formatCurrency(item.discountPrice)}
                  </span>
                  {item.discountPercent > 0 && (
                    <>
                      <span className="text-xs text-gray-400 line-through">
                        {formatCurrency(item.price)}
                      </span>
                      <span className="text-xs font-bold text-[#388e3c]">
                        {item.discountPercent}% off
                      </span>
                    </>
                  )}
                </div>

                {/* Stock alert */}
                {item.stock <= 5 && item.stock > 0 && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    Only {item.stock} units left in stock!
                  </p>
                )}
              </div>

              {/* Action buttons: Quantity +/- and Remove */}
              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-50">
                {/* Quantity Controls */}
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove item */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>REMOVE</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Place Order Footer on Cart */}
        <div className="p-4 bg-gray-50 flex justify-end">
          <button
            onClick={() => {
              if (!user) {
                router.push("/login?callbackUrl=/checkout");
              } else {
                router.push("/checkout");
              }
            }}
            className="fk-btn-orange py-3 px-10 text-sm font-bold shadow"
          >
            PLACE ORDER
          </button>
        </div>
      </div>

      {/* Right Column: Price Details (4 cols) */}
      <div className="lg:col-span-4">
        <PriceDetailsCard
          totalQuantity={totalQuantity}
          subtotal={subtotal}
          discount={discount}
          deliveryCharge={deliveryCharge}
          finalAmount={finalAmount}
          ctaButton={
            <button
              onClick={() => {
                if (!user) {
                  router.push("/login?callbackUrl=/checkout");
                } else {
                  router.push("/checkout");
                }
              }}
              className="w-full fk-btn-orange py-3 font-bold text-sm shadow"
            >
              PLACE ORDER
            </button>
          }
        />
      </div>
    </div>
  );
}
