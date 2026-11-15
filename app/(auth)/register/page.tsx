"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, Phone, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useToast } from "@/components/ui/toast";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { setUser } = useAuthStore();
  const { mergeGuestCartOnLogin } = useCartStore();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setUser(data.user);
      success("Account created successfully!");

      await mergeGuestCartOnLogin();

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      error(err.message || "Registration error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="bg-white rounded-sm shadow-md border border-gray-200 grid grid-cols-1 md:grid-cols-5 max-w-3xl w-full overflow-hidden">
        {/* Left blue decorative panel */}
        <div className="md:col-span-2 bg-[#2874f0] text-white p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Looks like you&apos;re new here!</h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Sign up with your details to unlock exclusive discounts, Flipkart-speed deliveries and personalized shopping recommendations.
            </p>
          </div>
          <div className="hidden md:block">
            <span className="text-3xl font-black italic tracking-tight text-white flex items-center">
              Shop<span className="text-[#ff9f00]">Kart</span>
            </span>
          </div>
        </div>

        {/* Right Form Area (3 cols) */}
        <div className="md:col-span-3 p-8 flex flex-col justify-between">
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full text-xs py-2.5 pl-9 pr-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs py-2.5 pl-9 pr-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mobile Number (optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full text-xs py-2.5 pl-9 pr-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password (min 6 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full text-xs py-2.5 pl-9 pr-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full fk-btn-orange py-3 font-bold text-sm shadow flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? "Creating Account..." : "CONTINUE"}</span>
            </button>
          </form>

          {/* Login prompt */}
          <div className="mt-6 text-center text-xs text-gray-600">
            Existing User?{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-[#2874f0] font-bold hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-[#2874f0]"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
