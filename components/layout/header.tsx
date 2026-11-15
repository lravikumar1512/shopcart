"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  ChevronDown,
  Package,
  ShieldCheck,
  LogOut,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { useCartStore } from "@/lib/store/use-cart-store";

function HeaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, checkAuth, logout } = useAuthStore();
  const { totalQuantity, setLoggedIn, fetchCart } = useCartStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchTerm(q);
  }, [searchParams]);

  // Auth & Cart synchronization
  useEffect(() => {
    checkAuth().then((currentUser) => {
      if (currentUser) {
        setLoggedIn(true);
        fetchCart();
      } else {
        setLoggedIn(false);
        fetchCart();
      }
    });
  }, [checkAuth, fetchCart, setLoggedIn]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#2874f0] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex flex-col group">
              <span className="text-2xl font-black italic tracking-tight text-white flex items-center">
                Shop<span className="text-[#ff9f00]">Kart</span>
              </span>
              <span className="text-[11px] italic text-[#f0f0f0] flex items-center gap-0.5 -mt-1 group-hover:underline">
                Explore <span className="text-[#ffe500] font-bold">Plus</span>
                <span className="text-[#ffe500] text-xs">✦</span>
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-2xl relative hidden md:block"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full bg-white text-[#212121] text-sm py-2.5 pl-4 pr-11 rounded-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-400"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-[#2874f0] hover:text-[#1259c7]"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-5 sm:gap-7">
            {/* User Dropdown / Login Button */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 font-semibold text-sm hover:text-gray-100 py-1"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-[#212121] rounded-sm shadow-xl border border-gray-100 py-1 z-50 text-sm animate-in fade-in-50">
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="font-semibold text-gray-800 truncate">{user.email}</p>
                      {user.role === "ADMIN" && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                          ADMIN
                        </span>
                      )}
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition"
                    >
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition"
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/account#addresses"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>Saved Addresses</span>
                    </Link>

                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-gray-100 mt-1"></div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-white text-[#2874f0] font-semibold text-sm px-6 py-1.5 rounded-sm shadow-sm hover:bg-gray-50 transition"
              >
                Login
              </Link>
            )}

            {/* Cart Link */}
            <Link
              href="/cart"
              className="flex items-center gap-2 font-semibold text-sm hover:text-gray-100 transition relative"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#ff6161] text-white text-[11px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border border-[#2874f0]">
                    {totalQuantity > 99 ? "99+" : totalQuantity}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for products, brands..."
              className="w-full bg-white text-[#212121] text-sm py-2 pl-3.5 pr-10 rounded-sm shadow-sm focus:outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              aria-label="Search mobile"
              className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-[#2874f0]"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-[#212121] border-b shadow-lg py-3 px-4 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-3 text-sm">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 font-medium text-gray-700 hover:text-blue-600"
            >
              All Products
            </Link>
            <Link
              href="/products?deal=true"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 font-medium text-amber-600"
            >
              Deals of the Day 🔥
            </Link>
            {user ? (
              <>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 font-medium text-gray-700"
                >
                  My Orders
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 font-medium text-gray-700"
                >
                  My Account
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 font-bold text-blue-600"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="py-1.5 text-left font-medium text-rose-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 font-bold text-blue-600"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default function Header() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 bg-[#2874f0] text-white shadow-md h-16">
          <div className="max-w-7xl mx-auto px-4 flex items-center h-full">
            <span className="text-2xl font-black italic tracking-tight text-white">
              Shop<span className="text-[#ff9f00]">Kart</span>
            </span>
          </div>
        </header>
      }
    >
      <HeaderContent />
    </Suspense>
  );
}
