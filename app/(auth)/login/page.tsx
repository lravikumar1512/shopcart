"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Loader2, ShieldCheck, UserCheck } from "lucide-react";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useToast } from "@/components/ui/toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { setUser } = useAuthStore();
  const { mergeGuestCartOnLogin } = useCartStore();
  const { success, error } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();

    const loginEmail = customEmail || email;
    const loginPassword = customPass || password;

    if (!loginEmail || !loginPassword) {
      error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Login failed");
        setLoading(false);
        return;
      }

      setUser(data.user);
      success(`Welcome back, ${data.user.name.split(" ")[0]}!`);

      // Merge guest cart items into database
      await mergeGuestCartOnLogin();

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      error(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const quickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleLogin(undefined, demoEmail, demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="bg-white rounded-sm shadow-md border border-gray-200 grid grid-cols-1 md:grid-cols-5 max-w-3xl w-full overflow-hidden">
        {/* Left blue decorative panel (Flipkart style) */}
        <div className="md:col-span-2 bg-[#2874f0] text-white p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Login</h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Get access to your Orders, Wishlist, Recommendations & Personalized Offers
            </p>
          </div>
          <div className="hidden md:block">
            <span className="text-3xl font-black italic tracking-tight text-white flex items-center">
              Shop<span className="text-[#ff9f00]">Kart</span>
            </span>
            <p className="text-[11px] text-blue-200 mt-1">India&apos;s Preferred Online Shopping Mall</p>
          </div>
        </div>

        {/* Right Form Area (3 cols) */}
        <div className="md:col-span-3 p-8 flex flex-col justify-between">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full text-xs py-2.5 pl-9 pr-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full text-xs py-2.5 pl-9 pr-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-tight">
              By continuing, you agree to ShopKart&apos;s{" "}
              <span className="text-[#2874f0] hover:underline cursor-pointer">Terms of Use</span> and{" "}
              <span className="text-[#2874f0] hover:underline cursor-pointer">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full fk-btn-orange py-3 font-bold text-sm shadow flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? "Logging in..." : "Login"}</span>
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Instant 1-Click Demo Logins:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickFill("admin@shopkart.com", "Admin@123")}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold transition text-left border border-blue-200"
              >
                <ShieldCheck className="w-4 h-4 text-[#2874f0] flex-shrink-0" />
                <span className="truncate">Admin (admin@shopkart.com)</span>
              </button>

              <button
                type="button"
                onClick={() => quickFill("rahul@gmail.com", "Customer@123")}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-xs font-semibold transition text-left border border-emerald-200"
              >
                <UserCheck className="w-4 h-4 text-[#388e3c] flex-shrink-0" />
                <span className="truncate">Customer (Rahul)</span>
              </button>
            </div>
          </div>

          {/* Sign up prompt */}
          <div className="mt-5 text-center text-xs text-gray-600">
            New to ShopKart?{" "}
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-[#2874f0] font-bold hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-[#2874f0]"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
